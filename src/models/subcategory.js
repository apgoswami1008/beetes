"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class SubCategory extends Model {
    static associate(models) {
      // Relation: Each SubCategory belongs to a Category
      SubCategory.belongsTo(models.Category, {
        foreignKey: "categoryId",
        as: "category",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  SubCategory.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categories", // must match table name in migration
          key: "id",
        },
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: "Subcategory name is required" },
        },
      },
      slug: {
        type: DataTypes.STRING(120),
        allowNull: false,
        unique: {
          msg: "Slug must be unique",
        },
        validate: {
          notEmpty: { msg: "Slug is required" },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Thumbnail or cover image for subcategory",
      },
      banner: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Banner image for promotional sections",
      },
      metaTitle: {
        type: DataTypes.STRING(60),
        allowNull: true,
        comment: "SEO meta title",
      },
      metaDescription: {
        type: DataTypes.STRING(160),
        allowNull: true,
        comment: "SEO meta description",
      },
      metaKeywords: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: "SEO keywords, comma separated",
      },
      displayOrder: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isFeatured: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      updatedBy: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "SubCategory",
      tableName: "sub_categories",
      timestamps: true,
      paranoid: true, // enables soft delete
      indexes: [
        {
          fields: ["slug"],
          unique: true,
        },
        {
          fields: ["categoryId"],
        },
      ],
    }
  );

  return SubCategory;
};
