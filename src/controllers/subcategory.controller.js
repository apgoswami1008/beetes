const { SubCategory, Category } = require("../models");
const slugify = require("slugify");
const { deleteRecord, toggleStatus } = require("../helpers/dbHelpers");

// ✅ Create Subcategory
exports.createSubCategory = async (req, res, next) => {
  try {
    const {
      name,
      categoryId,
      description,
      image,
      banner,
      metaTitle,
      metaDescription,
      metaKeywords,
      displayOrder,
      isActive,
      isFeatured,
      createdBy,
    } = req.body;

    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Parent category not found",
      });
    }

    const slug = slugify(name, { lower: true });

    const existing = await SubCategory.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Subcategory with the same name already exists",
      });
    }

    const subCategory = await SubCategory.create({
      name,
      slug,
      categoryId,
      description,
      image,
      banner,
      metaTitle,
      metaDescription,
      metaKeywords,
      displayOrder,
      isActive,
      isFeatured,
      createdBy,
    });

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Subcategory created successfully",
      data: subCategory,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Get All Subcategories
exports.getSubCategories = async (req, res, next) => {
  try {
    const subCategories = await SubCategory.findAll({
      include: [{ model: Category, as: "category" }],
      order: [["displayOrder", "ASC"]],
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Subcategories fetched successfully",
      data: subCategories,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Get Subcategory by ID
exports.getSubCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subCategory = await SubCategory.findByPk(id, {
      include: [{ model: Category, as: "category" }],
    });

    if (!subCategory) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Subcategory not found",
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Subcategory fetched successfully",
      data: subCategory,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Update Subcategory
exports.updateSubCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    if (updateData.name) {
      updateData.slug = slugify(updateData.name, { lower: true });
    }

    const subCategory = await SubCategory.findByPk(id);
    if (!subCategory) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Subcategory not found",
      });
    }

    await subCategory.update(updateData);

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Subcategory updated successfully",
      data: subCategory,
    });
  } catch (err) {
    next(err);
  }
};

// ✅ Delete Subcategory
exports.deleteSubCategory = async (req, res) => {
  const { id } = req.params;
  const result = await deleteRecord(SubCategory, id);
  return res.status(result.statusCode).json(result);
};

exports.changeSubCategoryStatus = async (req, res) => {
  const { id } = req.params;
  const result = await toggleStatus(SubCategory, id, "isActive");
  return res.status(result.statusCode).json(result);
};
