const express = require("express")
const cors = require("cors")
const helmet = require("helmet")
const session = require("express-session")
const { MongoStore } = require("connect-mongo")
const { notFound, errorHandler } = require("./middleware/error")

const isProd = process.env.NODE_ENV === "production";
if (!process.env.SESSION_SECRET) throw new Error("SESSION_SECRET is not set");

const app = express();

// behind Render/Railway's proxy, needed for secure cookies and correct rate-limit IPs
if (isProd) app.set("trust proxy", 1);

app.use(helmet());
app.use(cors({
    origin :   [
  "https://teamtask-system.vercel.app",
  "https://teamtask-system-ashishteam1.vercel.app",
  "http://localhost:3000",
],
    credentials: true
}));
app.use(express.json({ limit: "100kb" }));

app.use(session({
    name: "tt.sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI, ttl: 7 * 24 * 60 * 60 }),
    cookie: {
        httpOnly: true,
        secure: isProd,
        // frontend and backend live on different domains in production
        sameSite: isProd ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    },
}));

app.get("/api/health", (req,res)=>{
    res.json({
        message : "teamtask is running fully on backend...!"
    });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/tasks", require("./routes/taskRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/audit", require("./routes/auditRoutes"));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
