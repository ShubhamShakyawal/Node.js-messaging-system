const express = require('express');  
const mongoose = require('mongoose');  
const amqp = require('amqplib');  
const { Notification } = require('./models'); 
require('dotenv').config();

const app = express();  

const MONGO_URI = process.env.MONGO_URI 

mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected successfully..'))
.catch(err => console.log(err));

app.use(express.json());

//POST /api/notifications: Create a new notification for a user. This should push a message to the queue.
app.post('/api/notifications', async (req, res) => {  
    const { userId, message } = req.body;  
    const notification = new Notification({ userId, message, read: false });  
    await notification.save();  
    try {
        // Send message to RabbitMQ queue  
        const connection = await amqp.connect('amqp://localhost');  
        const channel = await connection.createChannel();  
        await channel.assertQueue('notifications');  
        await channel.sendToQueue('notifications', Buffer.from(JSON.stringify({ userId, message })));  
        res.status(201).send({ message: 'Notification created successfully' });  
    } catch (error) {
        console.error('Failed to send message to RabbitMQ', error);
        res.status(500).send({ message: 'Failed to send notification' });
    }
});  

// GET /api/notifications: Get a list of all notifications for the authenticated user.
app.get('/api/notifications', async (req, res) => {  
    const userId = req.user.id;  
    const notifications = await Notification.find({ userId });  
    res.send(notifications);  
});  

// GET /api/notifications/:id: Get details of a specific notification.
app.get('/api/notifications/:id', async (req, res) => {  
    const id = req.params.id;  
    const notification = await Notification.findById(id);  
    if (!notification) {  
        return res.status(404).send({ message: 'Notification not found' });  
    }  
    res.send(notification);  
});  

// PUT /api/notifications/:id: Mark a notification as read.
app.put('/api/notifications/:id', async (req, res) => {  
    const id = req.params.id;  
    const notification = await Notification.findById(id);  
    if (!notification) {  
        return res.status(404).send({ message: 'Notification not found' });  
    }  
    notification.read = true;  
    await notification.save();  
    res.send({ message: 'Notification marked as read' });  
});  

module.exports = app;