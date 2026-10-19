require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const app = require("./app");
const connectDB = require("./config/db");
const PORT = process.env.PORT || 5000;

function startServer() {
    app.listen(PORT, () => {
        console.log(`Server is running on the port ${PORT}`);
    });
    connectDB(); // retries on its own, never exits the process
}

process.on("unhandledRejection", (reason) => {
    console.error("Unhandled promise rejection:", reason);
});
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    process.exit(1);
});

startServer();
