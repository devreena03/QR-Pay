var express = require('express');
var request = require('request');
var initialize = require("../services/config");
var qrGenerator = require("../services/qrcodeGenerator");
var socketService = require("../services/socketService");

var router = express.Router();
var sanboxUrl = 'https://api.sandbox.paypal.com';

router.post('/create-payment', function (req, res) {
    console.log("create");
    // setTimeout(()=>socketService.paymentCompleteEvent("12345"),500);
    // res.json({
    //     'qr_img': "qr/" + "1559197286956.png"
    // });
    var options = {
        uri: sanboxUrl + '/v1/payments/payment',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: req.body,
        json: true
    };
    initialize().then(function (access_token) {
        options.headers.Authorization = 'Bearer ' + access_token;
        request(options, function (err, response) {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            console.log(response.body);
            var filename = qrGenerator(getReturnURL(response.body.links));
            res.json({
                'qr_img': "qr/" + filename
            });
        });
    }, function (err) {
        console.log(err);
    });
});
function getReturnURL(links) {
    for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (link.rel == "approval_url") {
            return link.href;
        }
    }
}
router.get('/payment/:id', function (req, res) {
    console.log("get details :" + req.params.id);
    var options = {
        uri: sanboxUrl + '/v1/payments/payment' + req.params.id,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    initialize().then(function (access_token) {
        options.headers.Authorization = 'Bearer ' + access_token;
        request(options, function (err, response) {
            if (err) {
                console.error(err);
                return res.sendStatus(500);
            }
            console.log(response);
            res.json(response.body);
        });
    });
});

router.get('/success', function (req, res) {
    console.log(req.query);
    var options = {
        uri: sanboxUrl + '/v1/payments/payment/' + req.query.paymentId + '/execute',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: {
            "payer_id": req.query.PayerID
        },
        json: true

    };
    initialize().then(function (access_token) {
        options.headers.Authorization = 'Bearer ' + access_token;
        request(options, function (err, response) {
            if (err) {
                console.error(err);
                return;
            }
            console.log(response.body);
            if (response.statusCode == 200 && response.body.state == "approved") {
                res.status(response.statusCode);
                res.redirect('/thankyou?operation=success&paymentId=' + req.query.paymentId);
            } else {
                res.status(response.statusCode);
                res.redirect('/thankyou?operation=failed&paymentId=' + req.query.paymentId);
            }
            socketService.paymentCompleteEvent(req.query.token.match(/EC-(.*)/)[1]);
            res.end();
        });
    }, function (err) {
        console.log(err);
    });
});

router.get('/cancel', function (req, res) {
    console.log("payment cancel");
    res.redirect('/thankyou?operation=cancel&token=' + req.query.token);
});

module.exports = router;