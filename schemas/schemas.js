const BaseJoi = require("joi")
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        safeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
        campground: Joi.object({
        title: Joi.string().required().safeHTML(),
        price: Joi.number().min(0).required(),
        location: Joi.string().required().safeHTML(),
        // images: Joi.array().required(),
        description: Joi.string().required().safeHTML(),
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().safeHTML(),
        rating: Joi.number().min(0).max(100).required(),
    }).required()
})


