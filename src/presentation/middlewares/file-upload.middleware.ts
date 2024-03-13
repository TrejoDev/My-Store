import { NextFunction, Request, Response } from "express";

export class FileUploadMiddleware {
  static containFiles(req: Request, res: Response, next: NextFunction) {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ error: "No file were selected" });
    }

    if (!Array.isArray(req.files.file)) {
      //* Si es single lo toma como un obj => lo homogenizamos a un arreglo en el body
      req.body.files = [req.files.file];
    } else {
      //* Si es multiple lo toma como un arreglo => lo pasamos al body
      req.body.files = req.files.file;
    }
    next();
  }
}