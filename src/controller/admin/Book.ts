import { Request, Response } from "express";
import { BookModel } from "../../models/schema/books";
import { SuccessResponse } from "../../utils/response";
import { BadRequest } from "../../Errors/BadRequest";
import { NotFound } from "../../Errors/NotFound";
import { saveBase64Image } from "../../utils/handleImages";

// إنشاء كتاب
export const createBook = async (req: Request, res: Response) => {
    const {
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
      gallery,
      mainImage
    } = req.body;

    if (!name || !categoryId || numberOfCopies == null || numberInStock == null) {
      throw new BadRequest("Required fields: name, categoryId, numberOfCopies, numberInStock");
    }

    let mainImageBase64 = "";
    if (mainImage) mainImageBase64 = await saveBase64Image(mainImage, req.user?.id || "unknown", req, "books");

    let galleryImages: string[] = [];
    if (gallery && Array.isArray(gallery)) {
      for (const imgBase64 of gallery) {
        const imgPath = await saveBase64Image(imgBase64, req.user?.id || "unknown", req, "books/gallery");
        galleryImages.push(imgPath);
      }
    }

    const book = new BookModel({
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
     SuccessResponse(res,{message:"Book created successfully", book});
  
};

// جلب كل الكتب
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

// تحديث كتاب
export const updateBook = async (req: Request, res: Response) => {
    const book = await BookModel.findById(req.params.id);
    if (!book) throw new NotFound("Book not found");

    const {
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
      gallery,
      mainImageBase64
    } = req.body;

    if (name) book.name = name;
    if (categoryId) book.categoryId = categoryId;
    if (numberOfCopies != null) book.numberOfCopies = numberOfCopies;
    if (numberInStock != null) book.numberInStock = numberInStock;
    if (publisher) book.publisher = publisher;
    if (writer) book.writer = writer;
    if (language) book.language = language;
    if (publishYear) book.publishYear = publishYear;
    if (edition) book.edition = edition;
    if (numPages) book.numPages = numPages;
    if (condition) book.condition = condition;
    if (weight) book.weight = weight;
    if (Synopsis) book.Synopsis = Synopsis;
    if (mainImageBase64) book.mainImage = await saveBase64Image(mainImageBase64, req.user?.id || "unknown", req, "books");
    if (gallery && Array.isArray(gallery)) {
      const galleryImages: string[] = [];
      for (const imgBase64 of gallery) {
        const imgPath = await saveBase64Image(imgBase64, req.user?.id || "unknown", req, "books/gallery");
        galleryImages.push(imgPath);
      }
      book.gallery = galleryImages;
    }

    await book.save();
     SuccessResponse(res,{message:"Book updated successfully"});
};
export const deleteBook = async (req: Request, res: Response) => {
   const bookID = req.params.id;
    const book = await BookModel.findByIdAndDelete(bookID);
    if (!book) throw new NotFound("Book not found");

     SuccessResponse(res, {message:"Book deleted successfully"} );
  
};
