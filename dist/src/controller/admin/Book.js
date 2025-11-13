"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteBook = exports.updateBook = exports.getBookById = exports.getAllBooks = exports.createBook = void 0;
const books_1 = require("../../models/schema/books");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const NotFound_1 = require("../../Errors/NotFound");
const handleImages_1 = require("../../utils/handleImages");
// إنشاء كتاب
const createBook = async (req, res) => {
    const { name, categoryId, numberOfCopies, numberInStock, publisher, writer, language, publishYear, edition, numPages, condition, weight, Synopsis, gallery, mainImage } = req.body;
    if (!name || !categoryId || numberOfCopies == null || numberInStock == null) {
        throw new BadRequest_1.BadRequest("Required fields: name, categoryId, numberOfCopies, numberInStock");
    }
    let mainImageBase64 = "";
    if (mainImage)
        mainImageBase64 = await (0, handleImages_1.saveBase64Image)(mainImage, req.user?.id || "unknown", req, "books");
    let galleryImages = [];
    if (gallery && Array.isArray(gallery)) {
        for (const imgBase64 of gallery) {
            const imgPath = await (0, handleImages_1.saveBase64Image)(imgBase64, req.user?.id || "unknown", req, "books/gallery");
            galleryImages.push(imgPath);
        }
    }
    const book = new books_1.BookModel({
        name,
        categoryId,
        numberOfCopies,
        numberInStock,
        publisher,
        writer,
        language,
        publishYear,
        edition,
        numPages,
        condition,
        weight,
        Synopsis,
        mainImage: mainImageBase64,
        gallery: galleryImages
    });
    await book.save();
    (0, response_1.SuccessResponse)(res, { message: "Book created successfully", book });
};
exports.createBook = createBook;
// جلب كل الكتب
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
// تحديث كتاب
const updateBook = async (req, res) => {
    const book = await books_1.BookModel.findById(req.params.id);
    if (!book)
        throw new NotFound_1.NotFound("Book not found");
    const { name, categoryId, numberOfCopies, numberInStock, publisher, writer, language, publishYear, edition, numPages, condition, weight, Synopsis, gallery, mainImageBase64 } = req.body;
    if (name)
        book.name = name;
    if (categoryId)
        book.categoryId = categoryId;
    if (numberOfCopies != null)
        book.numberOfCopies = numberOfCopies;
    if (numberInStock != null)
        book.numberInStock = numberInStock;
    if (publisher)
        book.publisher = publisher;
    if (writer)
        book.writer = writer;
    if (language)
        book.language = language;
    if (publishYear)
        book.publishYear = publishYear;
    if (edition)
        book.edition = edition;
    if (numPages)
        book.numPages = numPages;
    if (condition)
        book.condition = condition;
    if (weight)
        book.weight = weight;
    if (Synopsis)
        book.Synopsis = Synopsis;
    if (mainImageBase64)
        book.mainImage = await (0, handleImages_1.saveBase64Image)(mainImageBase64, req.user?.id || "unknown", req, "books");
    if (gallery && Array.isArray(gallery)) {
        const galleryImages = [];
        for (const imgBase64 of gallery) {
            const imgPath = await (0, handleImages_1.saveBase64Image)(imgBase64, req.user?.id || "unknown", req, "books/gallery");
            galleryImages.push(imgPath);
        }
        book.gallery = galleryImages;
    }
    await book.save();
    (0, response_1.SuccessResponse)(res, { message: "Book updated successfully" });
};
exports.updateBook = updateBook;
const deleteBook = async (req, res) => {
    const bookID = req.params.id;
    const book = await books_1.BookModel.findByIdAndDelete(bookID);
    if (!book)
        throw new NotFound_1.NotFound("Book not found");
    (0, response_1.SuccessResponse)(res, { message: "Book deleted successfully" });
};
exports.deleteBook = deleteBook;
