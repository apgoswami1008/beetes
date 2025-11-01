const express = require("express");
const router = express.Router();
const subCategoryController = require("../controllers/subcategory.controller");
const { createSubCategoryValidation } = require("../validations/subcategory.validation");
const { validate } = require("../middlewares/validation.middleware");

router.post("/", createSubCategoryValidation, validate, subCategoryController.createSubCategory);
router.get("/", subCategoryController.getSubCategories);
router.get("/:id", subCategoryController.getSubCategoryById);
router.put("/:id", createSubCategoryValidation, validate, subCategoryController.updateSubCategory);
router.delete("/:id", subCategoryController.deleteSubCategory);
router.patch("/status/:id", subCategoryController.changeSubCategoryStatus);
module.exports = router;
