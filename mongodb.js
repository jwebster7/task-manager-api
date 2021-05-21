// const mongodb = require("mongodb");
// const MongoClient = mongodb.MongoClient;
// const ObjectID = mongodb.ObjectID;

// es6 destructuring
const { MongoClient, ObjectID } = require("mongodb");

const connectionURL = "mongodb://127.0.0.1:27017";
const databaseName = "task-manager";

// object id is not actually a string. It is a sequence of 12 bytes that is represented as a string for ease-of-use.
const objectID = new ObjectID();

console.log(objectID.id);
console.log(objectID.toHexString());
console.log(objectID.getTimestamp());

const options = {
    useNewUrlParser: true
};

MongoClient.connect(connectionURL, options, (error, client) => {
    if (error) {
        return console.log("Unable to connect to MongoDB!");
    }
    console.log("Connected correctly");

    const db = client.db(databaseName);

    //#region CREATE - insertOne(), insertMany()
    // db.collection("users").insertOne(
    //     {
    //         name: "Chad",
    //         age: 27,
    //         role: "endUser"
    //     },
    //     (error, result) => {
    //         if (error) {
    //             return console.log("Unable to insert user into collection");
    //         }

    //         console.log(result.ops);
    //     }
    // );

    // db.collection("users").insertMany(
    //     [
    //         {
    //             name: "Joe Webster",
    //             age: 27,
    //             role: "admin"
    //         },
    //         {
    //             name: "Todd",
    //             age: 29,
    //             role: "endUser"
    //         }
    //     ],
    //     (error, result) => {
    //         if (error) {
    //             return console.log(
    //                 "Unable to insert user documents into collection"
    //             );
    //         }

    //         console.log(result.ops);
    //     }
    // );

    // db.collection("tasks").insertMany(
    //     [
    //         {
    //             description: "Take out the trash",
    //             completed: true
    //         },
    //         {
    //             description: "Go to the store",
    //             completed: true
    //         },
    //         {
    //             description: "Study for interview",
    //             completed: false
    //         }
    //     ],
    //     (error, result) => {
    //         if (error) {
    //             return console.log(
    //                 "Unable to insert task documents into collection tasks"
    //             );
    //         }

    //         console.log(result.ops);
    //     }
    // );
    //#endregion CREATE

    //#region READ - find(), findOne()

    // returns a cursor which is an object that points to the the document location in the database.
    // db.collection("users")
    //     .find({ age: 27 })
    //     .toArray((error, userDocument) => {
    //         console.log(userDocument);
    //     });

    // db.collection("users")
    //     .find({ age: 27 })
    //     .count((error, count) => {
    //         console.log(count);
    //     });

    // findOne takes a query object with fields callback and returns the first document that has a field match.
    // db.collection("users").findOne(
    //     { _id: new ObjectID("609c4ea2f6a11656c31fcfe4") },
    //     (error, userDocument) => {
    //         if (error) {
    //             return console.log("Unable to fetch user document!");
    //         }

    //         console.log(userDocument);
    //     }
    // );

    // find a specific task based on it's object ID
    // db.collection("tasks").findOne(
    //     { _id: new ObjectID("609c4f734a86e856ea0d6e30") },
    //     (error, taskDoc) => {
    //         console.log(taskDoc);
    //     }
    // );

    // all uncompleted tasks
    // db.collection("tasks")
    //     .find({ completed: false })
    //     .toArray((error, users) => {
    //         console.log(users[0]);
    //     });

    //#endregion

    //#region UPDATE - update(), updateOne()
    // update - http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#update
    // update operators - https://docs.mongodb.com/manual/reference/operator/update/

    // const updateOnePromise = db
    //     .collection("users")
    //     .updateOne(
    //         {
    //             _id: new ObjectID("609c81411de0485bf1db413b")
    //         },
    //         {
    //             $inc: {
    //                 age: 3
    //             }
    //         }
    //     )
    //     .then((result) => console.log(result))
    //     .catch((error) => console.log(error));

    // db.collection("tasks")
    //     .updateMany({ completed: false }, { $set: { completed: true } })
    //     .then((result) => console.log(result))
    //     .catch((error) => console.log(err));

    //#endregion

    //#region DELETE - deleteMany(), deleteOne()
    // delete - http://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteMany

    // db.collection("users")
    //     .deleteMany({ age: 30 })
    //     .then((result) => {
    //         console.log(result);
    //     })
    //     .catch((error) => {
    //         console.log(error);
    //     });

    // db.collection("tasks")
    //     .deleteOne({ description: "Take out the trash" })
    //     .then((result) => console.log(result))
    //     .catch((error) => console.log(error));

    //#endregion
});
