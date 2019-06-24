var express = require('express');
var request = require('request');
var initialize = require("../services/config");
var qrGenerator = require("../services/qrcodeGenerator");
var socketService = require("../services/socketService");

var router = express.Router();
var sanboxUrl = 'https://api.sandbox.paypal.com';

router.post('/create-payment', function (req, res) {
    console.log("create");
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
            var transactionDetails = {};
            if (response.statusCode == 200 && response.body.state == "approved") {
                transactionDetails = extractTransactionDetails(response.body);
                transactionDetails.status = 'success';
                res.status(response.statusCode);
                res.redirect('/thankyou?operation=success&paymentId=' + transactionDetails.txnId);
            } else {
                transactionDetails.status = 'failed';
                res.status(response.statusCode);
                res.redirect('/thankyou?operation=failed&paymentId=' + req.query.paymentId);
            }
            socketService.paymentCompleteEvent(req.query.token.match(/EC-(.*)/)[1], transactionDetails);
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

function extractTransactionDetails(data){
    var transactionDetails = {};
    transactionDetails.id = data.id;
    transactionDetails.state = data.state;
    transactionDetails.amount = data.transactions[0].amount.total;
    transactionDetails.currency = data.transactions[0].amount.currency;
    transactionDetails.buyerName = data.payer.payer_info.first_name+ " " + data.payer.payer_info.last_name;
    transactionDetails.buyerEmail = data.payer.payer_info.email;
    var related_resources = data.transactions[0].related_resources;
    for(var i=0; i< related_resources.length; i++){
        if(related_resources[i]["sale"]){
            transactionDetails["txnId"] = related_resources[i]["sale"].id;
        }
    }
    console.log(transactionDetails);
    return transactionDetails;
}

module.exports = router;