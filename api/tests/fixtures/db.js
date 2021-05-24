const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Task = require("../../src/models/task");
const User = require("../../src/models/user");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: "Test User",
    email: "user@test.com",
    password: "newPassword56!",
    tokens: [
        {
            token: jwt.sign(
                { _id: userOneId.toString() },
                process.env.JWT_SECRET
            )
        }
    ]
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: "Test User 2",
    email: "user2@test.com",
    password: "newPassword565!",
    tokens: [
        {
            token: jwt.sign(
                { _id: userTwoId.toString() },
                process.env.JWT_SECRET
            )
        }
    ]
};

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: "Task one",
    completed: false,
    owner: userOne._id
};

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: "Task two has a longer description",
    completed: true,
    owner: userOne._id
};

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: "Task three",
    completed: true,
    owner: userTwo._id
};

const setupDatabase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
};

module.exports = {
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    taskOne,
    taskTwo,
    taskThree,
    setupDatabase
};
