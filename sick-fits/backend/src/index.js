// let's go!
const cookieParser = require('cookie-parser');
require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');
const jwt = require('jsonwebtoken');

const server = createServer();

server.express.use(cookieParser()); // for handling JWT cookies
// TODO Use express middleware to populate current user

// decode the JWT so we can get the user Id oneach request
server.express.use((req, res, next) => {
    const {
        token
    } = req.cookies;
    if (token) {
        const {
            userId
        } = jwt.verify(token, process.env.APP_SECRET);
        // put the userId onto the req for guture requests to access;
        req.userId = userId;
    }
    next();
});

server.start({
    cors: {
        credentials: true,
        origin: process.env.FRONTEND_URL
    },
}, deets => {
    console.log(`Server is now running on port http:/localhost:${deets.port}`);
});
