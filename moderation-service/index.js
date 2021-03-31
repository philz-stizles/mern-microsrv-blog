require('dotenv').config()
const express = require('express');
const axios = require('axios');

const app = express();

// REQUEST BODY PARSING
app.use(express.json({ limit: '10kb' })) // This would limit the body size to 10kb
app.use(express.urlencoded({ extended: true, limit: '10kb' })) // This would limit the body size to 10kb

// API EVENT
app.post('/api/v1/events', (req, res) => {
    console.log(req.body)
    const { type, data } = req.body

    switch (type) {
        case 'CommentCreated':
            const { id, postId, content } = data;
            const status = content.includes('orange') ? 'rejected' : 'approved'

            axios.post('http://localhost:4005/api/v1/events', { 
                type: 'CommentModerated', 
                data: { id, postId, content, status } 
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