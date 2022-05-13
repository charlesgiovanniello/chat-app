const express = require('express')
const http = require('http')
const path = require('path')
const { disconnect } = require('process')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join((__dirname),'../public')
app.use(express.static(publicDirectoryPath))


app.get('',(req,res)=>{
    res.send()
})
io.on('connection', (socket) => {
    console.log('New web socket connection')
    
    socket.on('sendMessage', (message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()

        if(filter.isProfane(message)){
            socket.emit(
                'message',
                generateMessage('Profanity is not allowed you bitch ass mother fucka.')
            );
            return callback();
        }
        

        io.to(user.room).emit('message',generateMessage(user.username,message))
        callback('Delivered')
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,coords))
        callback('Location shared!')

    })
    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!`))
            io.to(user.room).emit('roomData',{
                room:user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })

    socket.on('join', (options,callback)=>{
        const {error,user} = addUser({ id:socket.id, ...options })

        if(error){
            return callback(error)
        }

        socket.join(user.room)
        socket.emit('message',generateMessage('Admin',`Welcome ${user.username}!`))
        socket.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })

})


server.listen(port, () =>{
    console.log(`Application is up and listening on port ${port}`)
})
