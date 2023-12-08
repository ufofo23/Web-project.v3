var db_sync = require('./db_sync')

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
    list: (topics)=>{
        var list = '<ol>';
        var children_li = "";
        for(let i = 0; i < topics.length; ++i) {
            var indexes = db_sync.query("SELECT * FROM `index` WHERE category_id=? ORDER BY title", [topics[i].id])
            if (indexes[0] !== undefined) {
                for(let j = 0; j < indexes.length; ++j) {
                    children_li += `<div class="small_index" onclick="location.href='/?folder=${topics[i].id}&id=${indexes[j].id}'"></div>`
                    if (j === 0) {
                        list += `
                        <div onmouseover="
                        var elements = getElementsByClassName('${topics[i].name}');
                        for(let i = 0; i < elements.length; ++i) {
                            elements[i].style.color = 'red';
                        }
                        " onmouseout="
                        var elements = getElementsByClassName('${topics[i].name}');
                        for(let i = 0; i < elements.length; ++i) {
                            elements[i].style.color = '#F3E0E0';
                        }
                        "><li class="${topics[i].name}" id="${topics[i].id}" onclick="
                        var child = document.getElementById('${topics[i].id}').children;
                        if (child[0].textContent == '') {
                            child[${j}].innerHTML= '${indexes[j].title}';`
                    } else {
                        list += `child[${j}].innerHTML= '${indexes[j].title}';`
                    }
                }
                list += `
                } else {
                    for (var j=0; j<child.length; ++j) {
                        child[j].innerHTML= '';
                    }
                }
                ">
                ${topics[i].name}
                ${children_li}
                </li>
                </div>`
                children_li = "";
            } else {
                list += `<li>${topics[i].name}</li>`;
            }
        }
        list += '</ol>'
        return list;
    },
    categories: (topics)=>{
        var categories = "<select id='categories'name='categories'><option value='new'>NEW</option>";
        for(let i = 0; i < topics.length; ++i) {
            categories += `<option value="${topics[i].name}">${topics[i].name}</option>`
        }
        categories += '</select>';
        return categories;
    },
    categorySelect: (topics, category_id)=>{
        var tag = '';
        for(let i = 0; i < topics.length; ++i) {
          var selected = '';
          if (topics[i].id === category_id) {
            selected = 'selected';
          }
          tag += `<option value="${topics[i].id}"${selected}>${topics[i].name}</option>`;
        }
        tag += `<option value="-1">NEW</option>`;
        return `
        <select id="select_category" name="category">
          ${tag}
        </select>`;
    },
    topicTable:(topics)=>{
        var tag = '<table id="category_table">';
        for (let i = 0; i < topics.length; ++i) {
            tag += `
            <tr>
                <td>${topics[i].name}</td>
                <td><input type="button" 
                onclick="location.href='/category_update?id=${topics[i].id}'" 
                value="update"></td>
                <td>
                  <form action="/category_delete_process" method="post">
                    <input type="hidden" name="id" value="${topics[i].id}">
                    <input type="submit" value="delete">
                  </form>
                </td>
            </tr>
            `;
        }
        tag += '</table>';
        return tag;
    }
}
