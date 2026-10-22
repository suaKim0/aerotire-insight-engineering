"use strict";

/**
 * AeroTire Insight HTML template helpers.
 *
 * app.js에서 사용하는 함수:
 *   menu(selectedId, callback)
 *   html(menuHtml, bodyHtml)
 *   create(cars, tracks)
 *   read(log)
 *   stats(rows)
 *   update(log, cars, tracks)
 */

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function number(value, digits = 2) {
    if (value === null || value === undefined || value === "") return "-";
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed.toFixed(digits) : escapeHtml(value);
}

function selected(current, value) {
    return String(current ?? "") === String(value ?? "") ? " selected" : "";
}

function optionList(items, valueKey, labelKey, currentValue) {
    return (items || []).map((item) => `
        <option value="${escapeHtml(item[valueKey])}"${selected(currentValue, item[valueKey])}>
            ${escapeHtml(item[labelKey])}
        </option>
    `).join("");
}

function layoutStyles() {
    return `
        :root {
            --navy: #10233f;
            --blue: #1677ff;
            --light-blue: #eaf3ff;
            --ink: #1d2939;
            --muted: #667085;
            --line: #dbe3ef;
            --danger: #c62828;
            --surface: #ffffff;
            --background: #f4f7fb;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            color: var(--ink);
            background: var(--background);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
            line-height: 1.55;
        }
        a { color: var(--blue); text-decoration: none; }
        a:hover { text-decoration: underline; }
        .app-shell { min-height: 100vh; display: flex; flex-direction: column; }
        .topbar {
            display: flex; align-items: center; justify-content: space-between;
            gap: 24px; padding: 18px 5vw; color: #fff; background: var(--navy);
        }
        .brand { color: #fff; font-size: 1.25rem; font-weight: 800; letter-spacing: .02em; }
        .brand:hover { text-decoration: none; }
        .topbar nav { display: flex; gap: 18px; flex-wrap: wrap; }
        .topbar nav a { color: #dbeafe; font-size: .95rem; }
        .page { width: min(1180px, 90vw); margin: 32px auto 60px; }
        .content { min-height: 360px; }
        .hero, .card, .stat-card {
            background: var(--surface); border: 1px solid var(--line); border-radius: 14px;
            box-shadow: 0 7px 22px rgba(16, 35, 63, .06);
        }
        .hero { padding: 34px; background: linear-gradient(135deg, #eef6ff, #fff); }
        .hero h1 { margin: 0 0 8px; color: var(--navy); }
        .hero p { margin: 0; color: var(--muted); }
        .card { padding: 24px; margin-bottom: 22px; }
        h1, h2, h3 { line-height: 1.25; }
        h2 { color: var(--navy); margin-top: 0; }
        .section-title { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
        .muted { color: var(--muted); }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 16px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 16px; }
        .stat-card { padding: 20px; }
        .stat-card strong { display: block; margin-top: 4px; color: var(--navy); font-size: 1.45rem; }
        label { display: block; margin-bottom: 6px; color: #344054; font-weight: 700; }
        input, select {
            width: 100%; padding: 10px 12px; border: 1px solid #b8c5d6; border-radius: 8px;
            background: #fff; color: var(--ink); font: inherit;
        }
        input:focus, select:focus { outline: 3px solid #cfe2ff; border-color: var(--blue); }
        .field { margin-bottom: 16px; }
        .actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-top: 22px; }
        .button {
            display: inline-block; border: 0; border-radius: 8px; padding: 10px 16px;
            color: #fff; background: var(--blue); font: inherit; font-weight: 700; cursor: pointer;
        }
        .button:hover { background: #075fd4; text-decoration: none; }
        .button.secondary { color: var(--ink); background: #e8eef7; }
        .button.danger { background: var(--danger); }
        .table-wrap { overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; min-width: 620px; }
        th, td { padding: 12px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: middle; }
        th { color: #344054; background: #f8fafc; font-size: .9rem; }
        td.numeric, th.numeric { text-align: right; }
        .badge { display: inline-block; padding: 3px 9px; border-radius: 999px; color: #175cd3; background: var(--light-blue); font-size: .85rem; font-weight: 700; }
        .notice { padding: 14px 16px; border-radius: 8px; color: #174ea6; background: #eef6ff; }
        footer { margin-top: auto; padding: 24px 5vw; color: var(--muted); text-align: center; font-size: .9rem; }
        @media (max-width: 640px) {
            .topbar { align-items: flex-start; flex-direction: column; }
            .page { width: 94vw; margin-top: 20px; }
            .hero, .card { padding: 20px; }
        }
    `;
}

