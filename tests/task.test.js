const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");
const {
    userOne,
    userOneId,
    userTwo,
    taskOne,
    taskThree,
    setupDatabase
} = require("./fixtures/db");

beforeEach(setupDatabase);

test("should create task for authenticated user", async () => {
    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "from jest tests",
            completed: false
        })
        .expect(201);

    const task = await Task.findById(response.body._id);
    expect(task).not.toBeNull();
    expect(task.completed).toBe(false);
});

test("should not create task with invalid fields", async () => {
    const response = await request(app)
        .post("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: undefined,
            completed: "true"
        })
        .expect(500);

    const task = await Task.findById(response.body._id);
    expect(task).toBeNull();
});

test("should not update task with unpermitted fields", async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            descriptions: undefined,
            isCompleted: "True"
        })
        .expect(400);
});

test("should not update task with invalid fields", async () => {
    await request(app)
        .patch(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: undefined,
            completed: "incomplete"
        })
        .expect(500);
});

test("should not update task owned by different user", async () => {
    await request(app)
        .patch(`/tasks/${taskThree._id}`)
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send({
            description: "new description",
            completed: false
        })
        .expect(404);
});

test("should fetch all tasks for current authenticated user", async () => {
    const response = await request(app)
        .get("/tasks")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const tasks = response.body;

    // ensure that only tasks where the owner is the currently authenticated user are fetched
    tasks.forEach((task) => {
        expect(task.owner.toString()).toEqual(userOneId.toString());
    });

    expect(tasks.length).toBe(2);
});

test("should fetch only completed tasks for when authenticated", async () => {
    const response = await request(app)
        .get("/tasks?completed=true")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const tasks = response.body;

    // ensure that only tasks where the owner is the currently authenticated user are fetched
    tasks.forEach((task) => {
        expect(task.owner.toString()).toEqual(userOneId.toString());
        expect(task.completed).toBe(true);
    });
});

test("should fetch only incompleted tasks for when authenticated", async () => {
    const response = await request(app)
        .get("/tasks?completed=false")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const tasks = response.body;

    // ensure that only tasks where the owner is the currently authenticated user are fetched
    tasks.forEach((task) => {
        expect(task.owner.toString()).toEqual(userOneId.toString());
        expect(task.completed).toBe(false);
    });
});

test("should fetch tasks sorted by ascending description length", async () => {
    const response = await request(app)
        .get("/tasks?sortBy=description:asc")
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const tasks = response.body;
    for (let i = 1; i < tasks.length; i++) {
        expect(tasks[i - 1].description.length).toBeLessThan(tasks[i].description.length);
    }
});

test("should fetch user task by id when authenticated", async () => {
    const response = await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const task = response.body;
    expect(task.owner.toString()).toBe(userOne._id.toString());
});

test("should not fetch user task by id when unauthenticated", async () => {
    await request(app)
        .get(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer not-authenticated`)
        .send()
        .expect(401);
});

test("should not fetch unowned tasks by id when authenticated", async () => {
    await request(app)
        .get(`/tasks/${taskThree._id}`)
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(404);
});

test("should delete owned task when authenticated", async () => {
    const response = await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
        .send()
        .expect(200);

    const task = response.body;
    expect(task._id.toString()).toEqual(taskOne._id.toString());
});

test("should not delete owned task when unauthenticated", async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);
});

test("should fail to delete unowned task", async () => {
    await request(app)
        .delete(`/tasks/${taskOne._id}`)
        .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
        .send()
        .expect(404);

    const task = await Task.findById(taskOne._id);
    expect(task).not.toBeNull();
});
