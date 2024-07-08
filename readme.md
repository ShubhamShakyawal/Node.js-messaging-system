# Node.js Real-Time Notification System

## Overview
This project is a microservices-based real-time notification system that handles high-volume message processing and delivers real-time notifications to users. The system integrates message queues and implements real-time data streaming.

## Requirements
- **Node.js and Express**: Used to build the services.
- **Database**: MongoDB is used to store data, with Mongoose for ORM.
- **Message Queue**: RabbitMQ or Kafka for message queuing.
- **Real-Time Streaming**: WebSocket or Socket.IO for real-time data streaming.
- **Authentication**: JWT (JSON Web Token) for authentication.
- **API Documentation**: Swagger for API documentation.

## Specifications

### Entities
#### User
- **id**: UUID
- **username**: string
- **email**: string
- **password**: hashed string
- **connected**: boolean (indicates if the user is connected to the real-time service)

#### Notification
- **id**: UUID
- **userId**: reference to User
- **message**: string
- **read**: boolean

### Services

#### Auth Service
- **POST /api/register**: Register a new user.
- **POST /api/login**: Login and receive a JWT.

#### Notification Service
- **POST /api/notifications**: Create a new notification for a user. This pushes a message to the queue.
- **GET /api/notifications**: Get a list of all notifications for the authenticated user.
- **GET /api/notifications/:id**: Get details of a specific notification.
- **PUT /api/notifications/:id**: Mark a notification as read.

#### Real-Time Service
- Establish a WebSocket connection for real-time notifications.
- Listen for new notifications from the queue and broadcast them to the connected users.

### Client
- The act of marking a notification as read is a client-side action indicating that the user has seen or interacted with the notification.

## Technical Requirements
- Follow RESTful principles.
- Handle errors gracefully and return appropriate HTTP status codes.
- Use environment variables for configuration.
- Ensure code quality with a linter (ESLint).


## Getting Started

### Prerequisites
- Node.js
- MongoDB
- RabbitMQ