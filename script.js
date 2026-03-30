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

/* ── 선수 이름 한글 매핑 ── */
const PLAYER_KO = {
  // LAD 다저스
  'Tyler Glasnow': '타일러 글래스나우',
  'Yoshinobu Yamamoto': '야마모토 요시노부',
  'Clayton Kershaw': '클레이튼 커쇼',
  'Walker Buehler': '워커 뷸러',
  'Tony Gonsolin': '토니 곤솔린',
  'Bobby Miller': '바비 밀러',
  'Shohei Ohtani': '오타니 쇼헤이',
  'Mookie Betts': '무키 베츠',
  'Freddie Freeman': '프레디 프리먼',
  // AZ 다이아몬드백스
  'Zac Gallen': '잭 갤런',
  'Merrill Kelly': '메릴 켈리',
  'Brandon Pfaadt': '브랜든 파트',
  'Eduardo Rodriguez': '에두아르도 로드리게스',
  'Ryne Nelson': '라인 넬슨',
  // SD 파드리스
  'Dylan Cease': '딜런 시즈',
  'Yu Darvish': '다르빗슈 유',
  'Joe Musgrove': '조 머스그로브',
  'Michael King': '마이클 킹',
  'Matt Waldron': '맷 월드론',
  // SF 자이언츠
  'Logan Webb': '로건 웹',
  'Blake Snell': '블레이크 스넬',
  'Jordan Hicks': '조던 힉스',
  'Robbie Ray': '로비 레이',
  'Kyle Harrison': '카일 해리슨',
  // COL 로키스
  'Kyle Freeland': '카일 프릴랜드',
  'Austin Gomber': '오스틴 곰버',
  'German Marquez': '헤르만 마르케스',
  'Cal Quantrill': '캘 퀀트릴',
  // NYY 양키스
  'Gerrit Cole': '게릿 콜',
  'Carlos Rodon': '카를로스 로돈',
  'Luis Gil': '루이스 길',
  'Marcus Stroman': '마커스 스트로먼',
  'Clarke Schmidt': '클라크 슈미트',
  'Nestor Cortes': '네스토르 코르테스',
  // BOS 레드삭스
  'Brayan Bello': '브라이언 베요',
  'Tanner Houck': '태너 하우크',
  'Kutter Crawford': '커터 크로퍼드',
  'Nick Pivetta': '닉 피베타',
  'Cooper Criswell': '쿠퍼 크리스웰',
  // TOR 블루제이스
  'Kevin Gausman': '케빈 고스먼',
  'Jose Berrios': '호세 베리오스',
  'Chris Bassitt': '크리스 바싯',
  'Yusei Kikuchi': '기쿠치 유세이',
  'Bowden Francis': '보든 프란시스',
  // TB 레이스
  'Zach Eflin': '잭 에플린',
  'Shane McClanahan': '셰인 매클라나한',
  'Ryan Pepiot': '라이언 페피엇',
  'Jeffrey Springs': '제프리 스프링스',
  'Taj Bradley': '타지 브래들리',
  // BAL 오리올스
  'Corbin Burnes': '코빈 번스',
  'Grayson Rodriguez': '그레이슨 로드리게스',
  'Kyle Bradish': '카일 브래디시',
  'Dean Kremer': '딘 크레머',
  'Albert Suarez': '알버트 수아레스',
  // CLE 가디언스
  'Tanner Bibee': '태너 비비',
  'Logan Allen': '로건 알렌',
  'Gavin Williams': '개빈 윌리엄스',
  'Ben Lively': '벤 라이블리',
  'Carlos Carrasco': '카를로스 카라스코',
  // DET 타이거스
  'Tarik Skubal': '타릭 스쿠발',
  'Jack Flaherty': '잭 플래허티',
  'Reese Olson': '리스 올슨',
  'Casey Mize': '케이시 마이즈',
  'Keider Montero': '케이더 몬테로',
  // KC 로열스
  'Seth Lugo': '세스 루고',
  'Cole Ragans': '콜 래건스',
  'Brady Singer': '브래디 싱어',
  'Michael Wacha': '마이클 와카',
  'Alec Marsh': '알렉 마쉬',
  // MIN 트윈스
  'Pablo Lopez': '파블로 로페스',
  'Joe Ryan': '조 라이언',
  'Bailey Ober': '베일리 오버',
  'Chris Paddack': '크리스 패닥',
  'Simeon Woods Richardson': '시메온 우즈 리처드슨',
  // CWS 화이트삭스
  'Garrett Crochet': '개릿 크로셰',
  'Erick Fedde': '에릭 페디',
  'Chris Flexen': '크리스 플렉슨',
  'Nick Nastrini': '닉 나스트리니',
  // HOU 애스트로스
  'Framber Valdez': '프램버 발데즈',
  'Hunter Brown': '헌터 브라운',
  'Ronel Blanco': '로넬 블랑코',
  'Spencer Arrighetti': '스펜서 아리게티',
  'Justin Verlander': '저스틴 벌랜더',
  // LAA 에인절스
  'Tyler Anderson': '타일러 앤더슨',
  'Patrick Sandoval': '패트릭 샌도발',
  'Reid Detmers': '리드 뎃머스',
  'Griffin Canning': '그리핀 캐닝',
  'Jose Soriano': '호세 소리아노',
  // OAK 애슬레틱스
  'Paul Blackburn': '폴 블랙번',
  'JP Sears': 'JP 시어스',
  'Ross Stripling': '로스 스트립링',
  'Mitch Spence': '미치 스펜스',
  'Joey Estes': '조이 에스테스',
  // SEA 마리너스
  'Luis Castillo': '루이스 카스티요',
  'George Kirby': '조지 커비',
  'Logan Gilbert': '로건 길버트',
  'Bryce Miller': '브라이스 밀러',
  'Bryan Woo': '브라이언 우',
  // TEX 레인저스
  'Jacob deGrom': '제이콥 디그롬',
  'Nathan Eovaldi': '네이선 이오발디',
  'Max Scherzer': '맥스 슈어저',
  'Jon Gray': '존 그레이',
  'Andrew Heaney': '앤드류 히니',
  'Kumar Rocker': '쿠마르 로커',
  // ATL 브레이브스
  'Spencer Strider': '스펜서 스트라이더',
  'Max Fried': '맥스 프리드',
  'Chris Sale': '크리스 세일',
  'Charlie Morton': '찰리 모튼',
  'Reynaldo Lopez': '레이날도 로페스',
  // MIA 말린스
  'Sandy Alcantara': '샌디 알칸타라',
  'Jesus Luzardo': '헤수스 루자르도',
  'Braxton Garrett': '브랙스턴 개릿',
  'Edward Cabrera': '에드워드 카브레라',
  'Ryan Weathers': '라이언 웨더스',
  // NYM 메츠
  'Kodai Senga': '센가 코다이',
  'Sean Manaea': '션 마네아',
  'Luis Severino': '루이스 세베리노',
  'Jose Quintana': '호세 킨타나',
  'David Peterson': '데이비드 피터슨',
  'Frankie Montas': '프랭키 몬타스',
  // PHI 필리스
  'Zack Wheeler': '잭 휠러',
  'Aaron Nola': '애런 놀라',
  'Ranger Suarez': '레인저 수아레스',
  'Cristopher Sanchez': '크리스토퍼 산체스',
  'Taijuan Walker': '타이후안 워커',
  // WSH 내셔널스
  'MacKenzie Gore': '맥켄지 고어',
  'Patrick Corbin': '패트릭 코빈',
  'Jake Irvin': '제이크 어빈',
  'Mitchell Parker': '미첼 파커',
  'Trevor Williams': '트레버 윌리엄스',
  // CHC 컵스
  'Justin Steele': '저스틴 스틸',
  'Shota Imanaga': '이마나가 쇼타',
  'Jameson Taillon': '제임슨 타이용',
  'Javier Assad': '하비에르 아사드',
  'Kyle Hendricks': '카일 헨드릭스',
  // CIN 레즈
  'Hunter Greene': '헌터 그린',
  'Nick Lodolo': '닉 로돌로',
  'Graham Ashcraft': '그레이엄 애시크래프트',
  'Andrew Abbott': '앤드류 애봇',
  'Frankie Montas': '프랭키 몬타스',
  // MIL 브루어스
  'Corbin Burnes': '코빈 번스',
  'Freddy Peralta': '프레디 페랄타',
  'Colin Rea': '콜린 레아',
  'Wade Miley': '웨이드 마일리',
  'Tobias Myers': '토비아스 마이어스',
  // PIT 파이럿츠
  'Mitch Keller': '미치 켈러',
  'Bailey Falter': '베일리 폴터',
  'Jared Jones': '자레드 존스',
  'Marco Gonzales': '마르코 곤잘레스',
  'Martin Perez': '마틴 페레스',
  'Paul Skenes': '폴 스킨스',
  // STL 카디널스
  'Sonny Gray': '소니 그레이',
  'Kyle Gibson': '카일 깁슨',
  'Miles Mikolas': '마일즈 마이콜라스',
  'Steven Matz': '스티븐 매츠',
  'Lance Lynn': '랜스 린',
  // 추가 선수들
  'Emmet Sheehan': '에밋 시핸',
};

