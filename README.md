# Task Manager

## Pre-requisites
* Node.js and npm are installed
* MongoDB is setup locally and access to DB URI and port.

## Getting Started
1. Clone the project locally using git.
2. Setup a `/config` directory at the top-level of the project.
3. Open a terminal in the root directory of the project and do `npm install`.

### Setting up the Dev Environment
1. Start the MongoDB server.
2. Add a `dev.env` file to the `/config` directory at the top-level of the project.
3. Set environment variables in `dev.env` for the `PORT`, `MONGODB_URL`, and a secret for `JWT_SECRET` for authentication.
4. Run the command: `npm run dev`.

If all goes well, the Express server should start listening on the `PORT` defined earlier.

### Setting up the Test Environment
1. Start the MongoDB server.
2. Add a `test.env` file to the `/config` directory at the top-level of the project.
3. Set environment variables in `test.env` for the `PORT`, `MONGODB_URL`, and a secret for `JWT_SECRET` for authentication.
4. Run the command: `npm run test`.