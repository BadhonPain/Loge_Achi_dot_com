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

export const vendorApplicationSchema = z.object({
    full_name: z.string().trim().min(1, 'Enter your full name'),
    email: emailSchema,
    phone: z.string().trim().min(1, 'Enter your phone number'),
    password: registrationPasswordSchema,
    confirm_password: z.string().min(1, 'Confirm your password'),
    store_name: z.string().trim().min(1, 'Enter your store name'),
    category_id: z.coerce.number().int().positive('Choose a business category'),
    business_description: z.string().trim().min(1, 'Describe your business'),
    address: z.string().trim().min(1, 'Enter your address'),
    city: z.string().trim().min(1, 'Enter your city'),
    postal_code: z.string().trim().min(1, 'Enter your postal code'),
    country: z.string().trim().min(1, 'Enter your country'),
}).refine(
    (values) => values.password === values.confirm_password,
    { path: ['confirm_password'], message: 'Passwords do not match' }
).transform((values) => ({
    full_name: values.full_name,
    email: values.email,
    phone: values.phone,
    password: values.password,
    store_name: values.store_name,
    category_id: values.category_id,
    business_description: values.business_description,
    address: values.address,
    city: values.city,
    postal_code: values.postal_code,
    country: values.country,
}));