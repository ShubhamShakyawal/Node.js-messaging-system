const express = require('express');  
const jwt = require('jsonwebtoken');  
const mongoose = require('mongoose');  
const bcrypt = require('bcrypt');  
const { User } = require('./models'); 
require('dotenv').config()

const app = express();  

const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI)
.then(() => console.log('MongoDB connected successfully..'))
.catch(err => console.log(err));

app.use(express.json());

// POST /api/register: Register a new user.
app.post('/api/register', async (req, res) => {  
    const { username, email, password } = req.body;  
    const hashedPassword = await bcrypt.hash(password, 10);  
    const user = new User({ username, email, password: hashedPassword, connected: false });  
    await user.save();  
    res.status(201).send({ message: 'User created successfully' });  
});  

// POST /api/login: Login and receive a JWT.
app.post('/api/login', async (req, res) => {  
    const { email, password } = req.body;  
    const user = await User.findOne({ email });  
    if (!user) {  
        return res.status(401).send({ message: 'Invalid email or password' });  
    }  
    const isValid = await bcrypt.compare(password, user.password);  
    if (!isValid) {  
        return res.status(401).send({ message: 'Invalid email or password' });  
    }  
    const token = jwt.sign({ userId: user.id }, process.env.SECRET_KEY, { expiresIn: '1h' });  
    res.send({ token });  
});  

module.exports = app;