function notFound(req, res) {
    res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Express 5 forwards rejected async handlers here automatically.
function errorHandler(err, req, res, next) {
    if (err.name === "ValidationError")
        return res.status(400).json({
            message: "Validation failed",
            errors: Object.values(err.errors)
                .map((e) => e.message)
        });
    if (err.name === "CastError")
        return res.status(400).json({
            message: `Invalid ${err.path}`
        });
    if (err.code === 11000)
        return res.status(409).json({
            message: "Duplicate value",
            fields: Object.keys(err.keyValue || {})
        });
    if (err.type === "entity.parse.failed")
        return res.status(400).json({
            message: "Invalid JSON body"
        });

    console.error(err);
    res.status(err.status || 500).json({
        message: err.status ? err.message : "Internal server error"
    });
}

module.exports = { notFound, errorHandler };
