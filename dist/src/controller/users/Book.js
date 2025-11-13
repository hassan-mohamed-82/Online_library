"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBookById = exports.getAllBooks = void 0;
const books_1 = require("../../models/schema/books");
const response_1 = require("../../utils/response");
const NotFound_1 = require("../../Errors/NotFound");
const getAllBooks = async (_req, res) => {
    const books = await books_1.BookModel.find().populate("categoryId");
    (0, response_1.SuccessResponse)(res, { message: "Books fetched successfully", books });
};
exports.getAllBooks = getAllBooks;
// جلب كتاب واحد
const getBookById = async (req, res) => {
    const book = await books_1.BookModel.findById(req.params.id).populate("categoryId");
    if (!book)
        throw new NotFound_1.NotFound("Book not found");
    (0, response_1.SuccessResponse)(res, { message: "Book fetched successfully", book });
};
exports.getBookById = getBookById;
