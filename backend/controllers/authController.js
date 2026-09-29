const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { customerRegistrationSchema, loginSchema } = require('../schemas/authSchemas');

const profileRoles = {
  CUSTOMER: { table: 'customers', idColumn: 'customer_id', nameColumn: 'name' },
  SELLER: { table: 'sellers', idColumn: 'seller_id', nameColumn: 'seller_name' },
  ADMIN: { table: 'admins', idColumn: 'admin_id', nameColumn: 'name' },
};

const getProfileRole = (role) => profileRoles[role];

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
      res.status(201).json({ message: 'Customer registered', token, user: { id: result.insertId, name, email, role: 'CUSTOMER', profile_image: null } });
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
    const [admins] = await db.execute('SELECT admin_id AS id, name, email, password_hash, profile_image FROM admins WHERE email = ?', [email]);
    if (admins.length > 0) { user = admins[0]; role = 'ADMIN'; }

    // Then Sellers
    if (!user) {
      const [sellers] = await db.execute('SELECT seller_id AS id, seller_name AS name, email, password_hash, profile_image FROM sellers WHERE email = ?', [email]);
      if (sellers.length > 0) { user = sellers[0]; role = 'SELLER'; }
    }

    // Then Customers
    if (!user) {
      const [customers] = await db.execute('SELECT customer_id AS id, name, email, password_hash, profile_image FROM customers WHERE email = ?', [email]);
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
    res.json({ message: 'Login successful', token, user: { id: user.id, name: user.name, email: user.email, role, profile_image: user.profile_image } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getProfile = async (req, res) => {
  const profileRole = getProfileRole(req.user.role);
  if (!profileRole) return res.status(403).json({ message: 'Unsupported account role' });

  try {
    const [rows] = await db.execute(
      `SELECT ${profileRole.nameColumn} AS name, email, profile_image FROM ${profileRole.table} WHERE ${profileRole.idColumn} = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Account not found' });
    res.json({ success: true, data: { ...rows[0], id: req.user.id, role: req.user.role } });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfile = async (req, res) => {
  const profileRole = getProfileRole(req.user.role);
  const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
  if (!profileRole) return res.status(403).json({ message: 'Unsupported account role' });
  if (name.length < 2 || name.length > 100) {
    return res.status(400).json({ message: 'Name must be between 2 and 100 characters' });
  }

  try {
    await db.execute(
      `UPDATE ${profileRole.table} SET ${profileRole.nameColumn} = ? WHERE ${profileRole.idColumn} = ?`,
      [name, req.user.id]
    );
    res.json({ success: true, data: { name } });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updatePassword = async (req, res) => {
  const profileRole = getProfileRole(req.user.role);
  const { currentPassword, newPassword } = req.body;
  if (!profileRole) return res.status(403).json({ message: 'Unsupported account role' });
  if (typeof currentPassword !== 'string' || !currentPassword) {
    return res.status(400).json({ message: 'Current password is required' });
  }
  if (typeof newPassword !== 'string' || !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]{8,}$/.test(newPassword)) {
    return res.status(400).json({ message: 'New password must be at least 8 letters and numbers, with at least one of each' });
  }

  try {
    const [rows] = await db.execute(
      `SELECT password_hash FROM ${profileRole.table} WHERE ${profileRole.idColumn} = ?`,
      [req.user.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Account not found' });
    if (!await bcrypt.compare(currentPassword, rows[0].password_hash)) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await db.execute(
      `UPDATE ${profileRole.table} SET password_hash = ? WHERE ${profileRole.idColumn} = ?`,
      [passwordHash, req.user.id]
    );
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Update Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateProfileImage = async (req, res) => {
  const profileRole = getProfileRole(req.user.role);
  if (!profileRole) return res.status(403).json({ message: 'Unsupported account role' });
  if (!req.file) return res.status(400).json({ message: 'Choose a profile image to upload' });

  const imageUrl = `/uploads/profile-pictures/${req.file.filename}`;
  try {
    const [rows] = await db.execute(
      `SELECT profile_image FROM ${profileRole.table} WHERE ${profileRole.idColumn} = ?`,
      [req.user.id]
    );
    if (rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ message: 'Account not found' });
    }

    await db.execute(
      `UPDATE ${profileRole.table} SET profile_image = ? WHERE ${profileRole.idColumn} = ?`,
      [imageUrl, req.user.id]
    );

    const previousImage = rows[0].profile_image;
    if (previousImage?.startsWith('/uploads/profile-pictures/')) {
      const previousPath = path.join(__dirname, '..', 'uploads', 'profile-pictures', path.basename(previousImage));
      if (fs.existsSync(previousPath)) fs.unlinkSync(previousPath);
    }
    res.json({ success: true, data: { profile_image: imageUrl } });
  } catch (error) {
    if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Update Profile Image Error:', error);
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
