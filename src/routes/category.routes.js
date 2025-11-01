const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/category.controller");
const { createCategoryValidation } = require("../validations/category.validation");
const { validate } = require("../middlewares/validation.middleware");

// Routes
router.post("/", createCategoryValidation, validate, categoryController.createCategory);
router.get("/", categoryController.getCategories);
router.get("/:id", categoryController.getCategoryById);
router.put("/:id", createCategoryValidation, validate, categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
