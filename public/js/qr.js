$(document).ready(function () {

  var socket = io.connect();
  $('#paypal-button').click(function () {
    $('#payment-success').hide();
    var body = {
      application_context: {
        "user_action": "commit"
      },
      intent: "sale",
      payer: {
        "payment_method": "paypal"
      },
      transactions: [
        {
          amount: {
            total: document.getElementById("amountId").value,
            currency: document.getElementById("selectedCurrency").value
          }
        }
      ],
      redirect_urls: {
        "return_url": "https://qrecpay.herokuapp.com/qr-pay/success",
        "cancel_url": "https://qrecpay.herokuapp.com/qr-pay/cancel"
        // "return_url": "https://nequeo.serveo.net/qr-pay/success",
        // "cancel_url": "https://nequeo.serveo.net/qr-pay/cancel"
      }
    };

    fetch('/qr-pay/create-payment/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    }).then(r => r.json())
      .then(data => {
        console.log(data);
        $('#qr-code-img').attr("src", data.qr_img);
        console.log("create socket emit");
        socket.emit('payment-pending', data.qr_img.match(/qr\/(.*).png/)[1]);
      });
  })

  socket.on('payment-complete', function (data) {
    console.log(data);
    $('#qr-code-img').attr("src", '');
    $('#payment-success').show();
    $('#outputData').text(JSON.stringify(data,null,2));
   // $('#payment-success').html("Payment Success");
  });
});


