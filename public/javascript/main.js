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


canvas.addEventListener('touchstart', (e) => {
    let touch = e.touches[0];
    const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
    });

    drawing = true;
    current.x = touch.clientX;
    current.y = touch.clientY;

    canvas.dispatchEvent(mouseEvent);

    drawLine(current.x, current.y, touch.clientX, touch.clientY, current.color, true);
    current.x = touch.clientX;
    current.y = touch.clientY;
});
// canvas.addEventListener('touchend', (e) => {
//     const mouseEvent = new MouseEvent("mouseup", {});
//     canvas.dispatchEvent(mouseEvent);
// });
canvas.addEventListener('touchmove', (e) => {
    const touch = e.touches[0];
    const mouseEvent = new MouseEvent("mousemove", {
        clientX: touch.clientX,
        clientY: touch.clientY
    });
    canvas.dispatchEvent(mouseEvent);
});



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

// chat 
const btnLogin = document.getElementById('btnLogin'),
      username = document.getElementById('username'),
      mainDiv = document.getElementById('mainDiv'),
      userForm = document.getElementById('userForm'),
      totUsers = document.getElementById('totUsers'),
      chatDiv = document.getElementById('chatDiv'),
      chat = document.getElementById('chat'),
      btnSendMsg = document.getElementById('btnSendMsg'),
      messageArea = document.getElementById('message');

btnLogin.addEventListener('click', login);
btnSendMsg.addEventListener('click', sendMessage);
messageArea.addEventListener('keypress', keyPress);


function login(e) {
    if(username.value.length <=2){
        alert('Username too small');
        return;
    }
    if(username.value.length >=15){
        alert('Username too big');
        return;
    }
    socket.emit('new user', username.value);
    
    userForm.style.display = 'none';
    mainDiv.style.display = 'block';
    chatDiv.style.display = 'block';
    e.preventDefault();
}

function keyPress(e) {
    if (e.keyCode === 13){
        sendMessage(e);
        return;
    }
    socket.emit('typing', username.value)
}

socket.on('typing', data => {
    let li = document.querySelector('.typing');
    li.style.display = 'inline';
    li.innerHTML = `${data} is typing`;
});

socket.on('typing stoped',() =>{
    document.querySelector('.typing').style.display = 'none';
})

function sendMessage(e) {
    let message = messageArea.value;
    messageArea.value = '';
    if (message.toLowerCase() === ':master:'){
        document.body.style.backgroundColor = 'black';
        document.body.style.color = 'white';
        canvas.style.borderColor = 'white';
        return;
    }

    if(message.toLowerCase() === ':clear:'){
        socket.emit('clear');
        return;
    }

    socket.emit('send message', message);
    e.preventDefault();
}

socket.on('clear', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
});

socket.on('new user', (user) => {
    let li = document.createElement('li');
    li.innerHTML = `<small><strong>${user}</strong> connected to the chat. Say hello to him</small>`;
    chat.appendChild(li);
});

socket.on('send message', data => {
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

// Prevent scrolling when touching the canvas
document.body.addEventListener("touchstart", function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  }, false);
  document.body.addEventListener("touchend", function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  }, false);
  document.body.addEventListener("touchmove", function (e) {
    if (e.target == canvas) {
      e.preventDefault();
    }
  }, false);