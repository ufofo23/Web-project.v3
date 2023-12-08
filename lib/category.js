var url = require('url');
var qs = require('querystring');
var db = require('./db')
var template = require('./template');

exports.home = (request, response)=>{
    db.query("SELECT * FROM topic ORDER BY name", (err, topics)=>{
        if (err) {
            throw err;
        }
        var title = 'Categories';
        var list = template.list(topics);
        var html = template.HTML(title, list,
        `
        ${template.topicTable(topics)}
        <style>
            table {
                border-collapse:collapse;
            }
            td {
                border:1px solid black;
            }
        </style>
        <form action="/category_create_process" method="post">
            <p>
                <input type="text" name="name" placeholder="New category">
            </p>
            <p>
                <input type="submit" value="create">
            </p>
        </form>
        `,
        ``
        );
        response.writeHead(200);
        response.end(html);
    });
}

exports.create_process = (request, response)=>{
    var body = '';
    request.on('data', data=>{
        body += data;
    });
    request.on('end', ()=>{
        var post = qs.parse(body);
        db.query("INSERT INTO topic (name) VALUES (?)",
        [post.name], (err, result)=>{
            if (err) {
                throw err;
            }
            response.writeHead(302, {Location:`/`});
            response.end();
        });
    });
}

exports.update = (request, response)=>{
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query("SELECT * FROM topic", (err, topics)=>{
        if (err) {
            throw err;
        }
        db.query("SELECT * FROM topic WHERE id=?", [queryData.id], (err2, result)=>{
            if (err2) {
                throw err2;
            }
            var list = template.list(topics);
            var html = template.HTML(result[0].name, list, `
            <form action="/category_update_process" method="post">
                <input type="hidden" name="id" value="${queryData.id}">
                <p><input style="width:50vw" type="text" name="name" placeholder="category" value="${result[0].name}"></p>
                <p><input type="submit" value="update"></p>
            </form>`, 
            `<input class="control" type="button" onclick="location.href='/category_home'" value="category">`);
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.update_process = (request, response)=>{
    var body = '';
    request.on('data', data=>{
        body += data;
    });
    request.on('end', ()=>{
        var post = qs.parse(body);
        db.query("UPDATE topic SET name=? WHERE id=?", [post.name, post.id],
        (err, result)=>{
            if (err) {
                throw err;
            }
            response.writeHead(302, {Location:'/'});
            response.end();
        });
    });
}

exports.delete_process = (request, response)=>{
    var body = '';
    request.on('data', data=>{
        body += data;
    });
    request.on('end', ()=>{
        var post = qs.parse(body);
        db.query("DELETE FROM topic WHERE id=?", [post.id],
        (err, result)=>{
            response.writeHead(302, {Location:'/'});
            response.end();
        });
    });
}