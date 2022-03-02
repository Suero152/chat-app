const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const {Server} = require('socket.io')
const io = new Server(server)
let flood = require('./public/js/anti-flood.js')
let usersTyping = {}
let usersNames = {}
var path = require('path')
const serverMessages = []


app.use(express.static(path.join(__dirname, 'public')));
app.get('/chat', (req, res) => {
    res.sendFile(__dirname+'/public/screens/chat.html')
});

io.on('connection',(client)=>{
    let clientName
    client.emit('nick request')
    client.on('join', (name)=>{
        if (name.length >= 3 && name.length <= 14 && !(usersNames[client.id])){
            client.emit('messages', serverMessages)
            usersNames[client.id] = name
            io.emit('join', usersNames[client.id])
            clientName = usersNames[client.id]
        }else{
            client.emit('nick request')
        }

    })

        client.on('chat message', (msg) => {
            let response = flood.protect(io, client)
            if(response) {
            if (msg.length <= 150 && msg.trim().length > 0 && usersNames[client.id]) {
                serverMessages.push({author: client.id, message: `[${usersNames[client.id]}]: ${msg}`})
                io.emit('chat message', `[${usersNames[client.id]}]: ${msg}`)
            } else {
            }
            }else{
                client.emit('calm request')
            }
        });

    client.on('typing', (status)=>{
        if (status && !(usersTyping[client.id])){
            usersTyping[client.id] = true
            client.broadcast.emit('typing', Object.keys(usersTyping).length)
        }else if(!status){
            delete usersTyping[client.id]
            client.broadcast.emit('typing', Object.keys(usersTyping).length)
        }
    })

    client.on('disconnect', () => {
        if (usersTyping[client.id]){
            delete usersTyping[client.id]
            io.emit('typing', Object.keys(usersTyping).length)
        }
    });
    client.on('kick', (client_id)=>{
        function deleteMessages(id){
            serverMessages.forEach((v, i)=> {
                if (v['author'] == id) {
                    serverMessages.splice(i, 1)
                    deleteMessages(id)
                    return
                }
            })
        }
        deleteMessages(client_id)
        io.emit('messages', serverMessages)
        if (usersTyping[client.id]){
            delete usersTyping[client.id]
            io.emit('typing', Object.keys(usersTyping).length)
        }
    })
})

server.listen(process.env.PORT || '3000', () => {
    console.log('listening on *:3000');
    console.log('Visit localhost:3000/chat')
});