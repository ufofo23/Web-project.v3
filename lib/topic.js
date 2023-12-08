var url = require('url');
var fs = require('fs');
var qs = require('querystring');
var path = require('path'); 
var template = require('./template');

exports.home = (request, response)=>{
    fs.readdir('./data', 'utf8', (err, filelist)=>{
        fs.readFile(`./welcome`, (err, description)=>{
        var list = template.list(filelist);
        var title = "반갑습니다.";
        var html = template.HTML(title, list, '<pre id="body">'+description+'</pre>', `
        <input class="control" type="button" onclick="location.href='/create'" value="create">
        `);
        response.writeHead(200);
        response.end(html);
    });
});
}

exports.page = (request, response)=>{
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    fs.readdir("./data", 'utf8', (err, filelist)=>{
        fs.readFile(`./data/${queryData.folder}/${queryData.id}`, (err, description)=>{
            var list = template.list(filelist);
            var categories = queryData.folder;
            var title = queryData.id;
            var html = template.HTML(title, list, '<pre id="body">'+description+'</pre>', `
            <input class="control" type="button" onclick="location.href='/create'" value="create">
            <input class="control" type="button" onclick="location.href='/update?folder=${categories}&id=${title}'" value="update">
            <form class="control" action="/delete_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="hidden" name="categories" value="${categories}">
                <input type="submit" value="delete">
            </form>
            `);
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create = (request, response)=>{
    fs.readdir('./data', 'utf8', (err, filelist)=>{
        var list = template.list(filelist);
        var title = "Create";
        var categories = template.categories(filelist);
        var html = template.HTML(title, list, `
        <form action="/create_process" method="post">
            ${categories}
            <p><input id="create_title"  type="text" name="title" placeholder="title"></p>
            <p><textarea id="create_desc" name="description" placeholder="description"></textarea></p>
            <p><input type="submit" value="submit"></p>
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
        var title = post.title;
        var description = post.description;
        var categories = post.categories;
        if (categories === 'new') {
            fs.mkdir(path.join(__dirname, `../data/${title}`), err=>{
                fs.writeFile(`./data/${title}/${title}`, description, 'utf8', ()=>{
                    response.writeHead(302, {Location:`/?folder=${title}&id=${title}`});
                    response.end();
                });
            });
        } else {
            fs.writeFile(`./data/${categories}/${title}`, description, 'utf8', ()=>{
                response.writeHead(302, {Location:`/?folder=${categories}&id=${title}`});
                response.end();
            });
        }
    });
}

exports.update = (request, response)=>{
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    fs.readdir('./data', 'utf8', (err, filelist)=>{
        fs.readFile(`./data/${queryData.folder}/${queryData.id}`, (err, description)=>{
            var list = template.list(filelist);
            var title = queryData.id;
            var categories = queryData.folder;
            var html = template.HTML(title, list, `
            <form action="/update_process" method="post">
                <input type="hidden" name="id" value="${title}">
                <input type="hidden" name="categories" value="${categories}">
                <p><input style="width:50vw" type="text" name="title" placeholder="title" value="${title}"></p>
                <p><textarea style="width:50.2vw; height:60vh;" name="description" placeholder="description">${description}</textarea></p>
                <p><input type="submit" value="submit"></p>
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
        var id = post.id;
        var title = post.title;
        var folder = post.categories;
        var description = post.description;
        fs.rename(`./data/${folder}/${id}`, `./data/${folder}/${title}`, ()=>{
            fs.writeFile(`./data/${folder}/${title}`, description, 'utf8', ()=>{
                response.writeHead(302, {Location:`/?folder=${folder}&id=${title}`});
                response.end();
            });
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
        var id = post.id;
        var folder = post.categories;
        if(id !== folder){
            fs.unlink(`./data/${folder}/${id}`, ()=>{
                response.writeHead(302, {Location:`/`});
                response.end();
            });
        } else {
            fs.rmdir(`./data/${id}`, {recursive: true, force: true}, ()=>{
                response.writeHead(302, {Location:`/`});
                response.end();
            });
        }
    });
}