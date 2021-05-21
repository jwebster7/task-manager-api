const mongoose = require("mongoose");

// const connectionUrl = "mongodb://127.0.0.1:27017/task-manager-db";
const connectionUrl = process.env.MONGODB_URL;
const options = {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
};

mongoose.connect(connectionUrl, options);
