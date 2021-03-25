require('dotenv').config()
const express = require('express');
const cors = require('cors');
const { randomBytes } = require('crypto');

const app = express();

const commentsByPost = {};

// CORS
app.use(cors({
    // origin: 'https://someurl.com'
})) // cors() is a middleware which means that you can implement on specific routes as middlware

app.options('*', cors())
// app.options('/api/v1/tours/:id', cors()) // You can also use for specific routes

// REQUEST BODY PARSING
app.use(express.json({ limit: '10kb' })) // This would limit the body size to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })) // This would limit the body size to 10kb

// API - MOUNTING
app.post('/api/v1/posts/:postId', (req, res) => {
    const comments = commentsByPost[req.params.postId] || []

    const id = randomBytes(4).toString('hex')
    const { content } = req.body
    const newComment = { id, content }

    console.log(newComment)

    comments.unshift(newComment)
    commentsByPost[req.params.postId] = comments
    console.log(commentsByPost)

    res.status(201).send({ status: true, data: comments, message: 'Created successfully' })
})

app.get('/api/v1/posts/:postId', (req, res) => {
    const comments = commentsByPost[req.params.postId] || []
    res.send({ status: true, data: comments })
})


// Handle unhandled routes - routes that are not caught by our routers
// Pass Error to the global error handler middleware
app.all('*', (req, res, next) => {
    res
        .status(404)
        .send({ status: true, message: `Can't find ${req.originalUrl} on this server` })
})

// Global error handling
app.use((err, req, res, next) => {

})

const PORT = process.env.PORT;

app.listen(PORT, err => {
    if(err) {
        console.log(`Server running on ${PORT}`)
    }

    console.log(`Server running on ${PORT} in ${process.env.NODE_ENV} environment`)
})

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down...');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});