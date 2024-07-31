const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require('./utils/message');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

const spaceName =  'SyntaxSpace';

// run when client connects
io.on('connect', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);



        // welcome current user
    socket.emit('message', formatMessage(spaceName, 'Welcome to SyntaxSpace!'));

    // Broadcast when a user connects
    socket.broadcast
        .to(user.room)
        .emit(
            'message', 
            formatMessage(spaceName, `${user.username} has joined the chat`)
        );

        // Send users and room infomation
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    // listen for chatMessage
    socket.on('chatMessage', msg => {
        const user = getCurrentUser(socket.id);

       io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // Runs when client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message', 
                formatMessage(spaceName, `${user.username} has left the chat`)
            );

            
            // Send users and room infomation
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    
    });
});

const PORT = 3000 || process.env.PORT;

server.listen(PORT, () => console.log(`Server listening on ${PORT}`));