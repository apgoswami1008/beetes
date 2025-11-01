"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    static associate(models) {
      // Self-referencing association for nested categories
      Category.hasMany(models.Category, {
        as: "subcategories",
        foreignKey: "parentId",
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      });

      Category.belongsTo(models.Category, {
        as: "parent",
        foreignKey: "parentId",
      });

      // ✅ If you have SubCategory model separately
      if (models.SubCategory) {
        Category.hasMany(models.SubCategory, {
          as: "subCategories",
          foreignKey: "categoryId",
          onDelete: "CASCADE",
        });
      }
    }
  }

  Category.init(
    {
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Category name cannot be empty." },
          len: {
            args: [2, 100],
            msg: "Category name must be between 2 and 100 characters.",
          },
        },
        comment: "Main category name",
      },
      slug: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: { msg: "Slug cannot be empty." },
        },
        comment: "SEO-friendly URL identifier",
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Category description for display or SEO",
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Thumbnail image URL",
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: "Custom sort order",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: "Whether the category is active or not",
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: "Whether the category should be featured on home page",
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Parent category ID (for nested structure)",
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Category",
      tableName: "categories",
      paranoid: true, // enable soft delete
      timestamps: true,
      indexes: [
        { fields: ["slug"], unique: true },
        { fields: ["isActive"] },
        { fields: ["isFeatured"] },
      ],
      scopes: {
        active: { where: { isActive: true } },
        featured: { where: { isFeatured: true } },
      },
    }
  );

  return Category;
};
