const express = require('express');
const app = express();
const port = 3000;
const template = require('./template');
const sanitizeHtml = require('sanitize-html');
const mysql      = require('mysql2');
const db = mysql.createConnection({
    host     : 'mysql-aerotire-sua-kim-project.i.aivencloud.com',
    user     : 'avnadmin',
    password : 'AVNS_dHkcqudH01Jt_IPKcJo',
    database : 'defaultdb',
    port : 22274
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
// 활용 내용 공기역학 다운포스 및 타이어 마모율 자동 연산 로직 작성
// 프롬프트 속도와 날개 각도를 입력받아 다운포스와 타이어 마모율을 계산하는 JS 식 작성해줘
// 수정 및 검증 AI가 제안한 식에서 rad 단위 변환 및 toFixed 소수점 처리 적용 후 콘솔 출력으로 검증함
app.post('/create', (req, res) => {
    const { car_id, env_id, wing_angle, velocity, tire_compound } = req.body;
    
    // 추가 학습 및 변경 수업 시간 기본 CRUD 외에 공학 연산 공식을 추가하여 자동 계산 로직 적용
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

// 추가 학습 및 변경 3개 이상 테이블 JOIN을 위해 3개 테이블을 연결하여 상세 정보 조회
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

// 생성형 AI 활용
// 활용 내용 차량별 평균 다운포스 및 총 주행 횟수 집계 GROUP BY 쿼리 작성
// 프롬프트 MySQL에서 3개 테이블 중 차량별 평균 속도와 주행 횟수를 구하는 GROUP BY SQL 작성해줘
// 수정 및 검증 LEFT JOIN을 사용하여 데이터가 없는 차량도 0회로 나오도록 수정 후 쿼리 실행 검증 완료함
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

// 생성형 AI 활용
// 활용 내용 주행 로그 수정 쿼리 및 공학 연산 반영 로직 작성
// 프롬프트 기존 teacher 수정 코드를 Mechanical_Run_Logs 업데이트 코드로 변경하는 방법
// 수정 및 검증 req.body로 전달받은 값들을 UPDATE 쿼리에 매핑하여 정상 수정 확인
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

// 생성형 AI 활용
// 활용 내용 Mechanical_Run_Logs 테이블의 log_id 기준 삭제 쿼리 및 파라미터 바인딩 작성
// 프롬프트 express와 mysql2 환경에서 post 요청으로 받은 id를 이용해 안전하게 delete 쿼리 날리는 법
// 수정 및 검증 물음표 파라미터 바인딩 방식을 적용하여 SQL 인젝션을 방지하도록 수정 후 삭제 테스트 완료
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


// 테이블 자동 실행 코

const mysql = require('mysql2');
const fs = require('fs'); // ⭐ 파일 읽기 모듈 추가

// 1단계: multipleStatements 옵션을 켠 상태로 DB 연결 설정
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
  multipleStatements: true // 여러 쿼리를 한 번에 실행할 수 있게 허용
});

// 2단계: 서버가 DB에 붙을 때 schema.sql을 읽어서 테이블 자동 생성
db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database!');

  // schema.sql 파일을 읽어와서 자동으로 실행
  const schemaSql = fs.readFileSync('./schema.sql', 'utf8');
  db.query(schemaSql, (err, results) => {
    if (err) {
      console.error('Error creating tables:', err);
    } else {
      console.log('Tables initialized successfully!');
    }
  });
});