import { ZodSchema } from "zod";
import { Request, Response, NextFunction } from "express";

export function validate(schema: ZodSchema, property: "body" | "query" | "params" = "body") {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.safeParse(req[property]);
      if (!result.success) {
        const errors = result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }));
        return res.status(400).json({
          error: "Validation failed",
          message: "Request validation failed",
          errors,
        });
      }
      req[property] = result.data;
      next();
    } catch (error) {
      return res.status(500).json({ error: "Validation error" });
    }
  };
}
