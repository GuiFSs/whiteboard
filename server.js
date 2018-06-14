const express = require('express'),
	  app = express(),
      server = require('http').createServer(app),
      io = require('socket.io').listen(server),
      port = process.env.PORT || 3000;


let users = [];
let connections = [];

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
server.listen(port, () => console.log(`listening to port ${port}`));

io.sockets.on('connection', (socket) => {

    connections.push(socket);

	socket.on('drawing', (data) => {
        newData = data;
        newData.color = 'red';
		socket.broadcast.emit('drawing', newData);
	});

    socket.on('new user', (data) => {
        socket.username = data;
        users.push(socket.username);

        socket.broadcast.emit('new user', socket.username);
        updateAllConnections();       
    });

    socket.on('send message', data => {
        io.sockets.emit('send message', {message: data, username: socket.username});
    });


    function updateAllConnections() {
        io.sockets.emit('all connections', connections.length); 
    }
    

    socket.on('disconnect', (data) => {
        socket.broadcast.emit('disconnected', users[users.indexOf(socket.username)]);
        users.splice(users.indexOf(socket.username), 1);
        connections.splice(connections.indexOf(socket), 1);
        updateAllConnections();
    });

});

