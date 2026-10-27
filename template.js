'use strict';

/*
 * AeroTire Insight
 * [생성형 AI 활용 코드]
 * 공통 HTML 템플릿, 색상 시스템, 반응형 레이아웃을 개선했습니다.
 * main.js에서 사용하는 html(), menu() 함수 인터페이스를 유지합니다.
 */

// [생성형 AI 활용 코드] HTML 특수문자를 변환하여 입력값이 HTML 태그로 실행되는 것을 방지합니다.
function escapeHtml(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// [생성형 AI 활용 코드] 숫자 표시 형식을 통일하고 값이 없으면 '-'를 표시합니다.
function number(value, digits = 2) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    const parsed = Number(value);

    return Number.isFinite(parsed)
        ? parsed.toFixed(digits)
        : escapeHtml(value);
}

// [생성형 AI 활용 코드] 수정 화면에서 기존 선택 항목을 selected 상태로 표시합니다.
function selected(current, value) {
    return String(current ?? '') === String(value ?? '')
        ? ' selected'
        : '';
}

// [생성형 AI 활용 코드] DB 조회 결과를 선택 상자의 option 목록으로 변환합니다.
function optionList(items, valueKey, labelKey, currentValue) {
    return (items || []).map((item) => `
        <option value="${escapeHtml(item[valueKey])}"${selected(currentValue, item[valueKey])}>
            ${escapeHtml(item[labelKey])}
        </option>
    `).join('');
}

