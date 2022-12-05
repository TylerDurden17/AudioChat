const express = require('express');
require('dotenv').config()
const app = express();
//create a server to use with socket io
const server = require('http').createServer(app)
const { v4: uuidV4 } = require('uuid')
const io = require('socket.io')(server)

const port = process.env.PORT || 3000;

// View engine setup
app.set('view engine' , 'ejs')
//Serving static files(css files, js files, images) in Express using built-in middleware function in Express
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.render('home');
})

app.get('/room', (req, res) => {
    //res.redirect(`/${uuidV4()}`);
    //fixed room for mvp for certain users to begin with
    res.redirect(`/48fbab23-7b22-40a2-8b96-7692f200128a`);
})

app.get('/:room', (req, res) => {
    return res.render('room', {roomId: req.params.room});
});

io.on('connection', (socket) => {
    
    socket.on('join-room', (roomId, userId, connectedPerson) => {

        socket.join(roomId);
        socket.broadcast.to(roomId).emit('user-connected',
         userId, connectedPerson);

        socket.on('send-chat-message', message => {
            socket.broadcast.to(roomId).emit('chat-message',
             {message:message, userId:userId, connectedPerson:connectedPerson})
        });
        
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected',
             userId, connectedPerson)
        });
    });
});

server.listen(port, ()=>{
    console.log(`running on port ${port}`);
});