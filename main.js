const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const template = require('./template');
const mysql = require('mysql2');
const sanitizeHtml = require('sanitize-html');

app.use(express.urlencoded({ extended: true }));

// ========================================
// 1. Aiven MySQL 연결
// ========================================

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'mysql-aerotire-sua-kim-project.i.aivencloud.com',
    user: process.env.DB_USER || 'avnadmin',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'defaultdb',
    port: Number(process.env.DB_PORT),
    ssl: process.env.DB_SSL_CA
        ? { ca: process.env.DB_SSL_CA }
        : undefined
});

const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

db.connect((err) => {
    if (err) {
        console.error('DB 연결 실패:', err.message);
        return;
    }
    console.log('Aiven MySQL 연결 성공!');
});

// ========================================
// 2. 공통 함수
// ========================================

function clean(value) {
    return sanitizeHtml(String(value ?? '').trim());
}

function validPositiveNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) && number > 0;
}

async function getMenu(activeId = null) {
    const cars = await query(
        'SELECT car_id, model_name FROM Vehicle_Aero_Specs ORDER BY car_id'
    );
    return template.menu(cars, activeId);
}

async function sendPage(res, body, activeId = null) {
    const menuHtml = await getMenu(activeId);
    res.send(template.html(menuHtml, body));
}

function errorPage(res, err) {
    console.error(err);
    res.status(500).send(
        '<h2>서버 오류</h2><p>서버 로그를 확인해 주세요.</p><a href="/">메인으로</a>'
    );
}

// ========================================
// 3. 메인 페이지
// ========================================

app.get('/', async (req, res) => {
    try {
        const logs = await query(`
            SELECT
                l.log_id,
                c.model_name,
                e.track_name,
                l.wing_angle,
                l.velocity,
                l.tire_compound,
                l.calculated_downforce,
                l.calculated_wear_rate
            FROM Mechanical_Run_Logs l
            JOIN Vehicle_Aero_Specs c ON l.car_id = c.car_id
            JOIN Track_Environments e ON l.env_id = e.env_id
            ORDER BY l.log_id DESC
            LIMIT 10
        `);

        let body = `
            <h2>AeroTire Insight Engineering</h2>
            <p>차량 공력 및 타이어 마모 분석 시스템</p>

            <h3>데이터 등록</h3>
            <p><a href="/cars/create">차량 공력 사양 등록</a></p>
            <p><a href="/tracks/create">트랙 환경 등록</a></p>
            <p><a href="/create">주행 세팅 및 분석 등록</a></p>

            <h3>분석</h3>
            <p><a href="/stats">타이어별 마모율 통계</a></p>
            <p><a href="/logs">전체 주행 로그</a></p>

            <h3>최근 주행 분석</h3>
            <table border="1" cellpadding="6">
                <tr>
                    <th>ID</th><th>차량</th><th>트랙</th>
                    <th>영각</th><th>속도</th><th>타이어</th>
                    <th>다운포스(N)</th><th>마모율(%/lap)</th>
                </tr>
        `;

        for (const log of logs) {
            body += `
                <tr>
                    <td><a href="/logs/${log.log_id}">${log.log_id}</a></td>
                    <td>${clean(log.model_name)}</td>
                    <td>${clean(log.track_name)}</td>
                    <td>${log.wing_angle}</td>
                    <td>${log.velocity}</td>
                    <td>${clean(log.tire_compound)}</td>
                    <td>${Number(log.calculated_downforce).toFixed(2)}</td>
                    <td>${Number(log.calculated_wear_rate).toFixed(2)}</td>
                </tr>
            `;
        }

        body += '</table>';

        await sendPage(res, body);
    } catch (err) {
        errorPage(res, err);
    }
});

// ========================================
// 4. 차량 공력 사양 등록 CREATE
// ========================================

app.get('/cars/create', async (req, res) => {
    const body = `
        <h2>차량 공력 사양 등록</h2>
        <form method="post" action="/cars/create">
            <p>차량명: <input name="model_name" required maxlength="50"></p>
            <p>스포일러 면적(m²):
                <input name="wing_area" type="number" min="0.01"
                    step="any" required>
            </p>
            <p>차량 중량(N):
                <input name="curb_weight" type="number" min="0.01"
                    step="any" required>
            </p>
            <button type="submit">차량 등록</button>
        </form>
        <p><a href="/">메인으로</a></p>
    `;

    try {
        await sendPage(res, body);
    } catch (err) {
        errorPage(res, err);
    }
});

