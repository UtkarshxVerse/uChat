const db = require('./db');
const express = require('express');
const cors = require('cors');
const authRouter  = require('./Routes/authRouter.js');
const { apiLimiter } = require('./middlewares/rateLimiter.js');
const messageRouter = require('./Routes/messageRouter.js');
const conversationRouter = require('./Routes/conversationRouter.js');

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth",apiLimiter, authRouter);
app.use("/api/messages", apiLimiter, messageRouter);
app.use('/api/conversations',apiLimiter, conversationRouter );

app.listen(8000, () => {
        console.log("Server is running on port 8000");
});