/* ── 영어 이름 한글 발음 변환 ── */
const nameToKorean = (name) => {
  if (!name) return '';

  // 자주 쓰이는 이름 발음 매핑
  const firstNames = {
    'Aaron': '애런', 'Adam': '아담', 'Adrian': '에이드리언', 'Albert': '알버트', 'Alec': '알렉',
    'Alex': '알렉스', 'Andrew': '앤드류', 'Anthony': '앤서니', 'Austin': '오스틴',
    'Bailey': '베일리', 'Ben': '벤', 'Blake': '블레이크', 'Bobby': '바비', 'Bowden': '보든',
    'Brad': '브래드', 'Brady': '브래디', 'Brandon': '브랜든', 'Brayan': '브라이언', 'Braxton': '브랙스턴',
    'Brent': '브렌트', 'Brett': '브렛', 'Brian': '브라이언', 'Bruce': '브루스', 'Bryan': '브라이언', 'Bryce': '브라이스',
    'Cal': '캘', 'Caleb': '케일럽', 'Cameron': '캐머런', 'Carl': '칼', 'Carlos': '카를로스', 'Carmen': '카르멘',
    'Casey': '케이시', 'Chad': '채드', 'Charlie': '찰리', 'Chase': '체이스', 'Chris': '크리스', 'Christian': '크리스천',
    'Christopher': '크리스토퍼', 'Clarke': '클라크', 'Clay': '클레이', 'Clayton': '클레이튼', 'Cody': '코디',
    'Cole': '콜', 'Colin': '콜린', 'Connor': '코너', 'Cooper': '쿠퍼', 'Corbin': '코빈', 'Corey': '코리',
    'Craig': '크레이그', 'Cristopher': '크리스토퍼',
    'Dallas': '댈러스', 'Dan': '댄', 'Daniel': '대니얼', 'Danny': '대니', 'Daulton': '돌턴', 'David': '데이비드',
    'Dean': '딘', 'Dennis': '데니스', 'Derek': '데릭', 'Devin': '데빈', 'Diego': '디에고', 'Dominic': '도미닉',
    'Drew': '드류', 'Dylan': '딜런',
    'Eduardo': '에두아르도', 'Edward': '에드워드', 'Edwin': '에드윈', 'Eli': '엘라이', 'Elias': '엘리아스',
    'Emmet': '에밋', 'Eric': '에릭', 'Erick': '에릭', 'Evan': '에반',
    'Felix': '펠릭스', 'Fernando': '페르난도', 'Framber': '프램버', 'Frank': '프랭크', 'Frankie': '프랭키', 'Freddie': '프레디', 'Freddy': '프레디',
    'Garrett': '개릿', 'Gary': '게리', 'Gavin': '개빈', 'George': '조지', 'Gerrit': '게릿', 'German': '헤르만',
    'Graham': '그레이엄', 'Grant': '그랜트', 'Grayson': '그레이슨', 'Greg': '그렉', 'Griffin': '그리핀',
    'Hector': '헥터', 'Henry': '헨리', 'Hunter': '헌터',
    'Ian': '이안', 'Isaac': '아이작',
    'Jack': '잭', 'Jackson': '잭슨', 'Jacob': '제이콥', 'Jake': '제이크', 'James': '제임스', 'Jameson': '제임슨',
    'Jared': '자레드', 'Jason': '제이슨', 'Javier': '하비에르', 'Jeff': '제프', 'Jeffrey': '제프리', 'Jeremy': '제레미',
    'Jesse': '제시', 'Jesus': '헤수스', 'Joe': '조', 'Joel': '조엘', 'Joey': '조이', 'John': '존', 'Jon': '존',
    'Jonathan': '조나단', 'Jordan': '조던', 'Jorge': '호르헤', 'Jose': '호세', 'Josh': '조시', 'Joshua': '조슈아',
    'JP': 'JP', 'Juan': '후안', 'Julian': '줄리안', 'Justin': '저스틴',
    'Keider': '케이더', 'Keith': '키스', 'Ken': '켄', 'Kevin': '케빈', 'Kodai': '코다이', 'Kumar': '쿠마르', 'Kurt': '커트', 'Kutter': '커터', 'Kyle': '카일',
    'Lance': '랜스', 'Logan': '로건', 'Louis': '루이스', 'Lucas': '루카스', 'Luis': '루이스', 'Luke': '루크',
    'MacKenzie': '맥켄지', 'Manuel': '마누엘', 'Marco': '마르코', 'Marcus': '마커스', 'Mark': '마크', 'Martin': '마틴',
    'Mason': '메이슨', 'Matt': '맷', 'Matthew': '매튜', 'Max': '맥스', 'Merrill': '메릴', 'Michael': '마이클',
    'Miguel': '미겔', 'Mike': '마이크', 'Miles': '마일즈', 'Mitch': '미치', 'Mitchell': '미첼', 'Mookie': '무키',
    'Nathan': '네이선', 'Nestor': '네스토르', 'Nick': '닉', 'Noah': '노아', 'Nolan': '놀란',
    'Omar': '오마르', 'Oscar': '오스카',
    'Pablo': '파블로', 'Patrick': '패트릭', 'Paul': '폴', 'Pedro': '페드로', 'Pete': '피트', 'Peter': '피터', 'Phil': '필',
    'Rafael': '라파엘', 'Randy': '랜디', 'Ranger': '레인저', 'Ray': '레이', 'Reese': '리스', 'Reid': '리드',
    'Reynaldo': '레이날도', 'Rich': '리치', 'Ricky': '리키', 'Robbie': '로비', 'Robert': '로버트', 'Roberto': '로베르토',
    'Ronel': '로넬', 'Ross': '로스', 'Ryan': '라이언', 'Ryne': '라인',
    'Salvador': '살바도르', 'Sam': '샘', 'Sandy': '샌디', 'Scott': '스콧', 'Sean': '션', 'Seth': '세스', 'Shane': '셰인',
    'Shohei': '쇼헤이', 'Shota': '쇼타', 'Simeon': '시메온', 'Sonny': '소니', 'Spencer': '스펜서', 'Stephen': '스티븐', 'Steven': '스티븐',
    'Taj': '타지', 'Taijuan': '타이후안', 'Tanner': '태너', 'Tarik': '타릭', 'Taylor': '테일러', 'Thomas': '토머스',
    'Tim': '팀', 'Tobias': '토비아스', 'Todd': '토드', 'Tommy': '토미', 'Tony': '토니', 'Travis': '트래비스', 'Trevor': '트레버', 'Tyler': '타일러',
    'Victor': '빅터', 'Vince': '빈스', 'Vincent': '빈센트',
    'Wade': '웨이드', 'Walker': '워커', 'Will': '윌', 'William': '윌리엄',
    'Yoshinobu': '요시노부', 'Yu': '유', 'Yusei': '유세이',
    'Zac': '잭', 'Zach': '잭', 'Zack': '잭',
  };

  const lastNames = {
    'Abbott': '애봇', 'Alcantara': '알칸타라', 'Allen': '알렌', 'Anderson': '앤더슨', 'Arrighetti': '아리게티', 'Ashcraft': '애시크래프트', 'Assad': '아사드',
    'Bassitt': '바싯', 'Bello': '베요', 'Berrios': '베리오스', 'Bibee': '비비', 'Blackburn': '블랙번', 'Blanco': '블랑코', 'Bradley': '브래들리', 'Bradish': '브래디시',
    'Brown': '브라운', 'Buehler': '뷸러', 'Burnes': '번스',
    'Cabrera': '카브레라', 'Canning': '캐닝', 'Carrasco': '카라스코', 'Castillo': '카스티요', 'Cease': '시즈', 'Cole': '콜', 'Corbin': '코빈', 'Cortes': '코르테스',
    'Crawford': '크로퍼드', 'Criswell': '크리스웰', 'Crochet': '크로셰',
    'Darvish': '다르빗슈', 'Detmers': '뎃머스', 'deGrom': '디그롬',
    'Eflin': '에플린', 'Eovaldi': '이오발디', 'Estes': '에스테스',
    'Falter': '폴터', 'Fedde': '페디', 'Flaherty': '플래허티', 'Flexen': '플렉슨', 'Francis': '프란시스', 'Freeland': '프릴랜드', 'Freeman': '프리먼', 'Fried': '프리드',
    'Gallen': '갤런', 'Garrett': '개릿', 'Gausman': '고스먼', 'Gibson': '깁슨', 'Gil': '길', 'Gilbert': '길버트', 'Glasnow': '글래스나우', 'Gomber': '곰버',
    'Gonsolin': '곤솔린', 'Gonzales': '곤잘레스', 'Gore': '고어', 'Gray': '그레이', 'Greene': '그린',
    'Harrison': '해리슨', 'Heaney': '히니', 'Hendricks': '헨드릭스', 'Hicks': '힉스', 'Houck': '하우크',
    'Imanaga': '이마나가', 'Irvin': '어빈',
    'Jones': '존스',
    'Keller': '켈러', 'Kelly': '켈리', 'Kershaw': '커쇼', 'Kikuchi': '기쿠치', 'King': '킹', 'Kirby': '커비', 'Kremer': '크레머',
    'Lively': '라이블리', 'Lodolo': '로돌로', 'Lopez': '로페스', 'Lugo': '루고', 'Luzardo': '루자르도', 'Lynn': '린',
    'Manaea': '마네아', 'Marquez': '마르케스', 'Marsh': '마쉬', 'Matz': '매츠', 'McClanahan': '매클라나한', 'McLean': '맥클린',
    'Mikolas': '마이콜라스', 'Miley': '마일리', 'Miller': '밀러', 'Mize': '마이즈', 'Mlodzinski': '믈로진스키', 'Montas': '몬타스', 'Montero': '몬테로',
    'Morton': '모튼', 'Musgrove': '머스그로브', 'Myers': '마이어스',
    'Nastrini': '나스트리니', 'Nelson': '넬슨', 'Nola': '놀라',
    'Ober': '오버', 'Olson': '올슨', 'Ohtani': '오타니',
    'Paddack': '패닥', 'Parker': '파커', 'Pepiot': '페피엇', 'Peralta': '페랄타', 'Perez': '페레스', 'Peterson': '피터슨', 'Pfaadt': '파트', 'Pivetta': '피베타',
    'Quantrill': '퀀트릴', 'Quintana': '킨타나',
    'Ragans': '래건스', 'Ray': '레이', 'Rea': '레아', 'Richardson': '리처드슨', 'Rocker': '로커', 'Rodon': '로돈', 'Rodriguez': '로드리게스', 'Ryan': '라이언',
    'Sale': '세일', 'Sanchez': '산체스', 'Sandoval': '샌도발', 'Scherzer': '슈어저', 'Schmidt': '슈미트', 'Sears': '시어스', 'Senga': '센가',
    'Severino': '세베리노', 'Sheehan': '시핸', 'Singer': '싱어', 'Skenes': '스킨스', 'Skubal': '스쿠발', 'Snell': '스넬', 'Soriano': '소리아노',
    'Spence': '스펜스', 'Springs': '스프링스', 'Steele': '스틸', 'Strider': '스트라이더', 'Stripling': '스트립링', 'Stroman': '스트로먼', 'Suarez': '수아레스',
    'Taillon': '타이용',
    'Valdez': '발데즈', 'Verlander': '벌랜더',
    'Wacha': '와카', 'Waldron': '월드론', 'Walker': '워커', 'Weathers': '웨더스', 'Webb': '웹', 'Wheeler': '휠러', 'Williams': '윌리엄스', 'Woo': '우', 'Woods': '우즈',
    'Yamamoto': '야마모토',
  };

  // 매핑에 있으면 그대로 반환
  if (PLAYER_KO[name]) return PLAYER_KO[name];

  // 이름을 분리해서 변환 시도
  const parts = name.split(' ');
  if (parts.length >= 2) {
    const firstName = parts[0];
    const lastName = parts.slice(1).join(' ');

    const koFirst = firstNames[firstName] || firstName;
    const koLast = lastNames[lastName] || lastNames[parts[parts.length - 1]] || lastName;

    return `${koFirst} ${koLast}`;
  }

  return name;
};