// [생성형 AI 활용 코드] 모든 페이지에서 공통으로 사용하는 블루 계열 디자인과 반응형 CSS입니다.
function layoutStyles() {
    return `
        :root {
            --blue-dark: #172b58;
            --blue-deep: #2447a8;
            --blue-main: #4169e1;
            --blue-light: #7194ff;
            --blue-pale: #edf2ff;
            --blue-soft: #f5f7ff;

            --ink: #202b42;
            --muted: #71809a;
            --line: #e2e8f3;
            --surface: #ffffff;
            --background: #f5f7fc;
            --danger: #d64555;

            --shadow: 0 12px 35px rgba(34, 62, 125, 0.08);
        }

        * {
            box-sizing: border-box;
        }

        html {
            min-height: 100%;
            scroll-behavior: smooth;
        }

        body {
            margin: 0;
            min-height: 100vh;
            color: var(--ink);
            background:
                radial-gradient(
                    circle at 5% 0%,
                    rgba(113, 148, 255, 0.13),
                    transparent 34rem
                ),
                var(--background);
            font-family:
                Inter, Pretendard, -apple-system,
                BlinkMacSystemFont, "Segoe UI", Arial, sans-serif;
            line-height: 1.65;
        }

        a {
            color: var(--blue-deep);
            text-decoration: none;
            transition: color .18s ease, background .18s ease;
        }

        a:hover {
            color: var(--blue-main);
        }

        button,
        input,
        select {
            font: inherit;
        }

        .app-shell {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        /* [생성형 AI 활용 코드] 상단 내비게이션을 밝은 배경과 블루 포인트로 디자인했습니다. */
        .topbar {
            position: sticky;
            top: 0;
            z-index: 20;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 24px;
            padding: 14px max(5vw, calc((100vw - 1180px) / 2));
            background: rgba(255, 255, 255, 0.92);
            border-bottom: 1px solid rgba(220, 229, 245, 0.9);
            box-shadow: 0 4px 20px rgba(31, 60, 120, 0.04);
            backdrop-filter: blur(15px);
        }

        .brand {
            display: inline-flex;
            align-items: center;
            gap: 11px;
            flex-shrink: 0;
            color: var(--blue-dark);
            font-size: 1.08rem;
            font-weight: 850;
            letter-spacing: -0.035em;
        }

        .brand:hover {
            color: var(--blue-main);
        }

        .brand-mark {
            display: grid;
            place-items: center;
            width: 39px;
            height: 39px;
            border-radius: 12px;
            color: #fff;
            background: linear-gradient(
                145deg,
                var(--blue-light),
                var(--blue-deep)
            );
            box-shadow: 0 6px 15px rgba(65, 105, 225, 0.24);
            font-size: 0.85rem;
            font-weight: 900;
        }

        .brand-copy {
            display: flex;
            flex-direction: column;
            line-height: 1.2;
        }

        .brand-copy small {
            margin-top: 4px;
            color: var(--muted);
            font-size: 0.62rem;
            font-weight: 700;
            letter-spacing: 0.12em;
        }

        .topbar nav {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 6px;
            flex-wrap: wrap;
        }

        .topbar nav > a,
        .nav-dropdown > summary {
            display: inline-flex;
            align-items: center;
            min-height: 38px;
            padding: 8px 11px;
            border-radius: 10px;
            color: #4b5872;
            font-size: 0.86rem;
            font-weight: 750;
            cursor: pointer;
            list-style: none;
        }

        .topbar nav > a:hover,
        .nav-dropdown > summary:hover {
            color: var(--blue-deep);
            background: var(--blue-soft);
            text-decoration: none;
        }

        .topbar nav > a.nav-primary {
            color: #fff;
            background: var(--blue-main);
            box-shadow: 0 5px 13px rgba(65, 105, 225, 0.2);
        }

        .topbar nav > a.nav-primary:hover {
            color: #fff;
            background: var(--blue-deep);
        }

        .nav-dropdown {
            position: relative;
        }

        .nav-dropdown > summary::-webkit-details-marker {
            display: none;
        }

        .nav-dropdown > summary::after {
            content: '⌄';
            margin-left: 7px;
            color: var(--muted);
        }

        .nav-dropdown-menu {
            position: absolute;
            top: calc(100% + 9px);
            right: 0;
            z-index: 30;
            width: min(280px, 80vw);
            max-height: 300px;
            overflow-y: auto;
            padding: 8px;
            border: 1px solid var(--line);
            border-radius: 14px;
            background: #fff;
            box-shadow: var(--shadow);
        }

        .nav-dropdown-menu a {
            display: block;
            padding: 9px 11px;
            border-radius: 8px;
            color: var(--ink);
            font-size: 0.9rem;
        }

        .nav-dropdown-menu a:hover {
            color: var(--blue-deep);
            background: var(--blue-soft);
        }

        .nav-empty {
            display: block;
            padding: 10px;
            color: var(--muted);
            font-size: 0.84rem;
        }

        .page {
            width: min(1180px, 90vw);
            margin: 36px auto 60px;
            flex: 1;
        }

        .content {
            min-width: 0;
        }

        .content-shell {
            min-width: 0;
            padding: clamp(22px, 4vw, 42px);
            border: 1px solid rgba(222, 231, 245, 0.95);
            border-radius: 24px;
            background: rgba(255, 255, 255, 0.96);
            box-shadow: var(--shadow);
        }

        .content-shell > h2:first-child {
            margin-top: 0;
            color: var(--blue-dark);
            font-size: clamp(1.55rem, 2.8vw, 2.05rem);
            letter-spacing: -0.045em;
        }

        h1,
        h2,
        h3 {
            line-height: 1.3;
        }

        h2 {
            color: var(--blue-dark);
            letter-spacing: -0.025em;
        }

        h3 {
            margin-top: 28px;
            color: var(--blue-deep);
            font-size: 1.05rem;
        }

        p {
            color: #4b5872;
        }

        .muted {
            color: var(--muted);
        }

        .eyebrow {
            margin: 0 0 8px;
            color: var(--blue-main);
            font-size: 0.75rem;
            font-weight: 850;
            letter-spacing: 0.14em;
            text-transform: uppercase;
        }

        /* [생성형 AI 활용 코드] 카드형 레이아웃과 통계 카드를 구성합니다. */
        .hero,
        .card,
        .stat-card {
            border: 1px solid var(--line);
            border-radius: 18px;
            background: var(--surface);
            box-shadow: 0 8px 24px rgba(34, 66, 130, 0.055);
        }

        .hero {
            padding: clamp(24px, 4vw, 42px);
            background: linear-gradient(135deg, #eaf0ff 0%, #fff 75%);
        }

        .hero h1 {
            margin: 0 0 10px;
            color: var(--blue-dark);
            font-size: clamp(1.8rem, 4vw, 2.8rem);
            letter-spacing: -0.055em;
        }

        .hero p {
            max-width: 680px;
            margin: 0;
            color: var(--muted);
        }

        .card {
            padding: clamp(20px, 3vw, 30px);
            margin-bottom: 22px;
        }

        .section-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            flex-wrap: wrap;
        }

        .section-title h2 {
            margin-bottom: 4px;
        }

        .grid {
            display: grid;
            grid-template-columns:
                repeat(auto-fit, minmax(min(100%, 230px), 1fr));
            gap: 17px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns:
                repeat(auto-fit, minmax(min(100%, 175px), 1fr));
            gap: 15px;
        }

        .stat-card {
            padding: 21px;
        }

        .stat-card strong {
            display: block;
            margin-top: 5px;
            color: var(--blue-deep);
            font-size: 1.65rem;
            letter-spacing: -0.04em;
        }

        /* [생성형 AI 활용 코드] 입력창과 버튼의 색상 및 크기를 통일했습니다. */
        form {
            margin: 18px 0;
        }

        form p,
        .field {
            display: grid;
            gap: 7px;
            margin: 0 0 17px;
        }

        label,
        form p {
            color: #34415a;
            font-weight: 700;
        }

        input,
        select {
            width: 100%;
            min-height: 44px;
            padding: 10px 12px;
            border: 1px solid #cdd8e9;
            border-radius: 10px;
            outline: none;
            background: #fff;
            color: var(--ink);
            font-weight: 450;
            transition: border-color .15s ease, box-shadow .15s ease;
        }

        input::placeholder {
            color: #9aa6ba;
        }

        input:focus,
        select:focus {
            border-color: var(--blue-light);
            box-shadow: 0 0 0 4px rgba(113, 148, 255, 0.15);
        }

        button,
        .button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            min-height: 42px;
            padding: 10px 16px;
            border: 1px solid transparent;
            border-radius: 10px;
            color: #fff;
            background: var(--blue-main);
            font-weight: 750;
            cursor: pointer;
            box-shadow: 0 5px 12px rgba(40, 89, 217, 0.14);
            transition:
                transform .15s ease,
                background .15s ease,
                box-shadow .15s ease;
        }

        button:hover,
        .button:hover {
            color: #fff;
            background: var(--blue-deep);
            text-decoration: none;
            transform: translateY(-1px);
            box-shadow: 0 8px 17px rgba(40, 89, 217, 0.2);
        }

        .button.secondary,
        button.secondary {
            color: #34415a;
            background: #edf2fb;
            box-shadow: none;
        }

        .button.secondary:hover,
        button.secondary:hover {
            color: var(--blue-deep);
            background: var(--blue-pale);
        }

        .button.danger,
        button.danger {
            color: #fff;
            background: var(--danger);
            box-shadow: none;
        }

        .actions {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
            margin-top: 22px;
        }

        form:has(input[name="keyword"]) {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        form:has(input[name="keyword"]) input {
            flex: 1;
            min-width: 150px;
        }

        form:has(input[name="keyword"]) button {
            flex-shrink: 0;
        }

        form:has(input[type="hidden"]) {
            margin: 0;
        }

        form:has(input[type="hidden"]) button {
            margin: 0;
        }

        /* [생성형 AI 활용 코드] 표의 테두리와 가로 스크롤을 적용해 작은 화면에서도 확인할 수 있게 합니다. */
        .table-wrap {
            max-width: 100%;
            overflow-x: auto;
            border: 1px solid var(--line);
            border-radius: 13px;
        }

        table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            min-width: 620px;
            background: #fff;
        }

        th,
        td {
            padding: 13px 14px;
            border-bottom: 1px solid #e8edf6;
            text-align: left;
            vertical-align: middle;
        }

        th {
            color: #44516a;
            background: #f4f7fd;
            font-size: 0.82rem;
            font-weight: 800;
            white-space: nowrap;
        }

        tbody tr:last-child td {
            border-bottom: 0;
        }

        tbody tr:hover {
            background: #f8faff;
        }

        td {
            color: #34415a;
            font-size: 0.92rem;
        }

        td.numeric,
        th.numeric {
            text-align: right;
            font-variant-numeric: tabular-nums;
        }

        .badge {
            display: inline-flex;
            align-items: center;
            padding: 5px 10px;
            border: 1px solid #d9e5ff;
            border-radius: 999px;
            color: var(--blue-deep);
            background: var(--blue-soft);
            font-size: 0.79rem;
            font-weight: 800;
        }

        .notice {
            padding: 14px 16px;
            border: 1px solid #d9e5ff;
            border-radius: 12px;
            color: var(--blue-deep);
            background: var(--blue-soft);
        }

        .empty-state {
            padding: 30px 18px;
            border: 1px dashed #c9d7ee;
            border-radius: 15px;
            color: var(--muted);
            text-align: center;
            background: #f9fbff;
        }

        footer {
            padding: 25px 5vw 30px;
            color: #8390a6;
            text-align: center;
            font-size: 0.83rem;
        }

        footer strong {
            color: var(--blue-deep);
        }

        /* [생성형 AI 활용 코드] 태블릿과 모바일 화면에 맞게 메뉴와 콘텐츠 배치를 조정합니다. */
        @media (max-width: 900px) {
            .topbar {
                align-items: flex-start;
                flex-direction: column;
                gap: 12px;
            }

            .topbar nav {
                justify-content: flex-start;
            }

            .page {
                width: min(94vw, 1180px);
                margin-top: 24px;
            }
        }

        @media (max-width: 560px) {
            .topbar {
                padding: 13px 4vw;
            }

            .topbar nav {
                gap: 3px;
            }

            .topbar nav > a,
            .nav-dropdown > summary {
                padding: 8px 9px;
                font-size: 0.82rem;
            }

            .page {
                width: 94vw;
                margin-top: 17px;
            }

            .content-shell {
                padding: 19px;
                border-radius: 17px;
            }

            .hero,
            .card {
                padding: 20px;
            }

            form:has(input[name="keyword"]) {
                align-items: stretch;
                flex-direction: column;
            }

            form:has(input[name="keyword"]) button {
                width: 100%;
            }

            .actions > * {
                max-width: 100%;
            }
        }
    `;
}

