const socket = io.connect(),
      canvas = document.getElementById('canvas'),
      context = canvas.getContext('2d');

let drawing = false;
let current = {
    color: 'blue'
};

canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseout', onMouseUp);
canvas.addEventListener('mouseup', onMouseUp);

socket.on('drawing', onDrawingEvent);


function onDrawingEvent(data){
    var w = canvas.width;
    var h = canvas.height;
    drawLine(data.x0 * w, data.y0 * h, data.x1 * w, data.y1 * h, data.color);
  }

function drawLine(x0, y0, x1, y1, color, emit) {
    context.beginPath();
    context.moveTo(x0, y0);
    context.lineTo(x1, y1);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
    context.closePath();

    if(!emit) return;
    let w = canvas.width;
    let h = canvas.height;

    socket.emit('drawing', {
        x0: x0 / w,
        y0: y0 / h,
        x1: x1 / w,
        y1: y1 / h,
        color: color
    });

}


function onMouseMove(e) {
    if (!drawing) return;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
    current.x = e.clientX;
    current.y = e.clientY;
}

function onMouseUp(e) {
    if (!drawing) { return; }
    drawing = false;
    drawLine(current.x, current.y, e.clientX, e.clientY, current.color, true);
}

function onMouseDown(e) {
    drawing = true;
    current.x = e.clientX;
    current.y = e.clientY;
}







const btnLogin = document.getElementById('btnLogin'),
      username = document.getElementById('username'),
      mainDiv = document.getElementById('mainDiv'),
      userForm = document.getElementById('userForm'),
      totUsers = document.getElementById('totUsers'),
      chatDiv = document.getElementById('chatDiv'),
      chat = document.getElementById('chat'),
      btnSendMsg = document.getElementById('btnSendMsg'),
      messageArea = document.getElementById('message'),
      joke = document.getElementById('joke');

btnLogin.addEventListener('click', login);
btnSendMsg.addEventListener('click', sendMessage);
messageArea.addEventListener('keypress', sendMessageEnter);

function login(e) {
    socket.emit('new user', username.value);
    
    userForm.style.display = 'none';
    joke.style.display = 'none';
    mainDiv.style.display = 'block';
    chatDiv.style.display = 'block';
    e.preventDefault();
}

function sendMessageEnter(e) {

    if (e.keyCode === 13){
        sendMessage(e);
    }
}

function sendMessage(e) {
    socket.emit('send message', messageArea.value);
    messageArea.value = '';
    e.preventDefault();
}

socket.on('new user', (user) => {
    let li = document.createElement('li');
    li.innerHTML = `<small><strong>${user}</strong> connected to the chat. Say hello to him</small>`;
    chat.appendChild(li);
});

socket.on('send message', data => {
    console.log(data);
    
    let li = document.createElement('li');
    li.innerHTML = `<strong>${data.username}: </strong> ${data.message}`;
    chat.appendChild(li);
});

socket.on('all connections', data => {
    totUsers.textContent = data;
});

socket.on('disconnected', username => {
    if(!username) return;
    let li = document.createElement('li');
    li.innerHTML = `<small><strong>${username}</strong> disconnected of the chat.</small>`;
    chat.appendChild(li);
});

console.log('SE VOCÊ ESTÁ LENDO ISSO, É PORQUE FOI HACKEADO');