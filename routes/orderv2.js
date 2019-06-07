var express = require('express');
var request = require('request');
var initialize = require("../services/config");

var router = express.Router();
var sanboxUrl = 'https://api.sandbox.paypal.com';

router.post('/create/', function(req, res) {
    console.log(req.body);
    var options = {
        uri: sanboxUrl + '/v2/checkout/orders',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          },
        body: req.body,
        json: true
            
    };
    initialize().then(function(access_token){
        options.headers.Authorization = 'Bearer '+access_token;
        request(options, function (err, response) {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            console.log(response);
            res.json(response.body);
        });
    }, function(err){
        console.log(err);
    });
});

router.post('/capture/', function(req, res) {
    var options = {
        uri: sanboxUrl + '/v2/checkout/orders/'+req.body.id+'/capture',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
          }          
    };
    initialize().then(function(access_token){
        options.headers.Authorization = 'Bearer '+access_token;
        request(options, function (err, response) {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
           // console.log(response.body);
            res.json({
                "status" : "success"
            });
        });
    });
});


module.exports = router;