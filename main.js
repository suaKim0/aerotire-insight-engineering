const express = require('express');
const app = express();
const port = 3000;
const template = require('./template');
const sanitizeHtml = require('sanitize-html');
const mysql = require('mysql2');
const fs = require('fs'); // 파일 읽기 모듈

// DB 연결 설정 (multipleStatements와 Aiven 접속 정보 통합)
const db = mysql.createConnection({
    host     : process.env.DB_HOST || 'mysql-aerotire-sua-kim-project.i.aivencloud.com',
    user     : process.env.DB_USER || 'avnadmin',
    password : process.env.DB_PASSWORD || 'AVNS_dHkcqudH01Jt_IPKcJo',
    database : process.env.DB_NAME || 'defaultdb',
    port     : process.env.DB_PORT || 22274,
    multipleStatements: true // 여러 쿼리 한 번에 실행 허용
});

// DB 연결 및 schema.sql 자동 실행 (테이블 자동 생성)
db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database!');

    const schemaSql = fs.readFileSync('./schema.sql', 'utf8');
    db.query(schemaSql, (err, results) => {
        if (err) {
            console.error('Error creating tables:', err);
        } else {
            console.log('Tables initialized successfully!');
        }
    });
});

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
        if (err) throw err;

       db.query('SELECT env_id, track_name FROM Track_Environments', (err, tracks) => {
            if (err) throw err;
            menu(null, (menuHtml) => {
                res.send(template.html(menuHtml, template.create(cars, tracks)));
            });
       });
    });    
});

// 생성형 AI 활용
app.post('/create', (req, res) => {
    const { car_id, env_id, wing_angle, velocity, tire_compound } = req.body;
    
    const rad = (wing_angle * Math.PI) / 180;
    const calculated_downforce = Number((0.5 * 1.225 * Math.pow(velocity, 2) * 0.45 * Math.sin(rad)).toFixed(2));
    const compoundFactors = { 'Soft': 0.08, 'Medium': 0.05, 'Hard': 0.03 };
    const calculated_wear_rate = Number((velocity * (compoundFactors[tire_compound] || 0.05)).toFixed(2));

    db.query(
        `INSERT INTO Mechanical_Run_Logs (car_id, env_id, wing_angle, velocity, tire_compound, calculated_downforce, calculated_wear_rate) 
         VALUES (${car_id}, ${env_id}, ${wing_angle}, ${velocity}, '${tire_compound}', ${calculated_downforce}, ${calculated_wear_rate})`,
        (err, results) => {
            if (err) throw err;
            res.redirect(`/${results.insertId}`);
        }
    );
});

app.get('/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) { return res.status(404).send('404 Not Found'); } 
    const sql = `
        SELECT l.*, c.model_name, e.track_name 
        FROM Mechanical_Run_Logs l
        JOIN Vehicle_Aero_Specs c ON l.car_id = c.car_id
        JOIN Track_Environments e ON l.env_id = e.env_id
        WHERE l.log_id = ?
    `;

    db.query(sql, [id], (err, results) => {
        if (err) throw err;
        if (results.length === 0) { return res.status(404).send('404 Not Found'); }

        menu(id, (menuHtml) => {
            res.send(template.html(menuHtml, template.read(results[0])));
        });
    });
});

app.get('/stats', (req, res) => {
    const sql = `
        SELECT c.model_name, COUNT(l.log_id) AS total_runs, AVG(l.velocity) AS avg_velocity, AVG(l.calculated_downforce) AS avg_downforce
        FROM Vehicle_Aero_Specs c
        LEFT JOIN Mechanical_Run_Logs l ON c.car_id = l.car_id
        GROUP BY c.car_id, c.model_name
    `;
    db.query(sql, (err, statsData) => {
        if (err) throw err;
        menu(null, (menuHtml) => {
            res.send(template.html(menuHtml, template.stats(statsData)));
        });
    });
});

app.get('/update/:id', (req, res) => {
    const id = Number(req.params.id);
    db.query('SELECT * FROM Mechanical_Run_Logs WHERE log_id = ?', [id], function (err, results) {
        if (err) throw err;
        if (results.length === 0) { return res.status(404).send('404 Not Found'); }
        const log = results[0];
        db.query('SELECT car_id, model_name FROM Vehicle_Aero_Specs', function(err, cars){
            if (err) throw err;
            db.query('SELECT env_id, track_name FROM Track_Environments', function(err, tracks){
                if (err) throw err;
                menu(null, function(menuHtml){
                    res.send(template.html(menuHtml, template.update(log, cars, tracks)))                
                });    
            });
        });        
    });
});

app.post('/update', (req, res) => {
    const { id, car_id, env_id, wing_angle, velocity, tire_compound } = req.body;
    const rad = (wing_angle * Math.PI) / 180;
    const calculated_downforce = Number((0.5 * 1.225 * Math.pow(velocity, 2) * 0.45 * Math.sin(rad)).toFixed(2));
    const compoundFactors = { 'Soft': 0.08, 'Medium': 0.05, 'Hard': 0.03 };
    const calculated_wear_rate = Number((velocity * (compoundFactors[tire_compound] || 0.05)).toFixed(2));

    const sql = `
        UPDATE Mechanical_Run_Logs 
        SET car_id=?, env_id=?, wing_angle=?, velocity=?, tire_compound=?, calculated_downforce=?, calculated_wear_rate=? 
        WHERE log_id=?
    `;
    
    db.query(sql, [car_id, env_id, wing_angle, velocity, tire_compound, calculated_downforce, calculated_wear_rate, id], function (err, results) {
        if (err) throw err;
        res.redirect(`/${id}`);
    });
});

app.get('/delete/:id', (req, res) => {
    const id = Number(req.params.id);
    db.query('SELECT * FROM Mechanical_Run_Logs WHERE log_id = ?',[id], function (err, results) {
        if (err) throw err;
        if (results.length === 0) { return res.status(404).send('404 Not Found'); }
        const log = results[0];        
        menu(id, function(menuHtml){
            res.send(template.html(menuHtml, template.read(log)))
        });
    });
});

app.post('/delete', (req, res) => {
    const id = Number(req.body.id);
    db.query(
        'DELETE FROM Mechanical_Run_Logs WHERE log_id = ?',
        [id],
        (err, results) => {
            if (err) throw err;
            res.redirect('/');
        }
    );
});

app.listen(port, () => {
    console.log(`server running on PORT ${port}`);
});