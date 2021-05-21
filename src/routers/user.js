const express = require("express");
const multer = require("multer");
const sharp = require("sharp");

const auth = require("../middleware/auth");
const User = require("../models/user");

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        const name = file.originalname;
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            cb(new Error("Avatars must be a jpg, jpeg, or png file."));
        }
        cb(undefined, true);
    }
});

const router = express.Router();

router.post("/users", async (req, res) => {
    try {
        const user = new User(req.body);
        const token = await user.generateAuthToken();
        await user.save();
        res.status(201).send({ user, token });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/users/login", async (req, res) => {
    try {
        // findByCredentials is defined on the User schema in models
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        res.send({ user, token });
    } catch (err) {
        res.status(400).send(err);
    }
});

router.post("/users/logout", auth, async (req, res) => {
    try {
        // only remove the user token supplied from the logout call
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);
        await req.user.save();
        res.send();
    } catch (err) {
        res.status(500).send();
    }
});

router.post("/users/logoutAll", auth, async (req, res) => {
    try {
        // remove all the user tokens to globally logout
        req.user.tokens = [];
        await req.user.save();
        res.status(200).send();
    } catch (err) {
        res.status(500).send();
    }
});

router.post(
    "/users/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        // standardize all avatar uploads to a 250x250px png
        const imageBuffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
        req.user.avatar = imageBuffer;
        await req.user.save();
        res.status(200).send();
    },
    (err, req, res, next) => {
        res.status(400).send({ error: err.message });
    }
);

router.get("/users/me", auth, async (req, res) => {
    res.send(req.user);
});

router.get("/users/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            throw new Error();
        }

        // using sharp to convert all uploads to png allows this to always be true
        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    } catch (err) {
        res.status(404).send();
    }
});

router.patch("/users/me", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];
    const allowedOperation = updates.every((update) => allowedUpdates.includes(update));

    if (!allowedOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
        // req.user is setup in the auth middleware. it is the user object associated with the supplied jwt in the header.
        updates.forEach((update) => (req.user[update] = req.body[update]));
        await req.user.save();

        if (!req.user) {
            return res.status(404).send();
        }

        res.send(req.user);
    } catch (err) {
        res.status(400).send(err);
    }
});

router.delete("/users/me", auth, async (req, res) => {
    try {
        await req.user.remove();
        res.status(200).send(req.user);
    } catch (err) {
        res.status(500).send();
    }
});

router.delete(
    "/users/me/avatar",
    auth,
    async (req, res) => {
        req.user.avatar = undefined;
        await req.user.save();
        res.status(200).send();
    },
    (err, req, res, next) => {
        res.status(400).send({ error: err.message });
    }
);

module.exports = router;
