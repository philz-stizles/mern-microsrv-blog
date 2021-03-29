require('dotenv').config()
const express = require('express');
const cors = require('cors');

const app = express();

const posts = {};

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

app.get('/api/v1/posts', (req, res) => {
    res.send({ status: true, data: posts })
})

// API EVENT
app.post('/api/v1/events', (req, res) => {
    const { type, data } = req.body
    console.log(req.body)

    switch (type) {
        case 'PostCreated':
            const newPost = { id: data.id, title: data.title, content: data.content, comments: [] }
            posts[data.id] = newPost

            break;

        case 'CommentCreated':
            const { id, postId, content, status } = data
            const post = posts[postId]
            const newComment = { id, content, status }

            console.log(newComment)

            post.comments.unshift(newComment)

            break;

        default:
            break;
    }

    res.send({})
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
    app.close(() => {
        process.exit(1);
    });
});