app.post('/cars/create', async (req, res) => {
    try {
        const modelName = clean(req.body.model_name);
        const wingArea = Number(req.body.wing_area);
        const curbWeight = Number(req.body.curb_weight);

        if (
            !modelName ||
            !validPositiveNumber(wingArea) ||
            !validPositiveNumber(curbWeight)
        ) {
            return res.status(400).send('입력값을 확인해 주세요.');
        }

        const result = await query(
            `INSERT INTO Vehicle_Aero_Specs
             (model_name, wing_area, curb_weight)
             VALUES (?, ?, ?)`,
            [modelName, wingArea, curbWeight]
        );

        res.redirect(`/cars/${result.insertId}`);
    } catch (err) {
        errorPage(res, err);
    }
});

// 차량 등록 결과 페이지
app.get('/cars/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).send('잘못된 차량 ID입니다.');
        }

        const cars = await query(
            'SELECT * FROM Vehicle_Aero_Specs WHERE car_id = ?',
            [id]
        );

        if (!cars.length) {
            return res.status(404).send('차량을 찾을 수 없습니다.');
        }

        const car = cars[0];

        await sendPage(res, `
            <h2>차량 등록 완료</h2>
            <p>차량 ID: ${car.car_id}</p>
            <p>차량명: ${clean(car.model_name)}</p>
            <p>스포일러 면적: ${car.wing_area} m²</p>
            <p>차량 중량: ${car.curb_weight} N</p>
            <p><a href="/cars/create">차량 추가 등록</a></p>
            <p><a href="/create">주행 분석 등록</a></p>
        `);
    } catch (err) {
        errorPage(res, err);
    }
});

// ========================================
// 5. 트랙 환경 등록 CREATE
// ========================================

app.get('/tracks/create', async (req, res) => {
    const body = `
        <h2>트랙 환경 등록</h2>
        <form method="post" action="/tracks/create">
            <p>트랙명:
                <input name="track_name" maxlength="50" required>
            </p>
            <p>공기 밀도(kg/m³):
                <input name="air_density" type="number" min="0.01"
                    step="any" value="1.225" required>
            </p>
            <p>노면 마찰 계수:
                <input name="friction_coeff" type="number" min="0.01"
                    max="2" step="any" value="0.85" required>
            </p>
            <button type="submit">트랙 등록</button>
        </form>
        <p><a href="/">메인으로</a></p>
    `;

    try {
        await sendPage(res, body);
    } catch (err) {
        errorPage(res, err);
    }
});

app.post('/tracks/create', async (req, res) => {
    try {
        const trackName = clean(req.body.track_name);
        const airDensity = Number(req.body.air_density);
        const frictionCoeff = Number(req.body.friction_coeff);

        if (
            !trackName ||
            !validPositiveNumber(airDensity) ||
            !validPositiveNumber(frictionCoeff) ||
            frictionCoeff > 2
        ) {
            return res.status(400).send('입력값을 확인해 주세요.');
        }

        await query(
            `INSERT INTO Track_Environments
             (track_name, air_density, friction_coeff)
             VALUES (?, ?, ?)`,
            [trackName, airDensity, frictionCoeff]
        );

        res.redirect('/create');
    } catch (err) {
        errorPage(res, err);
    }
});

// ========================================
// 6. 주행 세팅 입력 및 역학 계산 CREATE
// ========================================

app.get('/create', async (req, res) => {
    try {
        const cars = await query(
            'SELECT * FROM Vehicle_Aero_Specs ORDER BY car_id'
        );
        const tracks = await query(
            'SELECT * FROM Track_Environments ORDER BY env_id'
        );

        if (!cars.length || !tracks.length) {
            return sendPage(res, `
                <h2>주행 분석 등록</h2>
                <p>먼저 차량과 트랙 환경을 등록해 주세요.</p>
                <p><a href="/cars/create">차량 등록</a></p>
                <p><a href="/tracks/create">트랙 등록</a></p>
            `);
        }

        const body = `
            <h2>주행 세팅 및 역학 분석 등록</h2>
            <form method="post" action="/create">
                <p>차량:
                    <select name="car_id" required>
                        ${cars.map(c => `
                            <option value="${c.car_id}">
                                ${clean(c.model_name)} (ID ${c.car_id})
                            </option>
                        `).join('')}
                    </select>
                </p>

                <p>트랙:
                    <select name="env_id" required>
                        ${tracks.map(t => `
                            <option value="${t.env_id}">
                                ${clean(t.track_name)} (ID ${t.env_id})
                            </option>
                        `).join('')}
                    </select>
                </p>

                <p>스포일러 영각(도):
                    <input name="wing_angle" type="number"
                        min="0" max="90" step="any" value="12.5" required>
                </p>

                <p>주행 속도(m/s):
                    <input name="velocity" type="number"
                        min="0.1" step="any" value="45" required>
                </p>

                <p>타이어 컴파운드:
                    <select name="tire_compound" required>
                        <option value="Soft">Soft</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </p>

                <button type="submit">계산 및 저장</button>
            </form>
        `;

        await sendPage(res, body);
    } catch (err) {
        errorPage(res, err);
    }
});

