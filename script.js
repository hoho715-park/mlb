'use strict';

const API = 'https://statsapi.mlb.com/api/v1';

/* ── 30구단 (MLB 공식 팀 ID) ── */
const LEAGUES = [
  {
    name: 'AMERICAN LEAGUE',
    divisions: [
      { name: 'AL East', teams: [
        { id:111, abbr:'BOS', city:'Boston',       name:'Red Sox'    },
        { id:147, abbr:'NYY', city:'New York',     name:'Yankees'    },
        { id:141, abbr:'TOR', city:'Toronto',      name:'Blue Jays'  },
        { id:139, abbr:'TB',  city:'Tampa Bay',    name:'Rays'       },
        { id:110, abbr:'BAL', city:'Baltimore',    name:'Orioles'    },
      ]},
      { name: 'AL Central', teams: [
        { id:114, abbr:'CLE', city:'Cleveland',    name:'Guardians'  },
        { id:116, abbr:'DET', city:'Detroit',      name:'Tigers'     },
        { id:118, abbr:'KC',  city:'Kansas City',  name:'Royals'     },
        { id:142, abbr:'MIN', city:'Minnesota',    name:'Twins'      },
        { id:145, abbr:'CWS', city:'Chicago',      name:'White Sox'  },
      ]},
      { name: 'AL West', teams: [
        { id:117, abbr:'HOU', city:'Houston',      name:'Astros'     },
        { id:108, abbr:'LAA', city:'Los Angeles',  name:'Angels'     },
        { id:133, abbr:'OAK', city:'Oakland',      name:'Athletics'  },
        { id:136, abbr:'SEA', city:'Seattle',      name:'Mariners'   },
        { id:140, abbr:'TEX', city:'Texas',        name:'Rangers'    },
      ]},
    ],
  },
  {
    name: 'NATIONAL LEAGUE',
    divisions: [
      { name: 'NL East', teams: [
        { id:144, abbr:'ATL', city:'Atlanta',       name:'Braves'     },
        { id:146, abbr:'MIA', city:'Miami',         name:'Marlins'    },
        { id:121, abbr:'NYM', city:'New York',      name:'Mets'       },
        { id:143, abbr:'PHI', city:'Philadelphia',  name:'Phillies'   },
        { id:120, abbr:'WSH', city:'Washington',    name:'Nationals'  },
      ]},
      { name: 'NL Central', teams: [
        { id:112, abbr:'CHC', city:'Chicago',       name:'Cubs'       },
        { id:113, abbr:'CIN', city:'Cincinnati',    name:'Reds'       },
        { id:158, abbr:'MIL', city:'Milwaukee',     name:'Brewers'    },
        { id:134, abbr:'PIT', city:'Pittsburgh',    name:'Pirates'    },
        { id:138, abbr:'STL', city:'St. Louis',     name:'Cardinals'  },
      ]},
      { name: 'NL West', teams: [
        { id:109, abbr:'AZ',  city:'Arizona',       name:'Diamondbacks' },
        { id:115, abbr:'COL', city:'Colorado',      name:'Rockies'    },
        { id:119, abbr:'LAD', city:'Los Angeles',   name:'Dodgers'    },
        { id:135, abbr:'SD',  city:'San Diego',     name:'Padres'     },
        { id:137, abbr:'SF',  city:'San Francisco', name:'Giants'     },
      ]},
    ],
  },
];

/* ── 팀 약어 → 한국어 ── */
const TEAM_KO = {
  BOS:'레드삭스',    NYY:'양키스',       TOR:'블루제이스',  TB:'레이스',
  BAL:'오리올스',    CLE:'가디언스',     DET:'타이거스',    KC:'로열스',
  MIN:'트윈스',      CWS:'화이트삭스',   HOU:'애스트로스',  LAA:'에인절스',
  OAK:'애슬레틱스',  SEA:'마리너스',     TEX:'레인저스',    ATL:'브레이브스',
  MIA:'말린스',      NYM:'메츠',         PHI:'필리스',      WSH:'내셔널스',
  CHC:'컵스',        CIN:'레즈',         MIL:'브루어스',    PIT:'파이럿츠',
  STL:'카디널스',    AZ:'다이아몬드백스', COL:'로키스',     LAD:'다저스',
  SD:'파드리스',     SF:'자이언츠',
};

