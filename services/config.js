var request = require('request');
var sanboxUrl = 'https://api.sandbox.paypal.com';
var clientId = "AcuuDiWgApKeQx7oY6wuGh2kbAIzy8B1NrruTzVl_vn3Dqv7a-EYGKlHRMb70fjc3eX3EP5rlM3VUp8g"; //india-business
var secret = "ELxGTdUhk3gGuO7nFv1sDF5waqAsUcKDoA0djtfIYgGVIXEjealGQvq93-vdWsc8rvHnNVOfeNdvngWE";

//var secret = process.env.CLIENT_SECRET;

var basicAuth = new Buffer(clientId+":"+secret).toString('base64') ;

var initialize = function(){  
    var options = {
        uri: sanboxUrl + '/v1/oauth2/token',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic '+basicAuth
        },
        body: "grant_type=client_credentials&response_type=token&return_authn_schemes=true&ignoreCache=true"
            
    }; 
    return new Promise(function(resolve, reject) { 
        request(options, function (err, response) {
            if (err) {
                console.error(err);
                reject(err);
            }
            var access_token = JSON.parse(response.body).access_token; 
            console.log(access_token);
            resolve(access_token);
        });
    });
};

module.exports = initialize;