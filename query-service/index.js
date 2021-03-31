require('dotenv').config()
const express = require('express');
const cors = require('cors');
const axios = require('axios');

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
const handleEvent = (type, data) => {
    switch (type) {
        case 'PostCreated':
            const newPost = { id: data.id, title: data.title, content: data.content, comments: [] }
            posts[data.id] = newPost

            break;

        case 'CommentCreated':
            const targetPost = posts[data.postId]
            const newComment = { id: data.id, content: data.content, status: data.status }

            console.log(newComment)

            targetPost.comments.unshift(newComment)

            break;

        case 'CommentUpdated':
            const { id, postId, content, status } = data;
            const post = posts[postId];
            const comment = post.comments.find(comment => comment.id === id);
            comment.status = status;
            comment.content = content;

            break;

        default:
            break;
    }
}

app.post('/api/v1/events', (req, res) => {
    console.log(req.body)
    const { type, data } = req.body

    handleEvent(type, data)

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

app.listen(PORT, async err => {
    if(err) {
        console.log(`Server running on ${PORT}`)
    }

    const response = await axios.get('http://localhost:4005/api/v1/events')
    for(let event of response.data) {
        console.log(`Processing event: ${event.type}`)
        handleEvent(event.type, event.data)
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