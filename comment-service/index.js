require('dotenv').config()
const express = require('express');
const axios = require('axios');
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
app.post('/api/v1/posts/:postId/comments', async (req, res) => {
    const comments = commentsByPost[req.params.postId] || []

    const id = randomBytes(4).toString('hex')
    const { content } = req.body
    const newComment = { id, postId: req.params.postId, content, status: 'pending' }

    console.log(newComment)

    comments.unshift(newComment)
    commentsByPost[req.params.postId] = comments
    console.log(commentsByPost)

    await axios.post('http://localhost:4005/api/v1/events', { type: 'CommentCreated', data: newComment })

    res.status(201).send({ status: true, data: comments, message: 'Created successfully' })
})

app.get('/api/v1/posts/:postId/comments', (req, res) => {
    const comments = commentsByPost[req.params.postId] || []
    res.send({ status: true, data: comments })
})

// API EVENT
app.post('/api/v1/events', (req, res) => {
    console.log(commentsByPost);
    console.log(req.body);
    const { type, data } = req.body;
    const { id, postId, status } = data;

    switch (type) {
        case 'CommentModerated':
            const comments = commentsByPost[postId];
            const comment = comments.find(comment => comment.id === id);
            comment.status = status;

            axios.post('http://localhost:4005/api/v1/events', { 
                type: 'CommentUpdated', 
                data: { ...comment } 
            })
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