const express = require("express");

const auth = require("../middleware/auth");
const Task = require("../models/task");

const router = express.Router();

router.post("/tasks", auth, async (req, res) => {
    // const task = new Task(req.body);
    const task = new Task({
        ...req.body,
        owner: req.user._id
    });

    try {
        await task.save();
        res.status(201).send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.patch("/tasks/:id", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["description", "completed"];
    const allowedOperation = updates.every((update) =>
        allowedUpdates.includes(update)
    );

    if (!allowedOperation) {
        return res.status(400).send({ error: "Invalid updates!" });
    }

    try {
        const task = await Task.findOne({
            _id: req.params.id,
            owner: req.user._id
        });

        if (!task) {
            return res.status(404).send();
        }

        updates.forEach((update) => (task[update] = req.body[update]));
        await task.save();

        res.status(200).send(task);
    } catch (err) {
        res.status(500).send(err);
    }
});

// GET /tasks?completed=false
// GET /tasks?limit='x'&skip='y'
// GET /tasks?sortBy=createdAt:desc
router.get("/tasks", auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.completed) {
        match.completed = req.query.completed === "true";
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        // sort.createdAt = -1 or 1
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    try {
        await req.user
            .populate({
                path: "tasks",
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort
                }
            })
            .execPopulate();
        res.status(200).send(req.user.tasks);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.get("/tasks/:id", auth, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user._id;
        const tasks = await Task.findOne({
            _id: taskId,
            owner: userId
        });

        if (!tasks) {
            return res.status(404).send();
        }

        res.send(tasks);
    } catch (err) {
        res.status(500).send(err);
    }
});

router.delete("/tasks/:id", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.id,
            owner: req.user._id
        });
        if (!task) {
            res.status(404).send();
        }
        res.status(200).send(task);
    } catch (err) {
        res.status(500).send();
    }
});

module.exports = router;
