function getNumber(string) {
    var matches = string.match(/-mr([0-9]+)/);
    console.log(matches);
    return matches[1];
}
getNumber("something30-mr200");

console.log("EC-1098".match(/EC-(.*)/)[1])

console.log("qr/1X8610702Y3394646.png".match(/qr\/(.*).png/)[1])

var test = {'red':'#FF0000', 'blue':'#0000FF'};
delete test.blue; // or use => delete test['blue'];
console.log(test);