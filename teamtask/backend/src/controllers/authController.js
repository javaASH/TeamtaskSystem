const User = require("../modals/user");
const { validateRegister, validateLogin } = require("../service/validate");

// New session id on login/register prevents session fixation.
function startSession(req, user) {
    return new Promise((resolve, reject) =>
        req.session.regenerate((err) => {
            if (err) return reject(err);
            req.session.userId = String(user._id);
            req.session.save((e) => (e ? reject(e) : resolve()));
        })
    );
}

async function register(req, res) {
    const { errors, value } = validateRegister(req.body);
    if (errors.length) return res.status(400).json({ message: "Validation failed", errors });

    if (await User.exists({ email: value.email })) return res.status(409).json({ message: "Email is already registered" });

    // first account bootstraps the team as admin
    const role = (await User.estimatedDocumentCount()) === 0 ? "admin" : "user";
    const user = await User.create({ ...value, role });
    await startSession(req, user);
    res.status(201).json({ user });
}

async function login(req, res) {
    const { errors, value } = validateLogin(req.body);
    if (errors.length) return res.status(400).json({ message: "Validation failed", errors });

    const user = await User.findOne({ email: value.email }).select("+password");
    if (!user || !(await user.comparePassword(value.password)))
        return res.status(401).json({ message: "Invalid email or password" });

    await startSession(req, user);
    res.json({ user });
}

function logout(req, res, next) {
    req.session.destroy((err) => {
        if (err) return next(err);
        res.clearCookie("tt.sid");
        res.json({ message: "Logged out" });
    });
}

function me(req, res) {
    res.json({ user: req.user });
}

async function updatePreferences(req, res) {
    const prefs = {};
    for (const key of ["assigned", "updated"]) {
        const v = req.body?.[key];
        if (v === undefined) continue;
        if (typeof v !== "boolean") return res.status(400).json({ message: `${key} must be true or false` });
        prefs[`notificationPrefs.${key}`] = v;
    }
    if (!Object.keys(prefs).length) return res.status(400).json({ message: "Provide assigned and/or updated" });
    const user = await User.findByIdAndUpdate(req.user._id, prefs, { returnDocument: "after" });
    res.json({ user });
}

module.exports = { register, login, logout, me, updatePreferences };
