import { z } from 'zod';

export const reviewSubmissionSchema = z.object({
  order_item_id: z.coerce.number().int().positive('Choose a delivered purchase to review'),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000, 'Review must be 1000 characters or fewer'),
});