/* ── 선수 이름 한글 변환 ── */
const getPlayerKo = (name) => nameToKorean(name);

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
  const res = await fetch(`${API}/schedule?sportId=1&teamId=${teamId}&startDate=${startDate}&endDate=${endDate}&hydrate=probablePitcher,venue`);
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
  let html = '<div class="leagues-container">';
  for (const league of LEAGUES) {
    html += `<div class="league-block"><div class="league-label">${league.name}</div>`;
    for (const div of league.divisions) {
      html += `<div class="division-block"><div class="division-label">${div.name}</div><div class="team-grid">`;
      for (const t of div.teams) {
        html += `
          <div class="team-card" onclick="loadTeam(${t.id},'${t.abbr}','${t.city}','${t.name}','${div.name}')">
            <img class="team-logo" src="${teamLogoUrl(t.id)}" alt="${t.name}" onerror="this.style.display='none'">
            <div class="team-info">
              <div class="team-name-small">${t.name}</div>
              <div class="team-city">${t.city}</div>
            </div>
          </div>`;
      }
      html += `</div></div>`;
    }
    html += `</div>`;
  }
  html += '</div>';
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

      // 구장 정보
      const venue = g.venue?.name || '';

      // 선발투수 정보 (한글 이름으로 변환)
      const myPitcherName  = my.probablePitcher?.fullName || '';
      const oppPitcherName = opp.probablePitcher?.fullName || '';
      const myPitcher  = myPitcherName ? getPlayerKo(myPitcherName) : '—';
      const oppPitcher = oppPitcherName ? getPlayerKo(oppPitcherName) : '—';

      html += `
        <div class="game-row">
          <div class="g-date">${fmtDate(g.gameDate)}</div>
          <div class="g-loc">${isHome ? 'vs' : '@'}</div>
          <img class="g-opp-logo" src="${teamLogoUrl(oppId)}" alt="${oppAbbr}">
          <div class="g-opp">
            <div class="g-opp-abbr">${oppAbbr}</div>
            <div class="g-opp-ko">${TEAM_KO[oppAbbr] || oppAbbr}</div>
          </div>
          <div class="g-venue">${venue}</div>
          <div class="g-pitchers">
            <span class="pitcher-label">선발</span>
            <span class="pitcher-vs">${myPitcher} vs ${oppPitcher}</span>
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
