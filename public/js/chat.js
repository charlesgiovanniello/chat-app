const socket = io()
// server(emit) -> client receives -> sends ack -> back to server
// client(emit) -> server receives -> sends ack -> back to client

const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll = ()=>{
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible Height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container
    const containerHeight = $messages.scrollHeight

    //How far have i scrolled

    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

    // console.log($messageForm.scrollTop + $messageForm.clientHeight)
    // console.log($messageForm.scrollHeight)
    // if($messageForm.scrollTop + $messageForm.clientHeight == $messageForm.scrollHeight) {
    //     $newMessage.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"})
    // }
    
}


socket.on('message',(m)=>{
    console.log(m)
    const html = Mustache.render(messageTemplate,{
        message:m.text,
        createdAt:moment(m.createdAt).format('h:mm a'),
        username:m.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

socket.on('locationMessage', (message)=>{
    console.log(message)
    const html = Mustache.render(locationTemplate,{
        location:message.url,
        createdAt:moment(message.createdAt).format('h:mm a'),
        username:message.username
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
    
})

socket.on('roomData', ({room,users})=>{
    const html = Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
} )

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value
    socket.emit('sendMessage',message, (error)=>{
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()
        if(error){
            return console.log(error)
        }
        console.log('The message was delivered')
    })
})

$sendLocationButton.addEventListener('click', ()=>{
    $sendLocationButton.setAttribute('disabled','disabled')
    if(!navigator.geolocation){
        return alert('Geolocation is not supported by your browser! :(')
    }

    navigator.geolocation.getCurrentPosition((position)=>{
        const location = {
            longitude:position.coords.longitude,
            latitude:position.coords.latitude
        }
        socket.emit('sendLocation',location, (ack)=>{
            console.log(ack)
            $sendLocationButton.removeAttribute('disabled')
        })
    })

})

socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href ='/'
    }
})
