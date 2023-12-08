var fs = require('fs');

exports.css = (request, response)=>{
    fs.readFile("./style.css", 'utf8', function(err, data){
        response.writeHead(200);
        response.write(data);
        response.end();
    })
}