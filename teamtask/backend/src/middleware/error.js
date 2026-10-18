function notFound(req, res) {
    res.status(404).json({ message: "The requested resource was not found" });
}

// Express 5 forwards rejected async handlers here too.
// Clients only ever get a safe message; details stay in the server log.
function errorHandler(err, req, res, next) {
    if (res.headersSent) return next(err);

    if (err.name === "ValidationError")
        return res.status(400).json({ message: "Some of the submitted data is invalid" });
    if (err.name === "CastError")
        return res.status(400).json({ message: "Invalid identifier or value" });
    if (err.code === 11000)
        return res.status(409).json({ message: "This record already exists" });
    if (err.type === "entity.parse.failed")
        return res.status(400).json({ message: "Invalid request body" });
    if (err.type === "entity.too.large")
        return res.status(413).json({ message: "Request is too large" });

    const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600 ? err.status : 500;
    if (status >= 500) console.error(`[${req.method} ${req.originalUrl}]`, err);
    // 4xx errors raised on purpose (http-errors sets expose) are safe to show; everything else is generic
    res.status(status).json({
        message: status < 500 && err.expose !== false ? err.message : "Something went wrong. Please try again later.",
    });
}

module.exports = { notFound, errorHandler };
