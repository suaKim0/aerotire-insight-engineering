
module.exports = {
    html(menu, body) {
        return `
            <!DOCTYPE html>
            <html lang="ko">
            <head>
                <meta charset="UTF-8">
                <title>선린인터넷고등학교 교사 정보</title>
                <style>
                    * {
                        box-sizing: border-box;
                    }
                    body {
                        margin: 0;
                        font-family: Arial, sans-serif;
                        background: #f4f6f8;
                        color: #222;
                    }
                    .wrap {
                        width: 900px;
                        margin: 40px auto;
                    }
                    .header {
                        background: white;
                        padding: 20px 28px;
                        border-radius: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                        margin-bottom: 20px;
                    }
                    .header h1 {
                        margin: 0;
                        font-size: 26px;
                    }
                    .header a {
                        color: #222;
                        text-decoration: none;
                    }
                    .content {
                        display: grid;
                        grid-template-columns: 220px 1fr;
                        gap: 20px;
                    }
                    .menu {
                        background: white;
                        padding: 20px;
                        border-radius: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                    }
                    .body {
                        background: white;
                        padding: 28px;
                        border-radius: 12px;
                        box-shadow: 0 2px 10px rgba(0,0,0,0.08);
                    }
                    a {
                        color: #2563eb;
                        text-decoration: none;
                    }
                    a:hover {
                        text-decoration: underline;
                    }
                </style>
            </head>
            <body>
                <div class="wrap">
                    <div class="header">
                        <h1><a href="/">선린인터넷고등학교</a></h1>
                    </div>
                    <div class="content">
                        <div class="menu">
                            ${menu}
                        </div>
                        <div class="body">
                            ${body}
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    },
    menu(teachers, id) {
        let result = '<ol>';
        for (let i = 0; i < teachers.length; i++) {
            result += `<li><a href="/${teachers[i].id}">${teachers[i].name}</a></li>`;
        }
        result += '</ol>';
        result += '<hr>';
        result += '<a href="/create">Create</a>';
        if (id) {
            result += `<br><a href="/update/${id}">Update</a>`;
            result += `<br><a href="/delete/${id}">Delete</a>`;
        }
        result += '<hr>';
        result += '<a href="/office">Office</a>';
        return result;
    },
    create(offices) {
        let officeList = '<option value="">교무실 없음</option>'
        for (let i = 0; i < offices.length; i++){
            officeList += `
                <option value="${offices[i].id}">
                    ${offices[i].building} ${offices[i].room}
                </option>
            `;
        }
        return `
            <h2>Create</h2>
            <form action="/create" method="post">
                <p><input type="text" name="name" placeholder="이름"></p>
                <p><input type="text" name="subject" placeholder="과목"></p>
                <p><input type="text" name="class" placeholder="담임반"></p>
                <p><select name="office_no">${officeList}</select></p>
                <p><button type="submit">send</button></p>
            </form>
        `;
    },
    update(teacher, offices) {
        let officeList = '<option value="">교무실 없음</option>'
        for (let i = 0; i < offices.length; i++){
            officeList += `
                <option value="${offices[i].id}"
                    ${teacher.office_no == offices[i].id ? 'selected' : ''}>
                    ${offices[i].building} ${offices[i].room}
                </option>
            `;
        }
        return `
            <h2>Update</h2>            
            <form action="/update" method="post">
                <input type="hidden" name="id" value="${teacher.id}">
                <p><input type="text" name="name" value="${teacher.name}"></p>
                <p><input type="text" name="subject" value="${teacher.subject}"></p>
                <p><input type="text" name="class" value="${teacher.class ?? ''}"></p>
                <p><select name="office_no">${officeList}</select></p>
                <p><button type="submit">수정</button></p>
            </form>
        `;
    },
    delete(teacher){ //삭제 화면 생성
        return  `
            <h2>Delete</h2>
            <p>${teacher.name} 교사를 삭제하시겠습니까?</p>
            <form action="/delete" method="post">
                <input type="hidden" name="id" value="${teacher.id}">
                <button type="submit">삭제</button>
            </form>
        `;
    },
    read(teacher){
        return `
            <h2>${teacher.name}</h2>
            <p>과목 : ${teacher.subject}</p>
            <p>등록일 : ${teacher.created}</p>
            <p>담임반 : ${teacher.class ?? ''}</p>
            <p>교무실 : ${teacher.building ?? ''} ${teacher.room ?? ''}</p>
        `;
    }
};