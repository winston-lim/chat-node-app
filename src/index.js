const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const generateResponse = require('./utils/response');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');
const { callbackify } = require('util');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public/');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket)=> {
  socket.on('join', ({username, room},acknowledge)=> {
    //addUser returns either a user or error object
    const {error, user} = addUser({id: socket.id, username, room});
    if(error) {
      return acknowledge(error);
    }
    //we use user.room or user.username as addUser automatically trimmed the inputs
    socket.join(user.room);
    socket.emit('server-message', generateResponse('Welcome', 'Admin'));
    socket.broadcast.to(user.room).emit('server-message', generateResponse(`${user.username} has joined the chat`,'Admin'));
    io.to(user.room).emit('room-data', {
      room: user.room,
      users: getUsersInRoom(user.room),
    })
    acknowledge();
  })

  socket.on('send-message', (message,acknowledge)=> {
    const user = getUser(socket.id);
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return acknowledge('Message contains profanity')
    }
    io.to(user.room).emit('server-message', generateResponse(message,user.username));
    acknowledge('Message delivered');
  
  })

  socket.on('send-location', (locationData, acknowledge)=> {
    const user = getUser(socket.id);
    io.to(user.room).emit('location-message', generateResponse(`https://google.com/maps?q=${locationData.latitude},${locationData.longitude}`, user.username));
    acknowledge('Location shared');
  })

  socket.on('disconnect', ()=> {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit('server-message', generateResponse(`${user.username} has left the chat`, 'Admin'));
      io.to(user.room).emit('room-data', {
        room: user.room,
        users: getUsersInRoom(user.room),
      })
    }
    
  })
})

server.listen(port, ()=> {
  console.log(`Server is up on port ${port}`);
})