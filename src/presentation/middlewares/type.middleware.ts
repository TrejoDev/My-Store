import { NextFunction, Request, Response } from "express";

export class TypeMiddleware {
  static validTypes(validTypes: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const type = req.url.split("/").at(2) ?? ""; //*Se toma el type por url por que en mi middleware se utiliza este antes de la ruta, por lo que todavia el type no se ha establecido en la req.body

      if (!validTypes.includes(type)) {
        return res.status(400).json({
          error: `Invalid type: ${type}, valid ones: ${validTypes} `,
        });
      }
      next();
    };
  }
}
