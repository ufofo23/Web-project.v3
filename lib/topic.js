var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var db = require('./db')
var template = require('./template');

exports.home = (request, response)=>{
    db.query("SELECT * FROM `topic` ORDER BY name", (err, topics)=>{
        if (err) {
            throw err;
        }
        fs.readFile(`./welcome`, (err, description)=>{
        var list = template.list(topics);
        var title = "반갑습니다.";
        var html = template.HTML(title, list, '<pre id="body">'+description+'</pre>', `
        <input class="control" type="button" onclick="location.href='/create'" value="create">
        <input class="control" type="button" onclick="location.href='/category_home'" value="category">
        `);
        response.writeHead(200);
        response.end(html);
        });
    });
}

exports.page = (request, response)=>{
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query("SELECT * FROM topic ORDER BY name", (err, topics)=>{
        if (err) {
            throw err;
        }
        db.query("SELECT * FROM `index` WHERE category_id=? AND id=?", [queryData.folder, queryData.id], (err, index)=>{
            if(err) {
                throw err;
            }
            var list = template.list(topics);
            var html = template.HTML(index[0].title, list, '<pre id="body">'+index[0].description+'</pre>', `
            <input class="control" type="button" onclick="location.href='/create'" value="create">
            <input class="control" type="button" onclick="location.href='/update?folder=${queryData.folder}&id=${queryData.id}'" value="update">
            <form class="control" action="/delete_process" method="post">
                <input type="hidden" name="id" value="${queryData.id}">
                <input type="hidden" name="categories" value="${queryData.folder}">
                <input type="submit" value="delete">
            </form>
            `);
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create = (request, response)=>{
    db.query("SELECT * FROM topic", (err, topics)=>{
        if (err) {
            throw err;
        }
        var list = template.list(topics);
        var title = "Create";
        var categories = template.categories(topics);
        var html = template.HTML(title, list, `
        <form action="/create_process" method="post">
            ${categories}
            <p><input id="create_title"  type="text" name="title" placeholder="title"></p>
            <p><textarea id="create_desc" name="description" placeholder="description"></textarea></p>
            <p><input type="submit" value="create"></p>
        </form>`, `
        <input class="control" type="button" onclick="location.href='/create'" value="create">
        `);
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
        if (post.categories === 'new') {
            db.query("INSERT INTO topic (name) VALUES (?)", [post.title], (err, result)=>{
                if (err) {
                    throw err;
                }
                db.query("INSERT INTO `index` (title, description, category_id) VALUES (?, ?, ?)",
                [post.title, post.description, result.insertId], (err2, result2)=>{
                    if (err2) {
                        throw err2;
                    }
                    response.writeHead(302, {Location:`/?folder=${result.insertId}&id=${result2.insertId}`});
                    response.end();
                });
            });
        } else {
            db.query("SELECT * FROM topic WHERE name=?", [post.categories], (err, topic)=>{
                if (err) {
                    throw err;
                }
                db.query("INSERT INTO `index` (title, description, category_id) VALUES (?, ?, ?)",
                [post.title, post.description, topic[0].id], (err2, result)=>{
                    if (err2) {
                        throw err2;
                    }
                    response.writeHead(302, {Location:`/?folder=${topic[0].id}&id=${result.insertId}`});
                    response.end();
                });
            });
        }
    });
}

exports.update = (request, response)=>{
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    db.query("SELECT * FROM topic", (err, topics)=>{
        if (err) {
            throw err;
        }
        db.query("SELECT * FROM `index` WHERE category_id=? AND id=?", [queryData.folder, queryData.id], (err, index)=>{
            if(err) {
                throw err;
            }
            var list = template.list(topics);
            var html = template.HTML(index[0].title, list, `
            <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${queryData.id}">
                <input type="hidden" name="categories" value="${queryData.folder}">
                ${template.categorySelect(topics, index[0].category_id)}
                <p><input style="width:50vw" type="text" name="title" placeholder="title" value="${index[0].title}"></p>
                <p><textarea style="width:50.2vw; height:60vh;" name="description" placeholder="description">${index[0].description}</textarea></p>
                <p><input type="submit" value="update"></p>
            </form>`, `
            <input class="control" type="button" onclick="location.href='/create'" value="create">
            `);
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
        if (post.category === '-1') {
            db.query("INSERT INTO topic (name) VALUES (?)", [post.title], (err, result)=>{
                if (err) {
                    throw err;
                }
                db.query("UPDATE `index` SET title=?, description=?, category_id=? WHERE id=?",
                [post.title, post.description, result.insertId, post.id], (err2, result2)=>{
                    if (err2) {
                        throw err2;
                    }
                    response.writeHead(302, {Location:`/?folder=${result.insertId}&id=${post.id}`});
                    response.end();
                });
            });
        } else {
            db.query("UPDATE `index` SET title=?, description=?, category_id=? WHERE id=?", 
            [post.title, post.description, post.category, post.id],
            (err2, result2)=>{
                if (err2) {
                    throw err2;
                }
                response.writeHead(302, {Location:`/?folder=${post.category}&id=${post.id}`});
                response.end();
            });
        }
    
    });
}

exports.delete_process = (request, response)=>{
    var body = '';
    request.on('data', data=>{
        body += data;
    });
    request.on('end', ()=>{
        var post = qs.parse(body);
        db.query("DELETE FROM `index` WHERE id=?", [post.id], (err, result)=>{
            if (err) {
                throw err;
            }
            db.query("SELECT * FROM `index` WHERE category_id=?", [post.categories], (err2, index)=>{
                if (err2) {
                    throw err2;
                }
                response.writeHead(302, {Location:`/`});
                response.end();
            });
        });
    });
}