module.exports = {
    html(menuHtml, body) {
        return `<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>AeroTire Insight</title>
    <style>${layoutStyles()}</style>
</head>
<body>
    <div class="app-shell">
        <header class="topbar">
            <a class="brand" href="/">AeroTire Insight</a>
            <nav aria-label="주요 메뉴">
                ${menuHtml || ""}
                <a href="/create">주행 로그 등록</a>
                <a href="/stats">통계 대시보드</a>
            </nav>
        </header>
        <main class="page content">${body || ""}</main>
        <footer>모터스포츠 공력 세팅 및 타이어 마모 분석 플랫폼</footer>
    </div>
</body>
</html>`;
    },

    menu(cars, selectedId) {
        const links = (cars || []).map((car) => `
            <a href="/${encodeURIComponent(car.car_id)}"${selected(selectedId, car.car_id) ? ' aria-current="page"' : ""}>
                ${escapeHtml(car.model_name)}
            </a>
        `).join("");
        return links || '<span style="color:#dbeafe">등록된 차량 없음</span>';
    },

    create(cars, tracks) {
        return `
            <div class="card">
                <h2>주행 세팅 및 역학 자동 연산</h2>
                <p class="muted">차량과 트랙 환경을 선택하고 주행 조건을 입력하면 다운포스와 타이어 마모율을 자동 계산합니다.</p>
                <form action="/create" method="post">
                    <div class="grid">
                        <div class="field">
                            <label for="car_id">차량</label>
                            <select id="car_id" name="car_id" required>
                                <option value="">차량을 선택하세요</option>
                                ${optionList(cars, "car_id", "model_name", "")}
                            </select>
                        </div>
                        <div class="field">
                            <label for="env_id">트랙 환경</label>
                            <select id="env_id" name="env_id" required>
                                <option value="">트랙을 선택하세요</option>
                                ${optionList(tracks, "env_id", "track_name", "")}
                            </select>
                        </div>
                        <div class="field">
                            <label for="wing_angle">스포일러 영각 (deg)</label>
                            <input id="wing_angle" name="wing_angle" type="number" min="0" max="90" step="0.1" placeholder="예: 12.5" required>
                        </div>
                        <div class="field">
                            <label for="velocity">주행 속도 (m/s)</label>
                            <input id="velocity" name="velocity" type="number" min="0" step="0.1" placeholder="예: 45.0" required>
                        </div>
                        <div class="field">
                            <label for="tire_compound">타이어 컴파운드</label>
                            <select id="tire_compound" name="tire_compound" required>
                                <option value="Soft">Soft</option>
                                <option value="Medium" selected>Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="button" type="submit">계산 후 저장</button>
                        <a class="button secondary" href="/">취소</a>
                    </div>
                </form>
            </div>
        `;
    },

    read(log) {
        const hasJoinedNames = log.model_name || log.track_name;
        return `
            <div class="card">
                <div class="section-title">
                    <div>
                        <h2>주행 로그 상세</h2>
                        <p class="muted">로그 ID #${escapeHtml(log.log_id)}</p>
                    </div>
                    <span class="badge">${escapeHtml(log.tire_compound)} compound</span>
                </div>
                <div class="grid">
                    <div><strong>차량</strong><br>${hasJoinedNames ? escapeHtml(log.model_name) : `차량 ID ${escapeHtml(log.car_id)}`}</div>
                    <div><strong>트랙</strong><br>${hasJoinedNames ? escapeHtml(log.track_name) : `환경 ID ${escapeHtml(log.env_id)}`}</div>
                    <div><strong>영각</strong><br>${number(log.wing_angle, 1)} deg</div>
                    <div><strong>속도</strong><br>${number(log.velocity, 1)} m/s</div>
                    <div><strong>계산된 다운포스</strong><br>${number(log.calculated_downforce)} N</div>
                    <div><strong>랩당 마모율</strong><br>${number(log.calculated_wear_rate)} %/lap</div>
                </div>
                <div class="actions">
                    <a class="button" href="/update/${encodeURIComponent(log.log_id)}">수정</a>
                    <form action="/delete" method="post" onsubmit="return confirm('이 주행 로그를 삭제하시겠습니까?');">
                        <input type="hidden" name="id" value="${escapeHtml(log.log_id)}">
                        <button class="button danger" type="submit">삭제</button>
                    </form>
                    <a class="button secondary" href="/">목록으로</a>
                </div>
            </div>
        `;
    },

    update(log, cars, tracks) {
        return `
            <div class="card">
                <h2>주행 로그 수정</h2>
                <p class="muted">조건을 수정하면 공학 연산 결과도 함께 다시 계산됩니다.</p>
                <form action="/update" method="post">
                    <input type="hidden" name="id" value="${escapeHtml(log.log_id)}">
                    <div class="grid">
                        <div class="field">
                            <label for="car_id">차량</label>
                            <select id="car_id" name="car_id" required>
                                ${optionList(cars, "car_id", "model_name", log.car_id)}
                            </select>
                        </div>
                        <div class="field">
                            <label for="env_id">트랙 환경</label>
                            <select id="env_id" name="env_id" required>
                                ${optionList(tracks, "env_id", "track_name", log.env_id)}
                            </select>
                        </div>
                        <div class="field">
                            <label for="wing_angle">스포일러 영각 (deg)</label>
                            <input id="wing_angle" name="wing_angle" type="number" min="0" max="90" step="0.1" value="${escapeHtml(log.wing_angle)}" required>
                        </div>
                        <div class="field">
                            <label for="velocity">주행 속도 (m/s)</label>
                            <input id="velocity" name="velocity" type="number" min="0" step="0.1" value="${escapeHtml(log.velocity)}" required>
                        </div>
                        <div class="field">
                            <label for="tire_compound">타이어 컴파운드</label>
                            <select id="tire_compound" name="tire_compound" required>
                                <option value="Soft"${selected(log.tire_compound, "Soft")}>Soft</option>
                                <option value="Medium"${selected(log.tire_compound, "Medium")}>Medium</option>
                                <option value="Hard"${selected(log.tire_compound, "Hard")}>Hard</option>
                            </select>
                        </div>
                    </div>
                    <div class="actions">
                        <button class="button" type="submit">수정 및 재계산</button>
                        <a class="button secondary" href="/${encodeURIComponent(log.log_id)}">취소</a>
                    </div>
                </form>
            </div>
        `;
    },

    stats(rows) {
        const data = rows || [];
        const totalRuns = data.reduce((sum, row) => sum + Number(row.total_runs || 0), 0);
        const activeCars = data.filter((row) => Number(row.total_runs || 0) > 0).length;
        const avgVelocityValues = data.filter((row) => row.avg_velocity !== null && row.avg_velocity !== undefined).map((row) => Number(row.avg_velocity));
        const overallAvgVelocity = avgVelocityValues.length
            ? avgVelocityValues.reduce((sum, value) => sum + value, 0) / avgVelocityValues.length
            : null;

        const tableRows = data.map((row) => `
            <tr>
                <td>${escapeHtml(row.model_name)}</td>
                <td class="numeric">${escapeHtml(row.total_runs || 0)}</td>
                <td class="numeric">${number(row.avg_velocity, 1)} m/s</td>
                <td class="numeric">${number(row.avg_downforce)} N</td>
            </tr>
        `).join("");

        return `
            <div class="card">
                <h2>공력-마모 통계 대시보드</h2>
                <p class="muted">차량별 주행 횟수, 평균 속도, 평균 다운포스를 집계한 결과입니다.</p>
                <div class="stats-grid">
                    <div class="stat-card"><span class="muted">등록 차량</span><strong>${data.length}</strong></div>
                    <div class="stat-card"><span class="muted">주행 차량</span><strong>${activeCars}</strong></div>
                    <div class="stat-card"><span class="muted">총 주행 횟수</span><strong>${totalRuns}</strong></div>
                    <div class="stat-card"><span class="muted">차량별 평균 속도</span><strong>${overallAvgVelocity === null ? "-" : `${overallAvgVelocity.toFixed(1)} m/s`}</strong></div>
                </div>
            </div>
            <div class="card">
                <div class="section-title"><h2>차량별 집계</h2><span class="badge">GROUP BY car</span></div>
                ${tableRows ? `
                    <div class="table-wrap"><table>
                        <thead><tr><th>차량명</th><th class="numeric">주행 횟수</th><th class="numeric">평균 속도</th><th class="numeric">평균 다운포스</th></tr></thead>
                        <tbody>${tableRows}</tbody>
                    </table></div>
                ` : '<p class="notice">아직 등록된 차량이 없습니다.</p>'}
            </div>
        `;
    }
};