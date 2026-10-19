const mongoose = require("mongoose");

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log("DATABASE is connected...!");
    } catch (err) {
        console.error("Mongo failed, retrying in 5s:", err.message);
        setTimeout(connectDB, 5000);
    }
}

mongoose.connection.on("disconnected", () => console.log("Mongo disconnected"));
mongoose.connection.on("reconnected", () => console.log("Mongo reconnected"));

module.exports = connectDB;
