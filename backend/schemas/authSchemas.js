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

const sellerRegistrationSchema = z.object({
    seller_name: z.string().trim().min(1, 'Seller name is required'),
    shop_name: z.string().trim().min(1, 'Shop name is required'),
    email: emailSchema,
    password: registrationPasswordSchema,
    phone: z.string().trim().nullish(),
    address: z.string().trim().nullish(),
});

const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, 'Password is required'),
    role: z.preprocess(
        (value) => typeof value === 'string' ? value.toUpperCase() : value,
        z.enum(['ADMIN', 'SELLER', 'CUSTOMER']).optional()
    ),
});

module.exports = { customerRegistrationSchema, sellerRegistrationSchema, loginSchema };