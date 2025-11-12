"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategoryById = exports.getCategories = void 0;
const category_1 = require("../../models/schema/category");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const NotFound_1 = require("../../Errors/NotFound");
const getCategories = async (req, res) => {
    const categories = await category_1.Category.find().populate('parentId', 'name');
    (0, response_1.SuccessResponse)(res, { categories }, 200);
};
exports.getCategories = getCategories;
const getCategoryById = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        throw new BadRequest_1.BadRequest("Category ID is required");
    }
    const category = await category_1.Category.findById(id).populate('parentId', 'name');
    if (!category) {
        throw new NotFound_1.NotFound("Category not found");
    }
    (0, response_1.SuccessResponse)(res, { category }, 200);
};
exports.getCategoryById = getCategoryById;
