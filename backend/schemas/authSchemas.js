const { z } = require('zod');

const registrationPasswordSchema = z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/,
        'Password must contain only letters and numbers, including at least one of each'
    );

const emailSchema = z.string().trim().email('Enter a valid email address');

const customerRegistrationSchema = z.object({
    name: z.string().trim().min(1, 'Name is required'),
    email: emailSchema,
    password: registrationPasswordSchema,
    phone: z.string().trim().nullish(),
});

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    role: z.preprocess(
        (value) => typeof value === 'string' ? value.toUpperCase() : value,
        z.enum(['ADMIN', 'SELLER', 'CUSTOMER']).optional()
    ),
});

const vendorApplicationSchema = z.object({
    full_name: z.string().trim().min(1, 'Full name is required').max(100),
    email: emailSchema,
    phone: z.string().trim().min(1, 'Phone is required').max(20),
    password: registrationPasswordSchema,
    store_name: z.string().trim().min(1, 'Store name is required').max(100),
    category_id: z.coerce.number().int().positive('Choose a business category'),
    business_description: z.string().trim().min(1, 'Business description is required'),
    address: z.string().trim().min(1, 'Address is required').max(255),
    city: z.string().trim().min(1, 'City is required').max(100),
    postal_code: z.string().trim().min(1, 'Postal code is required').max(20),
    country: z.string().trim().min(1, 'Country is required').max(100),
});

module.exports = { customerRegistrationSchema, loginSchema, vendorApplicationSchema };