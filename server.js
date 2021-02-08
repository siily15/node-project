const express = require('express');
const app = express();

const http = require('http').createServer(app);
const socketio = require('socket.io');
const io = socketio(http)

const session = require('express-session');
const redis = require('redis');
const connectRedis = require('connect-redis');

const{currentUser} = require

var bodyParser = require('body-parser');
const path = require('path');

const port = 8000;
const userList = {};

// config
app.use('/public', express.static('./public/'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Run node.js server
http.listen(port, () => {
    console.log('listening on *:' + port);
});

// redis server
const RedisStore = connectRedis(session);

//Configure redis client
const redisClient = redis.createClient({
    host: 'localhost',
    port: 6379
})

redisClient.on('error', function(err) {
    console.log('Could not establish a connection with redis. ' + err);
});
redisClient.on('connect', function(err) {
    console.log('Connected to redis successfully');
});


// Define middleware for Redis and use it with Express and Socket.io
const sessionMiddleware = session({
    store: new RedisStore({ client: redisClient }),
    secret: 'secret$%^134',
    resave: true,
    saveUninitialized: false,
    cookie: {
        secure: false, // if true only transmit cookie over https
        httpOnly: false, // if true prevent client side JS from reading the cookie 
        maxAge: 1000 * 60 * 60 * 24 // session max age in miliseconds
    }
});

app.use(sessionMiddleware);

io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
});




// Router // Here are all GET, POST, PUT, DELETE routes defined for the app
app.get("/", (req, res) => {
    sess = req.session;

    if (sess.username && sess.password) {
        sess = req.session;
        if (sess.username) {
            res.sendFile(__dirname + '/public/index.html');
        }
    } else {
        res.sendFile(__dirname + "/public/login.html");
    }
});

app.post("/login", (req, res) => {
    redisClient.hgetall('users', (err, result) => {

        let isSuccess = false;

        if (req.body.username in result) {
            if (result[req.body.username] == req.body.password) {
                isSuccess = true;
            }
        }

        if (isSuccess) {
            sess = req.session;
            sess.username = req.body.username;
            sess.password = req.body.password;
            console.log('login', req.body.username, req.body.password, sess.username, sess.password);
            res.json({ response: 'success' });
        } else {
            res.json({ response: 'errorWrongCredentials' });
        }
    });
});

app.post("/register", (req, res) => {
    console.log(req.body.username, req.body.password, 'register');

    redisClient.hgetall('users', (err, result) => {
        let isSuccess = false;
        if (result) {
            if (req.body.username in result) {
                isSuccess = false
            }
            isSuccess = true;
        } else {
            isSuccess = true;

        }
        if (isSuccess) {
            redisClient.hset('users', req.body.username, req.body.password);
            res.json({ response: 'success' });
        } else {
            res.json({ response: 'errorUserExists' });

        }
    });
});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return console.log(err);
        }
        res.redirect("/")
    });
});



// Listen socket.io connections from client side
io.on('connection', (socket) => {
    const sess = socket.request.session

    // On connection update user list
    userList[sess.username] = socket.id;
    io.emit('updateUserList', userList);
    socket.emit('myUserName', sess.username);

    // On connection emit drawing

    socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));


    

    // On chat message from user emit to all users who are connected
    socket.on('chat_message', msg => {
        io.emit('chat_message', { 'message': msg, 'socketId': socket.id, 'user': sess.username });
    });

    // On disconnect update user list
    socket.on('disconnect', () => {
        console.log('user ' + socket.id + ' disconnected');
        delete userList[sess.username];
        io.emit('updateUserList', userList);
    });



        // (2): The server recieves a ping event
    // from the browser on this socket
    socket.on('ping', function ( data ) {
  
        console.log('socket: server recieves ping (2)');
    
        // (3): Return a pong event to the browser
        // echoing back the data from the ping event 
        socket.emit( 'pong', data );   
    
        console.log('socket: server sends pong (3)');
    
        });



    
});


    socket.on('sendYo', data => {
        socket.to(data.socketId).emit('reciveYo', { 'user': sess.username });
    });
});


app.use(express.static(__dirname + '/public'));

function onConnection(socket){
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
}

io.on('connection', onConnection);




=======
// Run node.js server
http.listen(port, () => {
    console.log('listening on *:' + port);
});

