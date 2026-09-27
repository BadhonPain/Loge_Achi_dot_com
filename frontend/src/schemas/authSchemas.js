import { z } from 'zod';

const registrationPasswordSchema = z.string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9]+$/,
        'Password must contain only letters and numbers, including at least one of each'
    );

const emailSchema = z.string().trim().email('Enter a valid email address');

const withMatchingPasswords = (schema) => schema.refine(
    (values) => values.password === values.confirmPassword,
    { path: ['confirmPassword'], message: 'Passwords do not match' }
);

export const customerRegistrationSchema = withMatchingPasswords(z.object({
    name: z.string().trim().min(1, 'Enter your name'),
    email: emailSchema,
    password: registrationPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    phone: z.string().trim().optional(),
}));

export const sellerRegistrationSchema = withMatchingPasswords(z.object({
    seller_name: z.string().trim().min(1, 'Enter your name'),
    shop_name: z.string().trim().min(1, 'Enter your shop name'),
    email: emailSchema,
    password: registrationPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
    phone: z.string().trim().optional(),
    address: z.string().trim().optional(),
}));

export const vendorAccountSchema = withMatchingPasswords(z.object({
    fullName: z.string().trim().min(1, 'Enter your name'),
    email: emailSchema,
    phone: z.string().trim().min(1, 'Enter your phone number'),
    password: registrationPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
}));

export const vendorBusinessSchema = z.object({
    businessName: z.string().trim().min(1, 'Enter your business name'),
    businessType: z.string().min(1, 'Select a business type'),
    category: z.string().min(1, 'Select a category'),
    address: z.string().trim().min(1, 'Enter your business address'),
});

export const vendorStoreSchema = z.object({
    storeName: z.string().trim().min(1, 'Enter your store name'),
    agreedToTerms: z.boolean().refine(Boolean, 'You must agree to the Terms'),
});