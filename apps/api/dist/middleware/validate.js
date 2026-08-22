export function validate(schema, property = "body") {
    return (req, res, next) => {
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
        }
        catch (error) {
            return res.status(500).json({ error: "Validation error" });
        }
    };
}
//# sourceMappingURL=validate.js.map