// [생성형 AI 활용 코드] main.js에서 전달한 내용을 공통 헤더, 콘텐츠, 푸터와 결합합니다.
function html(menuHtml, body) {
    // [생성형 AI 활용 코드] 일반 표를 반응형 가로 스크롤 영역으로 감쌉니다.
    const safeBody = String(body || '').replace(
        /<table\b([^>]*)>([\s\S]*?)<\/table>/gi,
        '<div class="table-wrap"><table$1>$2</table></div>'
    );

    return `<!doctype html>
<html lang="ko">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#4169e1">
    <title>AeroTire Insight | Engineering Dashboard</title>
    <style>${layoutStyles()}</style>
</head>
<body>
    <div class="app-shell">
        <header class="topbar">
            <a class="brand" href="/" aria-label="AeroTire Insight 메인 페이지">
                <span class="brand-mark">AT</span>
                <span class="brand-copy">
                    AeroTire Insight
                    <small>ENGINEERING ANALYTICS</small>
                </span>
            </a>

            <nav aria-label="주요 메뉴">
                <a href="/">대시보드</a>
                <a href="/cars/create">차량 등록</a>
                <a href="/tracks/create">트랙 등록</a>
                <a class="nav-primary" href="/create">+ 주행 분석</a>
                <a href="/logs">주행 로그</a>
                <a href="/stats">통계</a>
                ${menuHtml || ''}
            </nav>
        </header>

        <main class="page content">
            <section class="content-shell">
                ${safeBody}
            </section>
        </main>

        <footer>
            <strong>AeroTire Insight</strong>
            · 모터스포츠 공력 세팅 및 타이어 마모 분석 플랫폼
        </footer>
    </div>
</body>
</html>`;
}

