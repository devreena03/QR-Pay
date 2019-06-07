var express = require("express");
var bodyParser = require('body-parser');
var socketService = require('./services/socketService');
console.log(socketService);

var qr = require('./routes/ec-qr');
var index = require('./routes/index')

var app = express();
const server = require('http').createServer(app);
const io = require('socket.io').listen(server);

global.__basedir = __dirname;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
      extended: true
}));

app.use(express.static(__dirname+'/public'));

app.use('/', index);
app.use('/qr-pay',qr);

io.sockets.on('connection', socketService.connect);

var port = process.env.PORT || '8081';
server.listen(port, function(){
	console.log('server started at port '+ port);
});

