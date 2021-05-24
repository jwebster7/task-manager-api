const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const Task = require("./task");

const userSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        age: {
            type: Number,
            default: 0,
            validate(value) {
                if (value < 0) {
                    throw new Error("Age must be a postive number!");
                }
            }
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Email invalid!");
                }
            }
        },
        password: {
            type: String,
            required: true,
            trim: true,
            minLength: 6,
            validate(value) {
                if (value.includes("password")) {
                    throw new Error('Password contains the word "password"');
                }
            }
        },
        avatar: {
            type: Buffer
        },
        tokens: [
            {
                token: {
                    type: "String",
                    required: true
                }
            }
        ]
    },
    {
        timestamps: true
    }
);

// virtual property. not stored in the database, but used by mongoose to find relationships between collections.
userSchema.virtual("tasks", {
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
});

// methods are available on the instances of a User model.
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = jwt.sign(
        { _id: user._id.toString() },
        process.env.JWT_SECRET
    );

    // add the token to the users tokens array
    user.tokens = user.tokens.concat({ token });
    await user.save();
    return token;
};

userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.tokens;
    delete userObject.password;
    delete userObject.avatar;
    return userObject;
};

// adding a custom method to the User model through Schema.statics
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email: email });

    if (!user) {
        throw new Error("Unable to login");
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        throw new Error("Unable to login");
    }

    return user;
};

// middleware that runs before every user creation or update.
// Hash the plain-text password before saving.
// ref - https://mongoosejs.com/docs/middleware.html#pre
userSchema.pre("save", async function (next) {
    // this refers to the individual user
    const user = this;

    if (user.isModified("password")) {
        user.password = await bcrypt.hash(user.password, 8);
    }

    // next continues execution. if never invoked, the api will hang indefinitely.
    next();
});

userSchema.pre("remove", async function (next) {
    const user = this;
    // delete multiple tasks when user is deleted.
    await Task.deleteMany({ owner: user._id });
    next();
});

// built-in schema validators - https://mongoosejs.com/docs/schematypes.html#string-validators
const User = mongoose.model("User", userSchema);

// mongoose will tell mongodb to create indexes after creating the User model
User.createIndexes();

module.exports = User;