// [생성형 AI 활용 코드] 등록된 차량을 상단의 접을 수 있는 목록으로 표시합니다.
// 기존 main.js의 template.menu(cars, selectedId) 사용 방식을 유지합니다.
function menu(cars, selectedId = null) {
    const items = (cars || []).map((car) => `
        <a href="/cars/${encodeURIComponent(car.car_id)}"${selected(selectedId, car.car_id) ? ' aria-current="page"' : ''}>
            ${escapeHtml(car.model_name)} · #${escapeHtml(car.car_id)}
        </a>
    `).join('');

    return `
        <details class="nav-dropdown">
            <summary>차량 목록</summary>
            <div class="nav-dropdown-menu">
                ${items || '<span class="nav-empty">등록된 차량이 없습니다.</span>'}
            </div>
        </details>
    `;
}

// [생성형 AI 활용 코드] 주행 조건 입력 폼을 재사용 가능한 HTML 함수로 제공합니다.
function create(cars, tracks) {
    return `
        <div class="card">
            <p class="eyebrow">RUN CONFIGURATION</p>
            <h2>주행 세팅 및 역학 자동 연산</h2>
            <p class="muted">
                차량과 트랙 환경을 선택하고 주행 조건을 입력하세요.
            </p>

            <form action="/create" method="post">
                <div class="grid">
                    <div class="field">
                        <label for="car_id">차량</label>
                        <select id="car_id" name="car_id" required>
                            <option value="">차량을 선택하세요</option>
                            ${optionList(cars, 'car_id', 'model_name', '')}
                        </select>
                    </div>

                    <div class="field">
                        <label for="env_id">트랙 환경</label>
                        <select id="env_id" name="env_id" required>
                            <option value="">트랙을 선택하세요</option>
                            ${optionList(tracks, 'env_id', 'track_name', '')}
                        </select>
                    </div>

                    <div class="field">
                        <label for="wing_angle">스포일러 영각 (deg)</label>
                        <input id="wing_angle" name="wing_angle"
                            type="number" min="0" max="90"
                            step="0.1" placeholder="예: 12.5" required>
                    </div>

                    <div class="field">
                        <label for="velocity">주행 속도 (m/s)</label>
                        <input id="velocity" name="velocity"
                            type="number" min="0.1"
                            step="0.1" placeholder="예: 45.0" required>
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
                    <button type="submit">계산 후 저장</button>
                    <a class="button secondary" href="/">취소</a>
                </div>
            </form>
        </div>
    `;
}

