const express = require('express'),
	  app = express(),
      server = require('http').createServer(app),
      io = require('socket.io').listen(server),
      port = process.env.PORT || 3000;



app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html');
});
server.listen(port, () => console.log(`listening to port ${port}`));

io.sockets.on('connection', (socket) => {

	socket.on('drawing', (data) => {
		socket.broadcast.emit('drawing', data);
	});


});