/* ── 팀 ID → 팀 정보 매핑 ── */
const TEAM_ID_TO_ABBR = {};
const TEAM_ID_TO_INFO = {};
for (const league of LEAGUES) {
  for (const div of league.divisions) {
    for (const t of div.teams) {
      TEAM_ID_TO_ABBR[t.id] = t.abbr;
      TEAM_ID_TO_INFO[t.id] = t;
    }
  }
}

/* ── 팀 약어 가져오기 (API 응답 또는 매핑에서) ── */
const getTeamAbbr = (team) => team.abbreviation || TEAM_ID_TO_ABBR[team.id] || team.teamName || 'UNK';

/* ── 유틸 ── */
const today  = ()  => new Date().toISOString().slice(0, 10);
const offset = (d) => { const dt = new Date(); dt.setDate(dt.getDate() + d); return dt.toISOString().slice(0, 10); };
const currentYear = () => new Date().getFullYear();
const teamLogoUrl = (teamId) => `https://www.mlbstatic.com/team-logos/${teamId}.svg`;
const fmtDate = (iso) => new Date(iso).toLocaleDateString('ko-KR', { month:'2-digit', day:'2-digit', timeZone:'Asia/Seoul' });
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('ko-KR', { hour:'2-digit', minute:'2-digit', timeZone:'Asia/Seoul' });
const loadingHtml = (msg = '로딩 중') =>
  `<div class="loading"><div class="spinner"></div><div class="loading-txt">${msg}</div></div>`;

