module.exports = {
    HTML: (title, list, body, control)=>{
        return `
        <!DOCTYPE html>
        <html lang="kr">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link rel="stylesheet" type="text/css" href="./style.css" />
            <title>호기심상자</title>
        </head>
        <body>
            <header id="header">
            <div onclick ="location.href='/'" style="cursor:pointer">
                <div id="title">
                    <h1>호기심상자</h1>
                    <h3>2023.08.07. ~ </h3>
                </div>
            </div>
            </header>
            <div id="grid">
                <div id="index">
                    ${list}
                    ${control}
                </div>
                <div id="main">
                <h2>${title}</h2>
                ${body}
                </div>
            </div>
        </body>
        </html>
        `;
    },
    list: (filelist)=>{
        var fs = require('fs');
        var list = '<ol>';
        var small_list = [];
        var children_li = "";
        for(let i = 0; i < filelist.length; ++i) {
            var small_filelist = fs.readdirSync(`./data/${filelist[i]}`);
            for(let j = 0; j < small_filelist.length; ++j) {
                children_li += `<div class="small_index" onclick="location.href='/?folder=${filelist[i]}&id=${small_filelist[j]}'"></div>`

                small_list.push(small_filelist[j]);
                if (j === 0) {
                    list += `
                    <div onmouseover="
                    var elements = getElementsByClassName('${filelist[i]}');
                    for(let i = 0; i < elements.length; ++i) {
                        elements[i].style.color = 'red';
                    }
                    " onmouseout="
                    var elements = getElementsByClassName('${filelist[i]}');
                    for(let i = 0; i < elements.length; ++i) {
                        elements[i].style.color = '#F3E0E0';
                    }
                    "><li class="${filelist[i]}" id="${filelist[i]}" onclick="
                    var child = document.getElementById('${filelist[i]}').children;
                    if (child[0].textContent == '') {
                        child[${j}].innerHTML= '${small_list[j]}';`
                } else {
                    list += `child[${j}].innerHTML= '${small_list[j]}';`
                }
            }
            list += `
            } else {
                for (var j=0; j<child.length; ++j) {
                    child[j].innerHTML= '';
                }
            }
            ">
            ${filelist[i]}
            ${children_li}
            </li>
            </div>`
            small_list = [];
            children_li = "";
        }
        list += '</ol>'
        return list;
    },
    categories: (filelist)=>{
        var categories = "<select id='categories'name='categories'><option value='new'>NEW</option>";
        for(let i = 0; i < filelist.length; ++i) {
            categories += `<option value="${filelist[i]}">${filelist[i]}</option>`
        }
        categories += '</select>';
        return categories;
    }
}