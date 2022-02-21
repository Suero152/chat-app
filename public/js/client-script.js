const socket = io();
const messages = document.getElementById('messages')
const form = document.getElementById('form');
const nickForm = document.getElementById('nick-form')
const nickInput = document.getElementById('nick-input')
const calmButton = document.getElementById('calm-button')
const pop_up_reason = document.getElementById('pop-up-reason')
const input = document.getElementById('input');
const hint = document.getElementById('type-hint')

function createMessage(content){
    const item = document.createElement('li');
    item.textContent = content
    messages.appendChild(item)
    window.scrollTo(0, document.body.scrollHeight)
}


form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
        socket.emit('chat message', input.value);
        socket.emit('typing', false);
        input.value = '';
    }
})
nickForm.addEventListener('submit', function(e) {
    messages.style.display = 'block'
    e.preventDefault();
    socket.emit('join', nickInput.value)
    document.getElementById('pop-ups').style.display = 'none'
    document.getElementById('nick').style.display = 'none'
    nickInput.value = ''
})
input.addEventListener('input', function() {
    if (input.value.trim().length >=1) {
        socket.emit('typing', true);
    }else{
        socket.emit('typing', false);
    }
})
calmButton.addEventListener('click', ()=>{
    messages.style.display = 'block'
    document.getElementById('pop-ups').style.display = 'none'
    document.getElementById('cooldown').style.display = 'none'
})

socket.on('messages', function(msgs){
    messages.innerHTML = ''
    for (const message of msgs){
        createMessage(message.message)
    }
})

socket.on('typing', function(amount){
    if (amount > 1 || (amount === 1 && input.value.trim().length === 0)) {
        hint.textContent = (input.value.trim().length === 0 ? (amount):(amount-1)) >= 2 ? `${input.value.trim().length === 0 ? (amount):(amount-1)} users are typing`:`1 user is typing.`
        hint.style.display = 'block'
    }else{hint.style.display = 'none'}
})

socket.on('chat message', function(msg){
    createMessage(msg)
})

socket.on('join', (name)=>{
    let notification = document.createElement('div')
    notification.className = 'notification'
    document.getElementById('notifications').appendChild(notification)
    notification.textContent = `${name} has joined the room.`
    notification.style.display = 'block'
    notification.style.opacity = '1'
    setTimeout(()=>{notification.style.opacity = '0'}, 2500)
    setTimeout(()=>{notification.remove()}, 9500)
})

socket.on('nick request', ()=>{
    messages.style.display = 'none'
    document.getElementById('pop-ups').style.display = 'block'
    document.getElementById('nick').style.display = 'block'
    nickInput.value = ''
})

socket.on('calm request', ()=>{
    messages.style.display = 'none'
    document.getElementById('pop-ups').style.display = 'block'
    document.getElementById('cooldown').style.display = 'block'
})

socket.on('kick', (reason)=>{
    messages.style.display = 'none'
    pop_up_reason.textContent = `You got kicked for the followed reason: ${reason}`
    calmButton.remove();form.remove();messages.remove();hint.remove()
    document.getElementById('pop-ups').style.display = 'block'
    document.getElementById('cooldown').style.display = 'block'
    socket.emit('kick', socket.id)
})