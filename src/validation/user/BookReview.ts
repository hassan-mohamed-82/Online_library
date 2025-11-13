import Joi from "joi";

export const createReviewSchema = Joi.object({
    bookId: Joi.string().required(),
    rating: Joi.number().min(1).max(5).required(),
    review: Joi.string().max(2000).required(),
    Comment: Joi.string().max(2000).optional(),
});

export const updateReviewSchema = Joi.object({
    rating: Joi.number().min(1).max(5).optional(),
    review: Joi.string().max(2000).optional(),
    Comment: Joi.string().max(2000).optional(),
});
