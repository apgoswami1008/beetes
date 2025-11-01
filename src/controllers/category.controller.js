const { Category } = require("../models");
const slugify = require("slugify");
const { deleteRecord, toggleStatus } = require("../helpers/dbHelpers");

// Create Category
exports.createCategory = async (req, res, next) => {
  try {
    const {
      name,
      description,
      image,
      banner,
      metaTitle,
      metaDescription,
      metaKeywords,
      displayOrder,
      isActive,
      isFeatured,
      parentId,
    } = req.body;

    const slug = slugify(name, { lower: true });

    const existing = await Category.findOne({ where: { slug } });
    if (existing) {
      return res.status(400).json({
        status: false,
        statusCode: 400,
        message: "Category with the same name already exists",
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      banner,
      metaTitle,
      metaDescription,
      metaKeywords,
      displayOrder,
      isActive,
      isFeatured,
      parentId,
    });

    res.status(201).json({
      status: true,
      statusCode: 201,
      message: "Category created successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// Get All Categories
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      order: [["displayOrder", "ASC"]],
      include: [{ model: Category, as: "subcategories" }],
    });

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

// Get Category by ID
exports.getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [{ model: Category, as: "subcategories" }],
    });

    if (!category) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Category not found",
      });
    }

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Category fetched successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// Update Category
exports.updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Find category to update
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        status: false,
        statusCode: 404,
        message: "Category not found",
      });
    }

    // If name is changing, check for duplicates
    if (updateData.name && updateData.name !== category.name) {
      const existing = await Category.findOne({
        where: { name: updateData.name },
      });

      if (existing && existing.id !== parseInt(id)) {
        return res.status(400).json({
          status: false,
          statusCode: 400,
          message: "Category with the same name already exists",
        });
      }

      // Update slug when name changes
      updateData.slug = slugify(updateData.name, { lower: true });
    }

    // Update category
    await category.update(updateData);

    res.status(200).json({
      status: true,
      statusCode: 200,
      message: "Category updated successfully",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

// Delete Category (Soft Delete)
exports.deleteCategory = async (req, res) => {
  const { id } = req.params;
  const result = await deleteRecord(Category, id);
  return res.status(result.statusCode).json(result);
};

exports.changeCategoryStatus = async (req, res) => {
  const { id } = req.params;
  const result = await toggleStatus(Category, id, "isActive");
  return res.status(result.statusCode).json(result);
};