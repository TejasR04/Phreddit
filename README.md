[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/MVUO33FO)
# Phreddit (Fake Reddit) Application

## Project Overview
Phreddit is a full-stack web application clone of Reddit, developed by Tejas Ravi and Tanjim Ahammad. The application allows users to create accounts, join communities, create posts, comment, and interact with content.

Here's a GIF that demos some of the application's features: 

<img src='https://i.imgur.com/HEJPwRy.gif' title='Video Demo' width='' alt='Video Demo' />

## Technology Stack
- **Frontend:** React
- **Backend:** Node.js with Express
- **Database:** MongoDB
- **Authentication:** bcrypt for password hashing

## Features

### User Management
- User registration and authentication
- User profiles with reputation system
- Admin user capabilities

### Community Features
- Create and manage communities
- Join and leave communities
- Community-specific post listings

### Content Interactions
- Create, edit, and delete posts
- Comment on posts
- Upvote and downvote posts and comments
- Reputation-based voting restrictions

### Search and Navigation
- Search posts across communities
- Personalized home page for logged-in users
- Responsive navbar and banner

## Prerequisites
- Node.js (v14 or later)
- MongoDB (local instance)
- npm or yarn package manager

## Installation

### Clone the Repository
```bash
git clone <repository-url>
cd phreddit
```

### Backend Setup
1. Navigate to the server directory
```bash
cd server
npm install
```

2. Enable the database
```bash
mongod
```

3. On a separate terminal, set up initial admin user
```bash
node init.js <email> <display-name> <password>
```

4. Start the backend server
```bash
npm start
# Server will run on localhost:8000
```

### Frontend Setup
1. Navigate to the client directory
```bash
cd client
npm install
```

2. Start the React application
```bash
npm start
# Application will run on localhost:3000
```

## Environment Configuration
Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=mongodb://127.0.0.1:27017/phreddit
JWT_SECRET=your_jwt_secret
```

## Team Member Contributions

### [Tejas Ravi]
- Worked on all pages, components, backend

### [Tanjim Ahammad]
- Worked on all pages, components, backend
