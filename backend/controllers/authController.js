const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { customerRegistrationSchema, loginSchema } = require('../schemas/authSchemas');

const generateToken = (id, email, role) => {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });
};

// Register Customer
exports.registerCustomer = async (req, res) => {
  const validation = customerRegistrationSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ message: validation.error.issues[0].message, errors: validation.error.issues });
  }
  const { name, email, password, phone } = validation.data;

  try {
    const [existing] = await db.execute(
      'SELECT email FROM customers WHERE email = ? UNION SELECT email FROM sellers WHERE email = ? UNION SELECT email FROM admins WHERE email = ?',
      [email, email, email]
    );
    if (existing.length > 0) return res.status(409).json({ message: 'Email already in use' });

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    // Transaction: create customer + cart atomically
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.execute(
        'INSERT INTO customers (name, email, password_hash, phone) VALUES (?, ?, ?, ?)',
        [name, email, hash, phone || null]
      );
      await connection.execute('INSERT INTO carts (customer_id) VALUES (?)', [result.insertId]);
      await connection.commit();

      const token = generateToken(result.insertId, email, 'CUSTOMER');
      res.status(201).json({ message: 'Customer registered', token, user: { id: result.insertId, name, email, role: 'CUSTOMER' } });
    } catch (txErr) {
      await connection.rollback();
      throw txErr;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error(error);
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already in use' });
    res.status(500).json({ message: 'Server error' });
  }
};

// Unified Login — checks admins -> sellers -> customers
exports.login = async (req, res) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({ message: validation.error.issues[0].message, errors: validation.error.issues });
  }
  const { email, password, role: normalizedRole } = validation.data;

  try {
    let user = null;
    let role = null;

    // Check Admins first
    const [admins] = await db.execute('SELECT admin_id AS id, name, email, password_hash FROM admins WHERE email = ?', [email]);
    if (admins.length > 0) { user = admins[0]; role = 'ADMIN'; }

    // Then Sellers
    if (!user) {
      const [sellers] = await db.execute('SELECT seller_id AS id, seller_name AS name, email, password_hash FROM sellers WHERE email = ?', [email]);
      if (sellers.length > 0) { user = sellers[0]; role = 'SELLER'; }
    }

    // Then Customers
    if (!user) {
      const [customers] = await db.execute('SELECT customer_id AS id, name, email, password_hash FROM customers WHERE email = ?', [email]);
      if (customers.length > 0) { user = customers[0]; role = 'CUSTOMER'; }
    }

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    if (normalizedRole && normalizedRole !== role) {
      return res.status(403).json({ message: 'This account is not registered for the selected portal' });
    }

    // Role is resolved from DB — never sent by the client or harcoded (as per requirements of 60%)
    const token = generateToken(user.id, user.email, role);
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Logout — blacklist token so it cannot be reused
exports.logout = async (req, res) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) return res.status(400).json({ message: 'No token provided' });

  try {
    const decoded = jwt.decode(token);
    if (decoded && decoded.exp) {
      const expiresAt = new Date(decoded.exp * 1000);
      await db.execute('INSERT INTO token_blacklist (token, expires_at) VALUES (?, ?)', [token, expiresAt]);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};