// [생성형 AI 활용 코드] JOIN 조회 결과를 카드형 상세 화면으로 표시합니다.
function read(log) {
    const hasJoinedNames = Boolean(log.model_name || log.track_name);

    return `
        <div class="card">
            <div class="section-title">
                <div>
                    <p class="eyebrow">RUN DETAIL</p>
                    <h2>주행 로그 상세</h2>
                    <p class="muted">로그 ID #${escapeHtml(log.log_id)}</p>
                </div>
                <span class="badge">
                    ${escapeHtml(log.tire_compound)} compound
                </span>
            </div>

            <div class="grid">
                <div>
                    <strong>차량</strong>
                    <p>${hasJoinedNames
                        ? escapeHtml(log.model_name)
                        : `차량 ID ${escapeHtml(log.car_id)}`}</p>
                </div>

                <div>
                    <strong>트랙</strong>
                    <p>${hasJoinedNames
                        ? escapeHtml(log.track_name)
                        : `환경 ID ${escapeHtml(log.env_id)}`}</p>
                </div>

                <div>
                    <strong>영각</strong>
                    <p>${number(log.wing_angle, 1)} deg</p>
                </div>

                <div>
                    <strong>속도</strong>
                    <p>${number(log.velocity, 1)} m/s</p>
                </div>

                <div>
                    <strong>계산된 다운포스</strong>
                    <p>${number(log.calculated_downforce)} N</p>
                </div>

                <div>
                    <strong>랩당 마모율</strong>
                    <p>${number(log.calculated_wear_rate)} %/lap</p>
                </div>
            </div>

            <div class="actions">
                <a class="button"
                    href="/update/${encodeURIComponent(log.log_id)}">수정</a>

                <form action="/delete" method="post"
                    onsubmit="return confirm('이 주행 로그를 삭제하시겠습니까?');">
                    <input type="hidden" name="id"
                        value="${escapeHtml(log.log_id)}">
                    <button class="danger" type="submit">삭제</button>
                </form>

                <a class="button secondary" href="/logs">목록으로</a>
            </div>
        </div>
    `;
}

