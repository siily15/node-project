var socket = io();

const messageInput = document.getElementById('message-input');
const chatMessages = document.getElementById('chat-messages');
const userList = document.getElementById('user-list');
const pingbutton = document.getElementById('pingbutton');



messageInput.focus();

messageInput.addEventListener('keydown', event => {
    if (event.key == 'Enter' && messageInput.value.trim() !== '') {
        socket.emit('chat_message', messageInput.value);
        messageInput.value = '';
    }
});

socket.on('connection', userId => {
    const item = document.createElement('li');
    item.textContent = 'User ' + userId + ' connected';
    chatMessages.appendChild(item);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('updateUserList', userListObj => {
    userList.innerHTML = "";
    for (const userName in userListObj) {
        userList.innerHTML += `
        <div>
            <p>${userName}</p>
        </div>`;
    }
});
// A user connects to the server (opens a socket)

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

document.getElementById('logout').onclick = function () {
    console.log('logout');
    location.href = '/logout';
};
