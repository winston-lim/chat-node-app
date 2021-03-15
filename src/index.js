const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const generateResponse = require('./utils/response');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const port = process.env.PORT || 3000;

const publicDirectoryPath = path.join(__dirname, '../public/');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket)=> {
  socket.on('disconnect', ()=> {
    io.emit('server-message', generateResponse('A user has left the chat'))
  })

  socket.on('join', ({username, room})=> {
    socket.join(room);
    socket.emit('server-message', generateResponse('Welcome'));
    socket.broadcast.to(room).emit('server-message', generateResponse(`${username} has joined the chat`));
  })

  socket.on('send-message', (message,acknowledge)=> {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return acknowledge('Message contains profanity')
    }
    io.emit('server-message', generateResponse(message));
    acknowledge('Message delivered');
  
  })
  socket.on('send-location', (locationData, acknowledge)=> {
    io.emit('location-message', generateResponse(`https://google.com/maps?q=${locationData.latitude},${locationData.longitude}`));
    acknowledge('Location shared');
  })
})

server.listen(port, ()=> {
  console.log(`Server is up on port ${port}`);
})