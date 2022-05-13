const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ( {id,username,room} )=>{
    //Clean the data
    username = username.toLowerCase().trim()
    room = room.toLowerCase().trim()

    if(!room || !username){
        return {
            error:'Username and room are required!'
        }
    }

    //Check for existing user in room
    const existingUser = users.find((user)=>{
        return (user.room === room && user.username === username)
    })

    if(existingUser){
        return {
            error:'That username is not available for this room'
        }
    }

    //Store user
    const user = {id,username,room}
    users.push(user)
    return {user}

}

const removeUser = (id)=>{
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id)=>{
    const user = users.find((user)=> user.id === id)

    if(!user){
        return {
            error:'That user doesnt exist!'
        }
    }

    return user
}

const getUsersInRoom = (room)=>{
    return users.filter((user)=> user.room === room)
}
module.exports={
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}


