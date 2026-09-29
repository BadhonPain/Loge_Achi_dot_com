const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../config/db');
const { vendorApplicationSchema } = require('../schemas/authSchemas');

exports.submitApplication = async (req, res) => {
    const validation = vendorApplicationSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({
            message: validation.error.issues[0].message,
            errors: validation.error.issues,
        });
    }

    const application = validation.data;
    try {
        const [categories] = await db.execute(
            'SELECT category_id FROM categories WHERE category_id = ? AND status = ?',
            [application.category_id, 'ACTIVE']
        );
        if (categories.length === 0) {
            return res.status(400).json({ message: 'Choose an active business category' });
        }

        const [existingAccounts] = await db.execute(
            'SELECT email FROM customers WHERE email = ? UNION SELECT email FROM sellers WHERE email = ? UNION SELECT email FROM admins WHERE email = ?',
            [application.email, application.email, application.email]
        );
        if (existingAccounts.length > 0) {
            return res.status(409).json({ message: 'An account already uses this email address' });
        }

        const [existingApplications] = await db.execute(
            "SELECT application_id FROM seller_applications WHERE email = ? AND status IN ('PENDING', 'UNDER_REVIEW') LIMIT 1",
            [application.email]
        );
        if (existingApplications.length > 0) {
            return res.status(409).json({ message: 'An application for this email is already being reviewed' });
        }

        const passwordHash = await bcrypt.hash(application.password, 10);
        const applicationRef = crypto.randomBytes(32).toString('hex');
        await db.execute(
            `INSERT INTO seller_applications
        (application_ref, full_name, email, phone, password_hash, store_name, category_id,
         business_description, address, city, postal_code, country, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING')`,
            [
                applicationRef,
                application.full_name,
                application.email,
                application.phone,
                passwordHash,
                application.store_name,
                application.category_id,
                application.business_description,
                application.address,
                application.city,
                application.postal_code,
                application.country,
            ]
        );

        res.status(201).json({
            success: true,
            message: 'Your vendor application has been submitted for review',
            application_ref: applicationRef,
            status: 'PENDING',
        });
    } catch (error) {
        console.error('Submit Vendor Application Error:', error);
        res.status(500).json({ message: 'Could not submit vendor application' });
    }
};

exports.getApplicationStatus = async (req, res) => {
    try {
        const [applications] = await db.execute(
            `SELECT application_ref, full_name, store_name, status, rejection_reason, created_at, reviewed_at
       FROM seller_applications WHERE application_ref = ?`,
            [req.params.reference]
        );
        if (applications.length === 0) return res.status(404).json({ message: 'Application not found' });
        res.json({ success: true, data: applications[0] });
    } catch (error) {
        console.error('Get Vendor Application Status Error:', error);
        res.status(500).json({ message: 'Could not load application status' });
    }
};

exports.listApplications = async (req, res) => {
    try {
        const [applications] = await db.execute(
            `SELECT a.application_id, a.full_name, a.email, a.phone, a.store_name, a.category_id,
              c.category_name, a.business_description, a.address, a.city, a.postal_code,
              a.country, a.status, a.rejection_reason, a.created_at, a.reviewed_at
       FROM seller_applications a
       JOIN categories c ON c.category_id = a.category_id
       ORDER BY FIELD(a.status, 'PENDING', 'UNDER_REVIEW', 'REJECTED', 'APPROVED'), a.created_at ASC`
        );
        res.json({ success: true, count: applications.length, data: applications });
    } catch (error) {
        console.error('List Vendor Applications Error:', error);
        res.status(500).json({ message: 'Could not load vendor applications' });
    }
};

exports.reviewApplication = async (req, res) => {
    const { status, rejection_reason } = req.body;
    const allowedStatuses = ['UNDER_REVIEW', 'APPROVED', 'REJECTED'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ message: 'Choose UNDER_REVIEW, APPROVED, or REJECTED' });
    }
    if (status === 'REJECTED' && !rejection_reason?.trim()) {
        return res.status(400).json({ message: 'A rejection reason is required' });
    }

    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();
        const [applications] = await connection.execute(
            'SELECT * FROM seller_applications WHERE application_id = ? FOR UPDATE',
            [req.params.id]
        );
        if (applications.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Application not found' });
        }

        const application = applications[0];
        if (['APPROVED', 'REJECTED'].includes(application.status)) {
            await connection.rollback();
            return res.status(409).json({ message: 'This application has already received a final decision' });
        }

        if (status === 'APPROVED') {
            const [existingAccounts] = await connection.execute(
                'SELECT email FROM customers WHERE email = ? UNION SELECT email FROM sellers WHERE email = ? UNION SELECT email FROM admins WHERE email = ?',
                [application.email, application.email, application.email]
            );
            if (existingAccounts.length > 0) {
                await connection.rollback();
                return res.status(409).json({ message: 'This email is already attached to an account; resolve the duplicate before approving' });
            }

            const sellerAddress = [application.address, application.city, application.postal_code, application.country]
                .filter(Boolean)
                .join(', ')
                .slice(0, 255);
            const [sellerResult] = await connection.execute(
                `INSERT INTO sellers
          (seller_name, shop_name, email, phone, password_hash, address, status)
         VALUES (?, ?, ?, ?, ?, ?, 'ACTIVE')`,
                [application.full_name, application.store_name, application.email, application.phone, application.password_hash, sellerAddress]
            );
            await connection.execute(
                `UPDATE seller_applications
         SET status = 'APPROVED', rejection_reason = NULL, reviewed_by = ?, reviewed_at = NOW(), seller_id = ?
         WHERE application_id = ?`,
                [req.user.id, sellerResult.insertId, application.application_id]
            );
            await connection.commit();
            return res.json({ success: true, status, seller_id: sellerResult.insertId });
        }

        await connection.execute(
            `UPDATE seller_applications
       SET status = ?, rejection_reason = ?, reviewed_by = ?, reviewed_at = NOW()
       WHERE application_id = ?`,
            [status, status === 'REJECTED' ? rejection_reason.trim() : null, req.user.id, application.application_id]
        );
        await connection.commit();
        res.json({ success: true, status });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'The email, phone, or store name is already in use' });
        }
        console.error('Review Vendor Application Error:', error);
        res.status(500).json({ message: 'Could not update vendor application' });
    } finally {
        connection.release();
    }
};