app.post('/create', async (req, res) => {
    try {
        const carId = Number(req.body.car_id);
        const envId = Number(req.body.env_id);
        const wingAngle = Number(req.body.wing_angle);
        const velocity = Number(req.body.velocity);
        const tireCompound = clean(req.body.tire_compound);

        if (
            !Number.isInteger(carId) || carId < 1 ||
            !Number.isInteger(envId) || envId < 1 ||
            !Number.isFinite(wingAngle) || wingAngle < 0 || wingAngle > 90 ||
            !validPositiveNumber(velocity) ||
            !['Soft', 'Medium', 'Hard'].includes(tireCompound)
        ) {
            return res.status(400).send('주행 입력값을 확인해 주세요.');
        }

        const cars = await query(
            'SELECT * FROM Vehicle_Aero_Specs WHERE car_id = ?',
            [carId]
        );
        const tracks = await query(
            'SELECT * FROM Track_Environments WHERE env_id = ?',
            [envId]
        );

        if (!cars.length || !tracks.length) {
            return res.status(400).send('차량 또는 트랙 정보가 없습니다.');
        }

        const car = cars[0];
        const track = tracks[0];

        /*
         * 시연용 단순화 모델입니다.
         * 다운포스 = 0.5 × 공기밀도 × 속도² × 스포일러 면적 × 양력계수
         * 실제 차량의 공력계수와 타이어 모델을 측정한 값은 아닙니다.
         */
        const angleRadians = wingAngle * Math.PI / 180;
        const liftCoefficient = 1.2 * Math.sin(angleRadians);

        const downforce =
            0.5 * Number(track.air_density) *
            velocity * velocity *
            Number(car.wing_area) *
            liftCoefficient;

        /*
         * 타이어별 기준값을 이용한 시연용 마모율 추정식입니다.
         * 실제 실험값이나 검증된 타이어 수명 예측식은 아닙니다.
         */
        const compoundFactor = {
            Soft: 1.5,
            Medium: 1.0,
            Hard: 0.7
        };

        const friction = Math.max(Number(track.friction_coeff), 0.01);

        const wearRate =
            compoundFactor[tireCompound] *
            Math.pow(velocity / 45, 2) *
            (1 + wingAngle / 90) /
            friction;

        const result = await query(
            `INSERT INTO Mechanical_Run_Logs
             (car_id, env_id, wing_angle, velocity, tire_compound,
              calculated_downforce, calculated_wear_rate)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                carId, envId, wingAngle, velocity, tireCompound,
                downforce, wearRate
            ]
        );

        res.redirect(`/logs/${result.insertId}`);
    } catch (err) {
        errorPage(res, err);
    }
});

// ========================================
// 7. 전체 주행 로그 목록 및 검색
// ========================================

app.get('/logs', async (req, res) => {
    try {
        const keyword = clean(req.query.keyword || '');

        const logs = await query(`
            SELECT
                l.log_id, c.model_name, e.track_name,
                l.wing_angle, l.velocity, l.tire_compound,
                l.calculated_downforce, l.calculated_wear_rate
            FROM Mechanical_Run_Logs l
            JOIN Vehicle_Aero_Specs c ON l.car_id = c.car_id
            JOIN Track_Environments e ON l.env_id = e.env_id
            WHERE c.model_name LIKE ? OR e.track_name LIKE ?
            ORDER BY l.calculated_wear_rate DESC
        `, [`%${keyword}%`, `%${keyword}%`]);

        let body = `
            <h2>전체 주행 로그</h2>
            <form method="get" action="/logs">
                <input name="keyword" placeholder="차량명 또는 트랙명 검색"
                    value="${clean(keyword)}">
                <button type="submit">검색</button>
            </form>

            <table border="1" cellpadding="6">
                <tr>
                    <th>ID</th><th>차량</th><th>트랙</th>
                    <th>영각</th><th>속도</th><th>타이어</th>
                    <th>다운포스</th><th>마모율</th>
                </tr>
        `;

        for (const log of logs) {
            body += `
                <tr>
                    <td><a href="/logs/${log.log_id}">${log.log_id}</a></td>
                    <td>${clean(log.model_name)}</td>
                    <td>${clean(log.track_name)}</td>
                    <td>${log.wing_angle}</td>
                    <td>${log.velocity}</td>
                    <td>${clean(log.tire_compound)}</td>
                    <td>${Number(log.calculated_downforce).toFixed(2)}</td>
                    <td>${Number(log.calculated_wear_rate).toFixed(2)}</td>
                </tr>
            `;
        }

        body += '</table>';
        await sendPage(res, body);
    } catch (err) {
        errorPage(res, err);
    }
});

// ========================================
// 8. 주행 로그 상세 조회: 3개 테이블 JOIN
// ========================================

app.get('/logs/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).send('잘못된 로그 ID입니다.');
        }

        const results = await query(`
            SELECT
                l.*,
                c.model_name,
                c.wing_area,
                c.curb_weight,
                e.track_name,
                e.air_density,
                e.friction_coeff
            FROM Mechanical_Run_Logs l
            JOIN Vehicle_Aero_Specs c ON l.car_id = c.car_id
            JOIN Track_Environments e ON l.env_id = e.env_id
            WHERE l.log_id = ?
        `, [id]);

        if (!results.length) {
            return res.status(404).send('주행 로그를 찾을 수 없습니다.');
        }

        const log = results[0];

        const body = `
            <h2>주행 분석 상세 결과</h2>
            <p>로그 ID: ${log.log_id}</p>
            <p>차량: ${clean(log.model_name)}</p>
            <p>차량 중량: ${log.curb_weight} N</p>
            <p>스포일러 면적: ${log.wing_area} m²</p>
            <p>트랙: ${clean(log.track_name)}</p>
            <p>공기 밀도: ${log.air_density} kg/m³</p>
            <p>노면 마찰 계수: ${log.friction_coeff}</p>
            <p>영각: ${log.wing_angle}°</p>
            <p>속도: ${log.velocity} m/s</p>
            <p>타이어: ${clean(log.tire_compound)}</p>
            <h3>계산 결과</h3>
            <p>다운포스: ${Number(log.calculated_downforce).toFixed(2)} N</p>
            <p>예상 마모율: ${Number(log.calculated_wear_rate).toFixed(2)} %/lap</p>

            <p><a href="/update/${log.log_id}">로그 수정</a></p>

            <form method="post" action="/delete">
                <input type="hidden" name="id" value="${log.log_id}">
                <button type="submit"
                    onclick="return confirm('이 주행 로그를 삭제할까요?')">
                    로그 삭제
                </button>
            </form>

            <p><a href="/logs">전체 로그</a></p>
        `;

        await sendPage(res, body);
    } catch (err) {
        errorPage(res, err);
    }
});

// ========================================
// 9. 주행 로그 수정 UPDATE
// 수정 후 역학 결과를 다시 계산합니다.
// ========================================

app.get('/update/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).send('잘못된 로그 ID입니다.');
        }

        const logs = await query(
            'SELECT * FROM Mechanical_Run_Logs WHERE log_id = ?',
            [id]
        );

        if (!logs.length) {
            return res.status(404).send('주행 로그를 찾을 수 없습니다.');
        }

        const log = logs[0];
        const cars = await query('SELECT * FROM Vehicle_Aero_Specs');
        const tracks = await query('SELECT * FROM Track_Environments');

        const body = `
            <h2>주행 로그 수정</h2>
            <form method="post" action="/update">
                <input type="hidden" name="log_id" value="${log.log_id}">

                <p>차량:
                    <select name="car_id" required>
                        ${cars.map(c => `
                            <option value="${c.car_id}"
                                ${c.car_id === log.car_id ? 'selected' : ''}>
                                ${clean(c.model_name)}
                            </option>
                        `).join('')}
                    </select>
                </p>

                <p>트랙:
                    <select name="env_id" required>
                        ${tracks.map(t => `
                            <option value="${t.env_id}"
                                ${t.env_id === log.env_id ? 'selected' : ''}>
                                ${clean(t.track_name)}
                            </option>
                        `).join('')}
                    </select>
                </p>

                <p>영각:
                    <input type="number" name="wing_angle" min="0" max="90"
                        step="any" value="${log.wing_angle}" required>
                </p>

                <p>속도:
                    <input type="number" name="velocity" min="0.1"
                        step="any" value="${log.velocity}" required>
                </p>

                <p>타이어:
                    <select name="tire_compound">
                        ${['Soft', 'Medium', 'Hard'].map(t => `
                            <option value="${t}"
                                ${t === log.tire_compound ? 'selected' : ''}>
                                ${t}
                            </option>
                        `).join('')}
                    </select>
                </p>

                <button type="submit">수정 및 재계산</button>
            </form>
        `;

        await sendPage(res, body);
    } catch (err) {
        errorPage(res, err);
    }
});

app.post('/update', async (req, res) => {
    try {
        const id = Number(req.body.log_id);
        const carId = Number(req.body.car_id);
        const envId = Number(req.body.env_id);
        const angle = Number(req.body.wing_angle);
        const velocity = Number(req.body.velocity);
        const tire = clean(req.body.tire_compound);

        if (
            !Number.isInteger(id) || id < 1 ||
            !Number.isInteger(carId) || carId < 1 ||
            !Number.isInteger(envId) || envId < 1 ||
            !Number.isFinite(angle) || angle < 0 || angle > 90 ||
            !validPositiveNumber(velocity) ||
            !['Soft', 'Medium', 'Hard'].includes(tire)
        ) {
            return res.status(400).send('입력값을 확인해 주세요.');
        }

        const cars = await query(
            'SELECT * FROM Vehicle_Aero_Specs WHERE car_id = ?',
            [carId]
        );
        const tracks = await query(
            'SELECT * FROM Track_Environments WHERE env_id = ?',
            [envId]
        );

        if (!cars.length || !tracks.length) {
            return res.status(400).send('차량 또는 트랙 정보가 없습니다.');
        }

        const car = cars[0];
        const track = tracks[0];

        const cl = 1.2 * Math.sin(angle * Math.PI / 180);
        const downforce =
            0.5 * Number(track.air_density) * velocity * velocity *
            Number(car.wing_area) * cl;

        const compoundFactor = {
            Soft: 1.5,
            Medium: 1.0,
            Hard: 0.7
        };

        const wearRate =
            compoundFactor[tire] *
            Math.pow(velocity / 45, 2) *
            (1 + angle / 90) /
            Math.max(Number(track.friction_coeff), 0.01);

        await query(`
            UPDATE Mechanical_Run_Logs
            SET car_id = ?, env_id = ?, wing_angle = ?, velocity = ?,
                tire_compound = ?, calculated_downforce = ?,
                calculated_wear_rate = ?
            WHERE log_id = ?
        `, [
            carId, envId, angle, velocity, tire,
            downforce, wearRate, id
        ]);

        res.redirect(`/logs/${id}`);
    } catch (err) {
        errorPage(res, err);
    }
});

// ========================================
// 10. 주행 로그 삭제 DELETE
// ========================================

app.post('/delete', async (req, res) => {
    try {
        const id = Number(req.body.id);

        if (!Number.isInteger(id) || id < 1) {
            return res.status(400).send('잘못된 로그 ID입니다.');
        }

        await query(
            'DELETE FROM Mechanical_Run_Logs WHERE log_id = ?',
            [id]
        );

        res.redirect('/logs');
    } catch (err) {
        errorPage(res, err);
    }
});

// ========================================
// 11. 통계: AVG, COUNT, GROUP BY
// ========================================

app.get('/stats', async (req, res) => {
    try {
        const tireStats = await query(`
            SELECT
                tire_compound,
                COUNT(*) AS run_count,
                AVG(calculated_wear_rate) AS avg_wear,
                MAX(calculated_wear_rate) AS max_wear,
                AVG(calculated_downforce) AS avg_downforce
            FROM Mechanical_Run_Logs
            GROUP BY tire_compound
            ORDER BY avg_wear DESC
        `);

        let body = `
            <h2>타이어별 주행 통계</h2>
            <table border="1" cellpadding="6">
                <tr>
                    <th>타이어</th>
                    <th>주행 횟수</th>
                    <th>평균 마모율</th>
                    <th>최대 마모율</th>
                    <th>평균 다운포스(N)</th>
                </tr>
        `;

        for (const row of tireStats) {
            body += `
                <tr>
                    <td>${clean(row.tire_compound)}</td>
                    <td>${row.run_count}</td>
                    <td>${Number(row.avg_wear).toFixed(2)}</td>
                    <td>${Number(row.max_wear).toFixed(2)}</td>
                    <td>${Number(row.avg_downforce).toFixed(2)}</td>
                </tr>
            `;
        }

        body += '</table><p><a href="/">메인으로</a></p>';

        await sendPage(res, body);
    } catch (err) {
        errorPage(res, err);
    }
});

// ========================================
// 12. 서버 실행
// ========================================

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});