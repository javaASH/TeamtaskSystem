const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dateOnly = require("./dateOnly");

const ROLES = ["admin", "manager", "user"];

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 60 },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        password: { type: String, required: true, minlength: 8, select: false },
        role: { type: String, enum: ROLES, default: "user" },
        notificationPrefs: {
            assigned: { type: Boolean, default: true },
            updated: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

userSchema.pre("save", async function () {
    if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

// never leak the hash, even if it was explicitly selected
userSchema.set("toJSON", {
    transform: (doc, ret) => {
        delete ret.password;
        delete ret.__v;
        return dateOnly(doc, ret);
    },
});

module.exports = mongoose.model("User", userSchema);
module.exports.ROLES = ROLES;
