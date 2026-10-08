const express = require('express');
const app = express();
const port = 3000;
const template = require('./template');
const sanitizeHtml = require('sanitize-html');
const mysql      = require('mysql2');
const db = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'rlatndk823**',
  database : 'aetire_db',
  port : 3401
});
db.connect();

app.use(express.urlencoded({ extended: true }));

function menu(selectedId, callback) {
    db.query('SELECT car_id, model_name from Vehicle_Aero_Specs', function (err, results) {
        if (err) throw err;
        callback(template.menu(results, selectedId));
    });
}

app.get('/', (req, res) => {
    menu(null, function(menuHtml){
        res.send(template.html(menuHtml, `
            <h2>AeroTire Insight</h2>
            <p>It's the main page of AeroTire Insight!</p>
        `));    
    })    
});

app.get('/create', (req, res) => {
    db.query('SELECT car_id, model_name FROM Vehicle_Aero_Specs', (err, cars) => {
        if (err) throw err; //차량 조회

       db.query('SELECT env_id, track_name FROM Track_Environments', (err, tracks) => {
            if (err) throw err;
            menu(null, (menuHtml) => {
                res.send(template.html(menuHtml, template.create(cars, tracks))); //트랙 조회해서 template으로
            });
       });
    });    
}); //AI&

app.post('/create', (req, res) => {
    const {car_id, env_id, wing_angle, velocity, tire_compound} = req.body;
    const rad = (wing_angle * Math.PI) / 180;
    const calculated_downforce = Number((0.5 * 1.225 * Math.pow(velocity, 2) * 0.45 * Math.sin(rad)).toFixed(2)); //AI, Downforce 연산
    const compoundFactors = {'Soft':0.08, 'Medium':0.05, 'Hard':0.03};
    const factor = compoundFactors[tire_compound] || 0.05;
    const calculated_wear_rate = Number((velocity * factor).toFixed(2)); //AI, WearRate 연산
    db.query(
        `insert into Mechnical_Run_Logs (car_id, env_id, wing_angle, velocity, tire_compound, calculated_downforce, calculated_wear_rate) values (${car_id}, ${env_id}, ${wing_angle}, ${velocity}, '${tire_compound}', ${downforce}, ${wear_rate})`,
        (err, results) => {
            if (err) throw err;
            res.redirect(`/${insertId}`); //Mechinal_Run_Logs에서 인저트 후 이동
        });
    });

app.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) { return res.status(404).send('404 Not Found'); } 
    db.query(`SELECT t.*, o.building, o.room from teacher t 
        left join office o on t.office_no=o.id WHERE t.id = ?`, [id], function (err, results) {
        if (err) throw err;
        if (results.length === 0) { return res.status(404).send('404 Not Found'); }
        const teacher = results[0];
        menu(id, function(menuHtml){
            res.send(
                template.html(menuHtml, template.read(teacher))
            );
        })        
    });    
});

app.get('/update/:id', (req, res) => {
    const id = Number(req.params.id);
    db.query('select * from teacher where id=?',[id], function (err, results) {
        if (err) throw err;
        if (results.length === 0) { return res.status(404).send('404 Not Found'); }
        const teacher = results[0];
        db.query('SELECT * FROM office', function(err, offices){
            if (err) throw err;
            menu(null, function(menuHtml){
                res.send(template.html(menuHtml,template.update(teacher, offices)))                
            });    
        });        
    });
});

app.post('/update', (req, res) => {
    const id = Number(req.body.id);
    const name = sanitizeHtml(req.body.name);
    const subject = sanitizeHtml(req.body.subject);
    const className = req.body.class === '' ? null : sanitizeHtml(req.body.class);
    const officeNo = req.body.office_no === '' ? null : Number(req.body.office_no);
    db.query(
        'update teacher set name=?, subject=?, class=?, office_no=? where id =?',
        [name, subject, className, officeNo, id], function (err, results) {
        if (err) throw err;
        res.redirect(`/${id}`);
    });
});

app.get('/delete/:id', (req, res) => {
    const id = Number(req.params.id);
    db.query('select * from teacher where id=?',[id], function (err, results) {
        if (err) throw err;
        if (results.length === 0) { return res.status(404).send('404 Not Found'); }
        const teacher = results[0];        
        menu(id, function(menuHtml){
            res.send(template.html(menuHtml, template.delete(teacher)))
        });
    });
});

app.post('/delete', (req, res) => {
    const id = Number(req.body.id);
    db.query(
        'delete from teacher where id =?',
        [id], function (err, results) {
        if (err) throw err;
        res.redirect(`/`);
    });
});


app.get('/office', (req,res) => {    
    db.query(`SELECT o.id, o.building, o.room, count(t.id) AS teacher_count
        from office o left join teacher t on o.id=t.office_no
        group by o.id, o.building, o.room`, function(err, offices){
        if (err) throw err;        
        menu(null, function(menuHtml){
            let list = `<h2>교무실 목록</h2><ul>`;
            for (let i=0; i<offices.length; i++){
                list += `<li><a href='/office/${offices[i].id}'>
                    ${offices[i].building} ${offices[i].room} (${offices[i].teacher_count}명)
                </a>                
                </li>                
                `;
            }
            list += '</ul>';
            res.send(template.html(menuHtml, list));
        });
    });
});

app.get('/office/:id', (req,res) => {
    const id = Number(req.params.id);    
    db.query(`
        select t.id, t.name, t.subject, o.building, o.room from teacher t
        right join office o on t.office_no = o.id where o.id = ?
        `, [id], function(err, results){
        if (err) throw err;
        
        if (results.length === 0){
            return res.status(404).send('404 Not Found');
        }
        menu(null, function(menuHtml){
            let list = `<h2>${results[0].building} ${results[0].room}</h2>
            <ul>`;
            if (results[0].name === null){
                list += '<li>소속 교사 없음</li>';
            }else{
            for (let i=0; i<results.length; i++){
                list += `<li><a href='/${results[i].id}'>${results[i].name}</a> - ${results[i].subject}</li>
                `;
            }}
            list += '</ul>';
            res.send(template.html(menuHtml, list));
        });
    });
});

app.listen(port, () => {
    console.log(`server running on PORT ${port}`);
});