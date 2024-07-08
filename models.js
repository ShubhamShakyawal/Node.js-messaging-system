const mongoose = require('mongoose'); 
const uuid = require('uuid'); 

const userSchema = new mongoose.Schema({ 
    _id: { type: String, default: uuid.v4 }, 
    username: String, email: String, 
    password: String, 
    connected: Boolean, 
    notifications: [{ type: String, ref: 'Notification' }] 
}); 
const notificationSchema = new mongoose.Schema({ 
    _id: { type: String, default: uuid.v4 }, 
    userId: { type: String, ref: 'User' }, 
    message: String, 
    read: Boolean 
}); 

const User = mongoose.model('User', userSchema);
const Notification = mongoose.model('Notification', notificationSchema);

module.exports = { User, Notification};