// [생성형 AI 활용 코드] 기존 데이터가 선택된 상태로 나타나는 수정 폼입니다.
function update(log, cars, tracks) {
    return `
        <div class="card">
            <p class="eyebrow">EDIT RUN</p>
            <h2>주행 로그 수정</h2>
            <p class="muted">
                조건을 변경한 뒤 저장하면 서버에서 역학 결과를 다시 계산합니다.
            </p>

            <form action="/update" method="post">
                <input type="hidden" name="log_id"
                    value="${escapeHtml(log.log_id)}">

                <div class="grid">
                    <div class="field">
                        <label for="car_id">차량</label>
                        <select id="car_id" name="car_id" required>
                            ${optionList(cars, 'car_id', 'model_name', log.car_id)}
                        </select>
                    </div>

                    <div class="field">
                        <label for="env_id">트랙 환경</label>
                        <select id="env_id" name="env_id" required>
                            ${optionList(tracks, 'env_id', 'track_name', log.env_id)}
                        </select>
                    </div>

                    <div class="field">
                        <label for="wing_angle">스포일러 영각 (deg)</label>
                        <input id="wing_angle" name="wing_angle"
                            type="number" min="0" max="90" step="0.1"
                            value="${escapeHtml(log.wing_angle)}" required>
                    </div>

                    <div class="field">
                        <label for="velocity">주행 속도 (m/s)</label>
                        <input id="velocity" name="velocity"
                            type="number" min="0.1" step="0.1"
                            value="${escapeHtml(log.velocity)}" required>
                    </div>

                    <div class="field">
                        <label for="tire_compound">타이어 컴파운드</label>
                        <select id="tire_compound" name="tire_compound" required>
                            <option value="Soft"${selected(log.tire_compound, 'Soft')}>Soft</option>
                            <option value="Medium"${selected(log.tire_compound, 'Medium')}>Medium</option>
                            <option value="Hard"${selected(log.tire_compound, 'Hard')}>Hard</option>
                        </select>
                    </div>
                </div>

                <div class="actions">
                    <button type="submit">수정 및 재계산</button>
                    <a class="button secondary"
                        href="/logs/${encodeURIComponent(log.log_id)}">취소</a>
                </div>
            </form>
        </div>
    `;
}

// [생성형 AI 활용 코드] 집계 SQL에서 받은 rows를 통계 카드와 표로 표시합니다.
// rows에는 model_name, total_runs, avg_velocity, avg_downforce 값이 필요합니다.
function stats(rows) {
    const data = rows || [];

    const totalRuns = data.reduce(
        (sum, row) => sum + Number(row.total_runs || 0),
        0
    );

    const activeCars = data.filter(
        (row) => Number(row.total_runs || 0) > 0
    ).length;

    const velocityValues = data
        .filter(
            (row) =>
                row.avg_velocity !== null &&
                row.avg_velocity !== undefined
        )
        .map((row) => Number(row.avg_velocity));

    const overallAvgVelocity = velocityValues.length
        ? velocityValues.reduce((sum, value) => sum + value, 0)
            / velocityValues.length
        : null;

    const tableRows = data.map((row) => `
        <tr>
            <td>${escapeHtml(row.model_name)}</td>
            <td class="numeric">${escapeHtml(row.total_runs || 0)}</td>
            <td class="numeric">${number(row.avg_velocity, 1)} m/s</td>
            <td class="numeric">${number(row.avg_downforce)} N</td>
        </tr>
    `).join('');

    return `
        <div class="card">
            <p class="eyebrow">ANALYTICS OVERVIEW</p>
            <h2>공력-마모 통계 대시보드</h2>

            <div class="stats-grid">
                <div class="stat-card">
                    <span class="muted">등록 차량</span>
                    <strong>${data.length}</strong>
                </div>

                <div class="stat-card">
                    <span class="muted">주행 차량</span>
                    <strong>${activeCars}</strong>
                </div>

                <div class="stat-card">
                    <span class="muted">총 주행 횟수</span>
                    <strong>${totalRuns}</strong>
                </div>

                <div class="stat-card">
                    <span class="muted">차량별 평균 속도 평균</span>
                    <strong>${overallAvgVelocity === null
                        ? '-'
                        : `${overallAvgVelocity.toFixed(1)} m/s`}</strong>
                </div>
            </div>
        </div>

        <div class="card">
            <div class="section-title">
                <h2>차량별 집계</h2>
                <span class="badge">GROUP BY car</span>
            </div>

            ${tableRows
                ? `<table>
                    <thead>
                        <tr>
                            <th>차량명</th>
                            <th class="numeric">주행 횟수</th>
                            <th class="numeric">평균 속도</th>
                            <th class="numeric">평균 다운포스</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>`
                : '<div class="empty-state">아직 통계 데이터가 없습니다.</div>'}
        </div>
    `;
}

// [생성형 AI 활용 코드] main.js가 화면을 만들 때 사용할 템플릿 함수를 내보냅니다.
module.exports = {
    html,
    menu,
    create,
    read,
    update,
    stats
};