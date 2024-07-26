const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/message');

const app = express();
const server = http.createServer(app);
const io = socketio(server)

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const spaceName =  'SyntaxSpace';

// run when client connects
io.on('connect', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        // welcome current user
    socket.emit('message', formatMessage(spaceName, 'Welcome to SyntaxSpace!'));

    // Broadcast when a user connects
    socket.broadcast.emit(
        'message', 
        formatMessage(spaceName, 'A user has joined the chat'));
    });

    // listen for chatMessage
    socket.on('chatMessage', msg => {
       io.emit('message', formatMessage('USER', msg));
    });

    // Runs when client disconnect
    socket.on('disconnect', () => {
        io.emit('message', formatMessage(spaceName, 'A user has left the chat'));
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));