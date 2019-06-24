const fs = require('fs');
const path = require("path");

var connections = [];
var paymentConnections = {};

exports.connect = function (socket) {
    connections.push(socket);
    console.log(socket.id);
    console.log(' %s sockets is connected', connections.length);
    socket.on('disconnect', () => {
        connections.splice(connections.indexOf(socket), 1);
        console.log(' %s sockets is connected', connections.length);
    });
    socket.on('payment-pending', (token) => {
        console.log('payment-pending received :', token);
        paymentConnections[token] = socket;
        console.log(socket.id);
    });
}

exports.paymentCompleteEvent = function (token, transactionDetails) {
    var socket = paymentConnections[token];
    console.log(socket.id);
    socket.emit('payment-complete', transactionDetails);
    cleanup(token);
}

function cleanup(token){
    delete paymentConnections[token];
    console.log(Object.keys(paymentConnections));
    fs.unlink(path.join(__dirname, '../public/qr/' + token +'.png'), (err) => {
        if (err) throw err;
        console.log('successfully deleted');
      });
}

