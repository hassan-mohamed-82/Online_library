"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBookInFavorites = exports.removeFromFavorites = exports.getFavorites = exports.addToFavorites = void 0;
const FavoriteBook_1 = require("../../models/schema/FavoriteBook");
const books_1 = require("../../models/schema/books");
const response_1 = require("../../utils/response");
const BadRequest_1 = require("../../Errors/BadRequest");
const NotFound_1 = require("../../Errors/NotFound");
// ✅ 1. Add book to favorites
const addToFavorites = async (req, res) => {
    const { bookId } = req.body;
    const userId = req.user?.id; // assuming you have auth middleware
    if (!bookId)
        throw new BadRequest_1.BadRequest("Book ID is required");
    if (!userId)
        throw new BadRequest_1.BadRequest("User not authenticated");
    // check if book exists
    const book = await books_1.BookModel.findById(bookId);
    if (!book)
        throw new NotFound_1.NotFound("Book not found");
    // check if already added
    const existing = await FavoriteBook_1.FavoriteBook.findOne({ userId, bookId });
    if (existing)
        throw new BadRequest_1.BadRequest("Book already in favorites");
    const favorite = new FavoriteBook_1.FavoriteBook({ userId, bookId });
    await favorite.save();
    (0, response_1.SuccessResponse)(res, { message: "Book added to favorites", favorite });
};
exports.addToFavorites = addToFavorites;
// ✅ 2. Get all favorite books for a user
const getFavorites = async (req, res) => {
    const userId = req.user?.id;
    if (!userId)
        throw new BadRequest_1.BadRequest("User not authenticated");
    const favorites = await FavoriteBook_1.FavoriteBook.find({ userId })
        .populate("bookId") // optional: show book details
        .sort({ createdAt: -1 });
    (0, response_1.SuccessResponse)(res, { message: "Favorites fetched", favorites });
};
exports.getFavorites = getFavorites;
// ✅ 3. Remove a book from favorites
const removeFromFavorites = async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user?.id;
    if (!userId)
        throw new BadRequest_1.BadRequest("User not authenticated");
    const deleted = await FavoriteBook_1.FavoriteBook.findOneAndDelete({ userId, bookId });
    if (!deleted)
        throw new NotFound_1.NotFound("Book not found in favorites");
    (0, response_1.SuccessResponse)(res, { message: "Book removed from favorites" });
};
exports.removeFromFavorites = removeFromFavorites;
// ✅ 4. Check if a book is in favorites (optional)
const isBookInFavorites = async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user?.id;
    if (!userId)
        throw new BadRequest_1.BadRequest("User not authenticated");
    const exists = await FavoriteBook_1.FavoriteBook.exists({ userId, bookId });
    (0, response_1.SuccessResponse)(res, { inFavorites: !!exists });
};
exports.isBookInFavorites = isBookInFavorites;
