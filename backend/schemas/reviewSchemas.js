const { z } = require('zod');

const reviewSubmissionSchema = z.object({
  order_item_id: z.coerce.number().int().positive('A delivered order item is required'),
  rating: z.coerce.number().int().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().max(1000, 'Review must be 1000 characters or fewer').optional().default(''),
});

module.exports = { reviewSubmissionSchema };