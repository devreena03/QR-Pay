const qr = require('qr-image');
const fs = require('fs');
const path = require("path");

var qrGenerator = function(qr_txt) {

    var qr_png = qr.imageSync(qr_txt,{ type: 'png'})
    let qr_code_file_name = qr_txt.match(/token=EC-(.*)/)[1] + '.png';
 
    fs.writeFileSync(path.join(__dirname, '../','public','qr/' + qr_code_file_name), qr_png, (err) => {      
        if(err){
            console.log(err);
        }      
    });
    return qr_code_file_name;
};
module.exports = qrGenerator;
