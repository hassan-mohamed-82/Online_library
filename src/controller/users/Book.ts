import { Request, Response } from "express";
import { BookModel } from "../../models/schema/books";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { saveBase64Image } from "../../utils/handleImages";
export const getAllBooks = async (_req: Request, res: Response) => {
    const books = await BookModel.find().populate("categoryId");
      SuccessResponse(res,{message:"Books fetched successfully", books});
 
};

// جلب كتاب واحد
export const getBookById = async (req: Request, res: Response) => {
    const book = await BookModel.findById(req.params.id).populate("categoryId");
    if (!book) throw new NotFound("Book not found");

   SuccessResponse(res,{message:"Book fetched successfully", book});
};