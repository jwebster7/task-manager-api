const express = require("express");
require("./db/mongoose");

// if using dotenv...
// if (process.env.NODE_ENV !== "production") {
//     require("dotenv").config();
// }

const taskRouter = require("./routers/task");
const userRouter = require("./routers/user");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(taskRouter);
app.use(userRouter);

app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});
