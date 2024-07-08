const express = require('express');  
const WebSocket = require('ws');  
const amqp = require('amqplib');  
const authApp = require('./auth.service');  
const notificationApp = require('./notification.service');  
const { User, Notification } = require('./models');

const app = express();  

// Middleware and Routes
app.use(express.json());
app.use('/api/auth', authApp);  
app.use('/api/notifications', notificationApp);  

// RabbitMQ connection settings  
const rabbitUrl = 'amqp://localhost';  
const exchangeName = 'notifications';  
const queueName = 'notifications_queue';  
const routingKey = 'notifications';  

// Establish RabbitMQ connection  
async function connectToRabbit() {  
    try {
        const connection = await amqp.connect(rabbitUrl);  
        const channel = await connection.createChannel();  
        await channel.assertExchange(exchangeName, 'direct', { durable: true });  
        await channel.assertQueue(queueName, { durable: true });  
        await channel.bindQueue(queueName, exchangeName, routingKey); // Corrected this line
        return channel;  
    } catch (error) {
        console.error('Failed to connect to RabbitMQ', error);
        throw error;
    }
}

// WebSocket server  
const wss = new WebSocket.Server({ port: 8080 });  

// Connect to RabbitMQ and set up WebSocket server  
async function startServer() {  
    try {
        const channel = await connectToRabbit();  
        wss.on('connection', (ws) => {  
            console.log('Client connected');  
            // Consume messages from RabbitMQ queue  
            channel.consume(queueName, (msg) => {  
                if (msg !== null) {  
                    const notification = JSON.parse(msg.content.toString());  
                    console.log(`Received notification => ${notification}`);  
                    broadcastNotification(notification);  
                    channel.ack(msg);  
                }  
            });  
            // Handle WebSocket errors  
            ws.on('error', (error) => {  
                console.log('WebSocket error');  
                console.log(error);  
            });  
            // Handle WebSocket close  
            ws.on('close', () => {  
                console.log('Client disconnected');  
            });  
        });  
    } catch (error) {
        console.error('Failed to start server', error);
    }
}  

// Broadcast notification to all connected clients  
function broadcastNotification(notification) {  
    wss.clients.forEach((client) => {  
        if (client.readyState === WebSocket.OPEN) {  
            client.send(JSON.stringify(notification));  
        }  
    });  
}  

startServer(); // To start the server

// API routes  
app.get('/', (req, res) => {  
    res.send('Welcome to the real-time notification system!');  
});  

// Client side API to create user with username, email and password
app.post('/users', async (req, res) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);    
    const user = new User({ username, email, password: hashedPassword, connected: false });  

    try {  
        await user.save();  
        res.send(`User created with ID ${user._id}`);  
    } catch (error) {  
        res.status(500).send(error);  
    }  
});  

// Client side API to create Notification message with id and message
app.post('/notifications', async (req, res) => {  
    const notification = new Notification({userId: req.body.userId, message: req.body.message, read: false});  
    try {  
        await notification.save();  
        // Produce notification to RabbitMQ queue  
        const channel = await connectToRabbit();  
        channel.publish(exchangeName, routingKey, Buffer.from(JSON.stringify(notification)));  
        res.send(`Notification sent to queue`);  
    } catch (error) {  
        res.status(500).send(error);  
    }  
});  

app.listen(3000, () => {  
    console.log('Server listening on port 3000');  
}); 