var express = require("express");

var app = express.Router();

app.get("/", function(req, res){
	res.sendFile(__basedir + '/public/view/qr-pay.html');
});

app.get("/thankyou", function(req, res){
	res.sendFile(__basedir + '/public/view/thankyou.html');
});

module.exports = app;
