const { body } = require("express-validator");

exports.createSubCategoryValidation = [
  body("name")
    .notEmpty()
    .withMessage("Subcategory name is required")
    .isLength({ min: 2 })
    .withMessage("Subcategory name must be at least 2 characters long"),

  body("categoryId")
    .notEmpty()
    .withMessage("Parent category ID is required")
    .isInt({ min: 1 })
    .withMessage("Category ID must be a valid number"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description must be under 500 characters"),

  body("displayOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Display order must be a positive number"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be true or false"),

  body("isFeatured")
    .optional()
    .isBoolean()
    .withMessage("isFeatured must be true or false"),
];
