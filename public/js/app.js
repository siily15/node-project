var socket = io();

const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const userList = document.getElementById('user-list');
const pingbutton = document.getElementById('pingbutton');
var userName=document.getElementById('username')



messageInput.focus();

messageInput.addEventListener('keydown', event => {
    if (event.key == 'Enter' && messageInput.value.trim() !== '') {
        socket.emit('chat_message', messageInput.value);
        messageInput.value = '';
    }
});


socket.on('connection', userId => {// Setup basic express server
    const express = require('express');
    const app = express();
    const path = require('path');
    const server = require('http').createServer(app);
    const io = require('socket.io')(server);
    const port = process.env.PORT || 3000;
    
    server.listen(port, () => {
      console.log('Server listening at port %d', port);
    });


    
    
    // Routing
    app.use(express.static(path.join(__dirname, 'public')));
    
    // Chatroom
    
    let numUsers = 0;
    
    io.on('connection', (socket) => {
      let addedUser = false;
    
      // when the client emits 'new message', this listens and executes
      socket.on('new message', (data) => {
        // we tell the client to execute 'new message'
        socket.broadcast.emit('new message', {
          username: socket.username,
          message: data
        });
      });
    
      // when the client emits 'add user', this listens and executes
      socket.on('add user', (username) => {
        if (addedUser) return;
    
        // we store the username in the socket session for this client
        socket.username = username;
        ++numUsers;
        addedUser = true;
        socket.emit('login', {
          numUsers: numUsers
        });
        // echo globally (all clients) that a person has connected
        socket.broadcast.emit('user joined', {
          username: socket.username,
          numUsers: numUsers
        });
      });
    
      // when the client emits 'typing', we broadcast it to others
      socket.on('typing', () => {
        socket.broadcast.emit('typing', {
          username: socket.username
        });
      });
    
      // when the client emits 'stop typing', we broadcast it to others
      socket.on('stop typing', () => {
        socket.broadcast.emit('stop typing', {
          username: socket.username
        });
      });
    
      // when the user disconnects.. perform this
      socket.on('disconnect', () => {
        if (addedUser) {
          --numUsers;
    
          // echo globally that this client has left
          socket.broadcast.emit('user left', {
            username: socket.username,
            numUsers: numUsers
          });
        }
      });
    });
    
    const item = document.createElement('li');
    item.textContent = 'User ' + userId + ' connected';
    chatMessages.appendChild(item);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('reciveYo', msgObj => {
    console.log(msgObj)
    const item = document.createElement('div');
    item.innerHTML = `
        <div>
            <p><b>${ msgObj.user }</b></p>
            <p>Yo!</p>
        </div>
    `
    chatMessages.appendChild(item);
});

socket.on('updateUserList', userListObj => {
    userList.innerHTML = "";
    for (const userName in userListObj) {
        userList.innerHTML += `
        <div>

            <p>${userName}</p>
=======
            <p class="user" data-socketid="${ userListObj[userName] }">${ userName }</p>

        </div>`;
    }
});
// A user connects to the server (opens a socket)

const users = document.getElementsByClassName('user');

Array.prototype.forEach.call(users, el => {
    el.addEventListener('click', e => {
        console.log(e.currentTarget.dataset.socketid);
        socket.emit('sendYo', { socketId: e.currentTarget.dataset.socketid });
        console.log('click');
    });
})

socket.on('chat_message', msgObj => {
    console.log(msgObj)
    const item = document.createElement('div');
    item.innerHTML = `
        <div class="chats">
            <p><b class="username">${msgObj.user}</b></p>
            <p class="chatmessage">${msgObj.message}</p>
        </div>
    `
    chatMessages.appendChild(item);
});

socket.on('myUserName', userName =>{
    const userNameDiv=document.getElementById('user-name')
    userNameDiv.innerHTML = `
        Welcome back, ${userName}` 

})

document.getElementById('logout').onclick = function () {
    console.log('logout');
    location.href = '/logout';
};
