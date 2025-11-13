import { Request, Response } from "express";
import { FavoriteBook } from "../../models/schema/FavoriteBook";
import { BookModel } from "../../models/schema/books";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";

// ✅ 1. Add book to favorites
export const addToFavorites = async (req: Request, res: Response) => {
  const { bookId } = req.body;
  const userId = req.user?.id; // assuming you have auth middleware

  if (!bookId) throw new BadRequest("Book ID is required");
  if (!userId) throw new BadRequest("User not authenticated");

  // check if book exists
  const book = await BookModel.findById(bookId);
  if (!book) throw new NotFound("Book not found");

  // check if already added
  const existing = await FavoriteBook.findOne({ userId, bookId });
  if (existing) throw new BadRequest("Book already in favorites");

  const favorite = new FavoriteBook({ userId, bookId });
  await favorite.save();

  SuccessResponse(res, { message: "Book added to favorites", favorite });
};

// ✅ 2. Get all favorite books for a user
export const getFavorites = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) throw new BadRequest("User not authenticated");

  const favorites = await FavoriteBook.find({ userId })
    .populate("bookId") // optional: show book details
    .sort({ createdAt: -1 });

  SuccessResponse(res, { message: "Favorites fetched", favorites });
};

// ✅ 3. Remove a book from favorites
export const removeFromFavorites = async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new BadRequest("User not authenticated");

  const deleted = await FavoriteBook.findOneAndDelete({ userId, bookId });
  if (!deleted) throw new NotFound("Book not found in favorites");

  SuccessResponse(res, { message: "Book removed from favorites" });
};

// ✅ 4. Check if a book is in favorites (optional)
export const isBookInFavorites = async (req: Request, res: Response) => {
  const { bookId } = req.params;
  const userId = req.user?.id;

  if (!userId) throw new BadRequest("User not authenticated");

  const exists = await FavoriteBook.exists({ userId, bookId });
  SuccessResponse(res, { inFavorites: !!exists });
};