/* ── API 호출 ── */
async function getSchedule(teamId, startDate, endDate) {
  const res = await fetch(`${API}/schedule?sportId=1&teamId=${teamId}&startDate=${startDate}&endDate=${endDate}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getStandings() {
  const res = await fetch(`${API}/standings?leagueId=103,104&season=2026&standingsTypes=regularSeason`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

/* ── 팀 목록 렌더 ── */
function renderTeams() {
  let html = '';
  for (const league of LEAGUES) {
    html += `<div class="league-block"><div class="league-label">${league.name}</div>`;
    for (const div of league.divisions) {
      html += `<div class="division-block"><div class="division-label">${div.name}</div><div class="team-grid">`;
      for (const t of div.teams) {
        html += `
          <div class="team-card" onclick="loadTeam(${t.id},'${t.abbr}','${t.city}','${t.name}','${div.name}')">
            <img class="team-logo" src="${teamLogoUrl(t.id)}" alt="${t.name}" onerror="this.style.display='none'">
            <div>
              <div class="team-name-small">${t.name}</div>
              <div class="team-city">${t.city}</div>
            </div>
          </div>`;
      }
      html += `</div></div>`;
    }
    html += `</div>`;
  }
  document.getElementById('teams-container').innerHTML = html;
}

/* ── 팀 상세 진입 ── */
async function loadTeam(id, abbr, city, name, divName) {
  document.getElementById('screen-teams').style.display  = 'none';
  document.getElementById('screen-detail').style.display = 'block';
  document.getElementById('back-btn').classList.add('visible');

  document.getElementById('hero-city').textContent = city;
  document.getElementById('hero-name').textContent = name;
  document.getElementById('hero-abbr').textContent = abbr;
  document.getElementById('hero-meta').textContent = `${TEAM_KO[abbr] || ''} · ${divName}`;

  ['d-wins','d-losses','d-pct','d-rank','d-gb'].forEach(i => {
    document.getElementById(i).textContent = '…';
  });

  document.getElementById('tab-results').innerHTML   = loadingHtml('경기 결과 로딩 중');
  document.getElementById('tab-schedule').innerHTML  = loadingHtml('일정 로딩 중');
  document.getElementById('tab-standings').innerHTML = loadingHtml('순위 로딩 중');

  switchTab('results');

  await Promise.all([
    loadResults(id),
    loadSchedule(id),
    loadStandings(id, divName),
  ]);
}

/* ── 최근 경기 결과 ── */
async function loadResults(teamId) {
  const panel = document.getElementById('tab-results');
  try {
    // 2026 시즌 개막일(KST 3월 26일, UTC 3월 25일)부터 오늘까지
    const year = currentYear();
    const seasonStart = `${year}-03-25`;
    const data  = await getSchedule(teamId, seasonStart, today());
    const games = [];
    for (const d of (data.dates || []).reverse())
      for (const g of d.games)
        if (g.status?.abstractGameState === 'Final') games.push(g);

    const recent = games.slice(0, 20);
    if (!recent.length) { panel.innerHTML = '<div class="empty">최근 경기 결과가 없습니다</div>'; return; }

    let wins = 0, losses = 0, html = '<div class="game-list">';

    for (const g of recent) {
      const isHome  = g.teams.home.team.id === teamId;
      const my      = isHome ? g.teams.home : g.teams.away;
      const opp     = isHome ? g.teams.away : g.teams.home;
      const mySc    = my.score  ?? 0;
      const oppSc   = opp.score ?? 0;
      const win     = mySc > oppSc;
      const oppAbbr = getTeamAbbr(opp.team);
      const oppId   = opp.team.id;
      if (win) wins++; else losses++;

      html += `
        <div class="game-row">
          <div class="g-date">${fmtDate(g.gameDate)}</div>
          <div class="g-loc">${isHome ? 'vs' : '@'}</div>
          <img class="g-opp-logo" src="${teamLogoUrl(oppId)}" alt="${oppAbbr}">
          <div class="g-opp">
            <div class="g-opp-abbr">${oppAbbr}</div>
            <div class="g-opp-ko">${TEAM_KO[oppAbbr] || oppAbbr}</div>
          </div>
          <div class="g-score">
            <span class="${win ? 'sc-win' : 'sc-loss'}">${mySc}</span>
            <span class="sc-sep"> - </span>
            <span class="sc-opp">${oppSc}</span>
          </div>
          <div class="g-wl wl-${win ? 'W' : 'L'}">${win ? 'W' : 'L'}</div>
        </div>`;
    }

    html += '</div>';
    panel.innerHTML = html;

    const total = wins + losses;
    document.getElementById('d-wins').textContent   = wins;
    document.getElementById('d-losses').textContent = losses;
    document.getElementById('d-pct').textContent    = total > 0
      ? (wins / total).toFixed(3).replace('0.', '.') : '.000';

  } catch (e) {
    panel.innerHTML = `<div class="empty">로딩 실패 · ${e.message}</div>`;
  }
}

/* ── 앞으로 일정 ── */
async function loadSchedule(teamId) {
  const panel = document.getElementById('tab-schedule');
  try {
    const data  = await getSchedule(teamId, today(), offset(30));
    const games = [];
    for (const d of data.dates || [])
      for (const g of d.games)
        if (['Scheduled','Pre-Game','Warmup'].some(s => (g.status?.detailedState || '').includes(s)))
          games.push(g);

    if (!games.length) { panel.innerHTML = '<div class="empty">예정된 경기가 없습니다</div>'; return; }

    let html = '<div class="game-list">';
    for (const g of games.slice(0, 20)) {
      const isHome  = g.teams.home.team.id === teamId;
      const opp     = isHome ? g.teams.away.team : g.teams.home.team;
      const oppAbbr = getTeamAbbr(opp);
      const oppId   = opp.id;

      html += `
        <div class="game-row">
          <div class="g-date">${fmtDate(g.gameDate)}</div>
          <div class="g-loc">${isHome ? 'vs' : '@'}</div>
          <img class="g-opp-logo" src="${teamLogoUrl(oppId)}" alt="${oppAbbr}">
          <div class="g-opp">
            <div class="g-opp-abbr">${oppAbbr}</div>
            <div class="g-opp-ko">${TEAM_KO[oppAbbr] || oppAbbr} · ${fmtTime(g.gameDate)} KST</div>
          </div>
          <div class="g-tag">${isHome ? '홈' : '원정'}</div>
        </div>`;
    }
    html += '</div>';
    panel.innerHTML = html;

  } catch (e) {
    panel.innerHTML = `<div class="empty">로딩 실패 · ${e.message}</div>`;
  }
}

/* ── 지구 순위 ── */
async function loadStandings(teamId, divName) {
  const panel = document.getElementById('tab-standings');
  try {
    const data = await getStandings();

    let myDiv = null;
    for (const rec of data.records || []) {
      for (const tr of rec.teamRecords || [])
        if (tr.team.id === teamId) { myDiv = rec; break; }
      if (myDiv) break;
    }

    if (!myDiv) { panel.innerHTML = '<div class="empty">순위 데이터를 불러올 수 없습니다</div>'; return; }

    const dName = myDiv.division?.nameShort || myDiv.division?.name || divName;

    for (const tr of myDiv.teamRecords || []) {
      if (tr.team.id === teamId) {
        document.getElementById('d-rank').textContent = tr.divisionRank + '위';
        document.getElementById('d-gb').textContent   = tr.gamesBack === '-' ? '—' : tr.gamesBack;
        break;
      }
    }

    let html = `
      <div class="standings-wrap">
        <div class="std-division">${dName}</div>
        <table class="std">
          <thead><tr><th>#</th><th>팀</th><th>승</th><th>패</th><th>승률</th><th>GB</th></tr></thead>
          <tbody>`;

    for (const tr of myDiv.teamRecords || []) {
      const isMe = tr.team.id === teamId;
      const teamInfo = TEAM_ID_TO_INFO[tr.team.id] || {};
      const abbr = teamInfo.abbr || tr.team.abbreviation || '';
      const teamName = teamInfo.name || tr.team.teamName || tr.team.name || '';
      const gb   = tr.gamesBack === '-' ? '—' : tr.gamesBack;
      html += `
        <tr class="${isMe ? 'me' : ''}">
          <td>${tr.divisionRank}</td>
          <td class="std-team-cell">
            <img class="std-team-logo" src="${teamLogoUrl(tr.team.id)}" alt="${abbr}">
            <div>
              ${isMe ? '▶ ' : ''}${teamName}
              <span class="std-team-ko">${TEAM_KO[abbr] || ''}</span>
            </div>
          </td>
          <td>${tr.wins}</td>
          <td>${tr.losses}</td>
          <td>${tr.winningPercentage}</td>
          <td>${gb}</td>
        </tr>`;
    }

    html += '</tbody></table></div>';
    panel.innerHTML = html;

  } catch (e) {
    panel.innerHTML = `<div class="empty">로딩 실패 · ${e.message}</div>`;
  }
}

/* ── 탭 전환 ── */
function switchTab(name) {
  const names = ['results', 'schedule', 'standings'];
  document.querySelectorAll('.tab-btn').forEach((btn, i) =>
    btn.classList.toggle('active', names[i] === name));
  document.querySelectorAll('.tab-panel').forEach(p =>
    p.classList.remove('active'));
  document.getElementById('tab-' + name).classList.add('active');
}

/* ── 팀 목록으로 돌아가기 ── */
function showTeams() {
  document.getElementById('screen-detail').style.display = 'none';
  document.getElementById('screen-teams').style.display  = 'block';
  document.getElementById('back-btn').classList.remove('visible');
}

/* ── 초기화 ── */
renderTeams();
