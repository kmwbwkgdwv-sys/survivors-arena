/* =========================================================
 *  game/gameArt.js  ― バトル用のイラスト（敵・ボス・スキルの小物）
 *  すべて SVG 文字列。バトル画面ではこれを画像に変換して高速に描画します。
 * ========================================================= */
(function () {
  const O = '#231a3a';
  let seq = 0;
  const uid = () => 'b' + (++seq).toString(36);
  const lg = (id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) =>
    `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const svg = (vb, body) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}">${body}</svg>`;
  const G = (body, sw = 3) => `<g stroke="${O}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">${body}</g>`;

  /* ---------------------------------------------------------
   *  雑魚敵（viewBox 0 0 100 100、右向き。中心 (50,58) が当たり判定の中心）
   * --------------------------------------------------------- */
  function wolfArt(c, extra = '') {
    return `<ellipse cx="50" cy="90" rx="36" ry="5" fill="#000" opacity=".22"/>
      ${G(`<path d="M24 58 Q8 52 5 33 Q16 42 28 48 Z" fill="${c.mid}"/>
        <rect x="25" y="66" width="9" height="20" rx="4" fill="${c.dark}"/>
        <rect x="39" y="68" width="9" height="18" rx="4" fill="${c.mid}"/>
        <rect x="57" y="68" width="9" height="18" rx="4" fill="${c.dark}"/>
        <rect x="69" y="66" width="9" height="20" rx="4" fill="${c.mid}"/>
        <ellipse cx="50" cy="60" rx="31" ry="16" fill="${c.body}"/>
        <path d="M62 50 L70 25 L80 40 Z" fill="${c.mid}"/>
        <circle cx="77" cy="50" r="15" fill="${c.head}"/>
        <path d="M82 29 L90 44 L79 42 Z" fill="${c.head}"/>
        <path d="M86 49 L98 55 Q98 62 87 62 Z" fill="${c.head}"/>
        <circle cx="97" cy="55" r="2.6" fill="${O}"/>`)}
      ${extra}
      <path d="M30 67 Q50 75 68 67" fill="none" stroke="${c.belly}" stroke-width="3" stroke-linecap="round"/>
      <path d="M74 44 L86 48" stroke="${O}" stroke-width="3" stroke-linecap="round"/>
      <ellipse cx="81" cy="51" rx="3.4" ry="2.8" fill="${c.eye}" stroke="${O}" stroke-width="1.2"/>
      <circle cx="82" cy="51" r="1.4" fill="${O}"/>
      <path d="M88 61 L90 66 L92 61" fill="#fff" stroke="${O}" stroke-width="1.2"/>`;
  }
  const ENEMY = {
    wolf() { return wolfArt({ dark: '#5f6787', mid: '#7d86a6', body: '#8d97b5', head: '#9aa4c2', belly: '#c9d0e6', eye: '#ffd34d' }); },
    // ステージ2：燃えている炎狼
    fireWolf() {
      return wolfArt({ dark: '#a8321f', mid: '#d24a2a', body: '#ef6a3a', head: '#f7834a', belly: '#ffd27a', eye: '#fff3a0' },
        `<path d="M30 48 Q26 30 36 22 Q36 34 42 36 Q42 20 54 12 Q52 28 58 34 Q62 24 70 22 Q64 34 66 46 Z" fill="#ffb13d" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>
         <path d="M38 46 Q38 36 44 32 Q46 40 50 40 Q52 30 58 26 Q56 38 60 46 Z" fill="#fff07a"/>
         <path d="M10 32 Q2 20 8 10 Q10 20 16 22 Q14 12 22 6 Q22 20 26 30 Z" fill="#ffb13d" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"/>
         <path d="M13 30 Q10 22 14 16 Q16 24 20 26 Z" fill="#fff07a"/>`);
    },
    // ステージ3：凍っている氷狼
    iceWolf() {
      return wolfArt({ dark: '#6f9fc8', mid: '#8ec5ef', body: '#bfe6ff', head: '#d8f1ff', belly: '#ffffff', eye: '#4fe0ff' },
        `<g fill="#f4fdff" stroke="${O}" stroke-width="2.2" stroke-linejoin="round">
           <path d="M32 47 L36 30 L42 46 Z"/><path d="M42 45 L48 24 L54 45 Z"/><path d="M54 46 L60 30 L64 47 Z"/>
           <path d="M8 40 L2 26 L14 34 Z"/><path d="M14 44 L10 30 L20 40 Z"/>
         </g>
         <path d="M48 28 L48 40 M36 34 L38 42 M60 34 L60 42" stroke="#8fe3ff" stroke-width="1.6"/>
         <circle cx="24" cy="78" r="2" fill="#fff"/><circle cx="72" cy="80" r="1.6" fill="#fff"/>`);
    },
    zombie() {
      return `<ellipse cx="50" cy="92" rx="24" ry="5" fill="#000" opacity=".22"/>
      ${G(`<rect x="37" y="72" width="10" height="17" rx="4" fill="#4b4f70"/>
        <rect x="53" y="72" width="10" height="17" rx="4" fill="#4b4f70"/>
        <path d="M33 50 Q50 44 67 50 L68 78 L60 74 L54 79 L47 74 L40 79 L32 76 Z" fill="#5a7bd6"/>
        <rect x="58" y="51" width="32" height="9" rx="4.5" fill="#8fd67f"/>
        <rect x="55" y="63" width="29" height="9" rx="4.5" fill="#8fd67f"/>
        <circle cx="50" cy="31" r="21" fill="#8fd67f"/>
        <path d="M36 16 Q44 8 54 12 Q50 16 44 17 Z" fill="#4e8a43"/>`)}
      <circle cx="43" cy="31" r="6.4" fill="#fff" stroke="${O}" stroke-width="2"/><circle cx="44" cy="31" r="2.6" fill="${O}"/>
      <circle cx="59" cy="29" r="4.2" fill="#fff" stroke="${O}" stroke-width="2"/><circle cx="60" cy="29" r="1.8" fill="${O}"/>
      <path d="M41 42 L45 39 L49 42 L53 39 L57 42" fill="none" stroke="${O}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M60 18 L66 22 M62 15 L58 21" stroke="${O}" stroke-width="1.6"/>`;
    },
    mageZombie() {
      return `<ellipse cx="50" cy="92" rx="24" ry="5" fill="#000" opacity=".22"/>
      ${G(`<path d="M76 20 L76 88" stroke-width="7"/><path d="M76 20 L76 88" stroke="#8a5a2b" stroke-width="3.6"/>
        <path d="M31 88 Q34 60 38 48 Q50 42 62 48 Q66 60 69 88 Z" fill="#7a4fd0"/>
        <path d="M44 50 L50 88 L56 50" fill="none" stroke="#ffd34d" stroke-width="2.4"/>
        <rect x="58" y="56" width="20" height="9" rx="4.5" fill="#8fd67f"/>
        <circle cx="49" cy="36" r="17" fill="#8fd67f"/>
        <path d="M30 28 Q50 20 70 28 L66 32 Q50 26 34 32 Z" fill="#5b2fa8"/>
        <path d="M36 28 Q42 6 56 2 Q52 10 62 26 Z" fill="#7a4fd0"/>
        <path d="M37 25 Q49 21 61 25" fill="none" stroke="#ffd34d" stroke-width="2.4"/>`)}
      <circle cx="76" cy="16" r="8" fill="#ff7ad9" stroke="${O}" stroke-width="2.6"/>
      <circle cx="74" cy="14" r="2.4" fill="#fff"/>
      <circle cx="43" cy="37" r="4.6" fill="#fff" stroke="${O}" stroke-width="1.8"/><circle cx="44" cy="37" r="2" fill="${O}"/>
      <circle cx="56" cy="36" r="3.4" fill="#fff" stroke="${O}" stroke-width="1.8"/><circle cx="57" cy="36" r="1.5" fill="${O}"/>
      <path d="M44 46 Q50 43 56 46" fill="none" stroke="${O}" stroke-width="2" stroke-linecap="round"/>`;
    },
    armorSkeleton() {
      return `<ellipse cx="50" cy="92" rx="24" ry="5" fill="#000" opacity=".22"/>
      ${G(`<rect x="40" y="72" width="7" height="17" rx="3" fill="#f2efe4"/>
        <rect x="54" y="72" width="7" height="17" rx="3" fill="#f2efe4"/>
        <path d="M34 48 Q50 42 66 48 L64 76 Q50 80 36 76 Z" fill="#8b96aa"/>
        <path d="M38 56 L62 56 M39 64 L61 64" stroke-width="2"/>
        <path d="M80 30 Q96 56 80 82" fill="none" stroke-width="6"/>
        <path d="M80 30 Q96 56 80 82" fill="none" stroke="#a8692c" stroke-width="3"/>
        <path d="M80 30 L80 82" stroke="#e9e3d0" stroke-width="1.4"/>
        <rect x="60" y="52" width="22" height="7" rx="3.5" fill="#f2efe4"/>
        <circle cx="50" cy="31" r="18" fill="#f2efe4"/>
        <path d="M30 32 Q30 10 50 9 Q70 10 70 32 L66 30 Q64 20 50 19 Q36 20 34 30 Z" fill="#6f7a90"/>
        <path d="M33 16 L24 6 L38 12 M67 16 L76 6 L62 12" fill="#e9e3d0" stroke-width="2.2"/>
        <rect x="42" y="42" width="16" height="7" rx="2" fill="#f2efe4" stroke-width="2"/>`)}
      <ellipse cx="43" cy="33" rx="5" ry="5.4" fill="${O}"/><ellipse cx="57" cy="33" rx="5" ry="5.4" fill="${O}"/>
      <circle cx="43" cy="33" r="2.2" fill="#ff4a5e"/><circle cx="57" cy="33" r="2.2" fill="#ff4a5e"/>
      <path d="M46 42 L46 49 M50 42 L50 49 M54 42 L54 49" stroke="${O}" stroke-width="1.3"/>`;
    },
    bigZombie() {
      return `<ellipse cx="50" cy="93" rx="38" ry="6" fill="#000" opacity=".25"/>
      ${G(`<rect x="30" y="74" width="15" height="16" rx="5" fill="#3e4263"/>
        <rect x="55" y="74" width="15" height="16" rx="5" fill="#3e4263"/>
        <ellipse cx="50" cy="58" rx="34" ry="26" fill="#6b9a52"/>
        <path d="M24 66 Q50 92 76 66 L76 74 Q50 96 24 74 Z" fill="#a0523a"/>
        <circle cx="13" cy="62" r="11" fill="#79c06a"/>
        <circle cx="87" cy="62" r="11" fill="#79c06a"/>
        <circle cx="50" cy="26" r="17" fill="#79c06a"/>`, 3.4)}
      <path d="M38 46 Q50 60 64 48 M46 54 L48 58 M54 53 L56 57" fill="none" stroke="${O}" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="38" cy="54" rx="10" ry="6" fill="#fff" opacity=".18"/>
      <circle cx="43" cy="25" r="4.6" fill="#ff4a5e" stroke="${O}" stroke-width="1.8"/>
      <circle cx="57" cy="24" r="3.6" fill="#ff4a5e" stroke="${O}" stroke-width="1.8"/>
      <path d="M38 18 L47 21 M62 17 L54 20" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M42 34 L46 31 L50 34 L54 31 L58 34" fill="none" stroke="${O}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`;
    },
    // ステージ4・5の中ボス：鎧を着たエリートゾンビ（でかいゾンビの2倍の強さ）
    eliteZombie() {
      return `<ellipse cx="50" cy="93" rx="40" ry="6" fill="#000" opacity=".28"/>
      <ellipse cx="50" cy="58" rx="46" ry="40" fill="#ff2a4a" opacity=".16"/>
      ${G(`<rect x="29" y="74" width="16" height="17" rx="4" fill="#2b2f45"/>
        <rect x="55" y="74" width="16" height="17" rx="4" fill="#2b2f45"/>
        <ellipse cx="50" cy="58" rx="35" ry="27" fill="#5b7f6a"/>
        <path d="M22 52 Q50 36 78 52 L76 74 Q50 90 24 74 Z" fill="#4a5068"/>
        <path d="M30 58 L70 58 M32 67 L68 67" stroke-width="2.2"/>
        <path d="M44 48 L50 40 L56 48 L50 56 Z" fill="#ff3b5c" stroke-width="2.2"/>
        <circle cx="12" cy="56" r="13" fill="#6b7790"/>
        <circle cx="88" cy="56" r="13" fill="#6b7790"/>
        <path d="M4 50 L-2 38 L12 46 Z M96 50 L102 38 L88 46 Z M10 44 L8 32 L18 42 Z M90 44 L92 32 L82 42 Z" fill="#d8dde8" stroke-width="2.2"/>
        <circle cx="12" cy="72" r="8" fill="#6f9a7c"/><circle cx="88" cy="72" r="8" fill="#6f9a7c"/>
        <circle cx="50" cy="25" r="18" fill="#6f9a7c"/>
        <path d="M30 24 Q30 4 50 4 Q70 4 70 24 L66 22 Q64 12 50 12 Q36 12 34 22 Z" fill="#4a5068"/>
        <path d="M32 12 L22 -2 L38 8 Z M68 12 L78 -2 L62 8 Z" fill="#d8dde8" stroke-width="2.2"/>`, 3.4)}
      <path d="M38 20 L48 24 M62 20 L52 24" stroke="${O}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="43" cy="27" r="4.4" fill="#ff2a4a" stroke="${O}" stroke-width="1.8"/>
      <circle cx="57" cy="27" r="4.4" fill="#ff2a4a" stroke="${O}" stroke-width="1.8"/>
      <circle cx="42" cy="26" r="1.4" fill="#ffd0d8"/><circle cx="56" cy="26" r="1.4" fill="#ffd0d8"/>
      <path d="M41 35 L45 32 L48 36 L52 32 L55 36 L59 33" fill="none" stroke="${O}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M26 54 Q36 48 46 50" stroke="#fff" stroke-width="2.4" opacity=".3" fill="none" stroke-linecap="round"/>`;
    },
  };

  /* ---------------------------------------------------------
   *  ボス（viewBox 0 0 200 200、中心 (100,110)）
   * --------------------------------------------------------- */
  const BOSS = {
    aurott(u) {
      return `<defs>${lg('t' + u, [[0, '#a8713a'], [1, '#6b4320']], 0, 0, 1, 0)}</defs>
      <ellipse cx="100" cy="186" rx="76" ry="11" fill="#000" opacity=".25"/>
      ${G(`<path d="M62 178 Q40 182 28 192 M138 178 Q160 182 172 192 M90 182 Q86 192 76 198 M112 182 Q116 192 126 198" fill="none" stroke-width="7"/>
        <path d="M62 178 Q40 182 28 192 M138 178 Q160 182 172 192 M90 182 Q86 192 76 198 M112 182 Q116 192 126 198" fill="none" stroke="#7a4a22" stroke-width="3.5"/>
        <path d="M70 116 Q40 108 20 80 M130 116 Q160 108 180 80" fill="none" stroke-width="12"/>
        <path d="M70 116 Q40 108 20 80 M130 116 Q160 108 180 80" fill="none" stroke="#8a5a2b" stroke-width="7"/>
        <path d="M24 86 L10 82 M30 96 L22 104 M176 86 L190 82 M170 96 L178 104" stroke-width="4"/>
        <path d="M62 182 Q56 130 70 92 L130 92 Q144 130 138 182 Z" fill="url(#t${u})"/>
        <path d="M78 104 Q74 140 80 176 M120 104 Q126 140 120 176" fill="none" stroke-width="2" opacity=".5"/>
        <circle cx="100" cy="58" r="50" fill="#2f9e44"/>
        <circle cx="60" cy="80" r="30" fill="#3cb44b"/>
        <circle cx="140" cy="80" r="30" fill="#3cb44b"/>
        <circle cx="100" cy="82" r="32" fill="#3cb44b"/>`)}
      <circle cx="82" cy="40" r="9" fill="#5fd35a"/><circle cx="125" cy="52" r="7" fill="#5fd35a"/>
      <circle cx="70" cy="70" r="5" fill="#ff4a5e" stroke="${O}" stroke-width="2"/><circle cx="132" cy="68" r="5" fill="#ff4a5e" stroke="${O}" stroke-width="2"/>
      <path d="M76 124 L94 132 L78 140 Z M124 124 L106 132 L122 140 Z" fill="#ffd34d" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M80 160 L88 152 L96 160 L104 152 L112 160 L120 152" fill="none" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`;
    },
    orock(u) {
      return `<defs>${lg('s' + u, [[0, '#b8bcc8'], [1, '#6b6f7c']], 0, 0, 1, 1)}</defs>
      <ellipse cx="100" cy="186" rx="80" ry="11" fill="#000" opacity=".25"/>
      ${G(`<circle cx="28" cy="128" r="24" fill="url(#s${u})"/>
        <circle cx="172" cy="128" r="24" fill="url(#s${u})"/>
        <path d="M40 178 Q24 110 52 62 Q76 26 112 30 Q156 36 166 86 Q178 140 160 180 Z" fill="url(#s${u})"/>
        <path d="M70 70 L84 92 L76 110 M140 100 L128 120 L138 140 M96 150 L104 166" fill="none" stroke-width="2.6"/>`, 4)}
      <path d="M58 58 Q80 30 112 34 Q140 36 152 56 Q120 46 98 52 Q74 56 58 58 Z" fill="#5fb15a" stroke="${O}" stroke-width="3"/>
      <path d="M66 96 L94 104 L68 112 Z M134 96 L106 104 L132 112 Z" fill="#ff8a1e" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M78 140 Q100 130 122 140" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="58" cy="176" r="9" fill="#8b8f9c" stroke="${O}" stroke-width="3"/><circle cx="150" cy="180" r="7" fill="#8b8f9c" stroke="${O}" stroke-width="3"/>`;
    },
    frostGolem(u) {
      return `<defs>${lg('i' + u, [[0, '#f0fbff'], [0.5, '#9fd8ff'], [1, '#3f86d6']], 0, 0, 1, 1)}</defs>
      <ellipse cx="100" cy="186" rx="80" ry="11" fill="#000" opacity=".25"/>
      ${G(`<path d="M20 120 L36 84 L56 100 L46 140 Z M180 120 L164 84 L144 100 L154 140 Z" fill="url(#i${u})"/>
        <path d="M50 180 L44 110 L64 60 L100 40 L136 60 L156 110 L150 180 Z" fill="url(#i${u})"/>
        <path d="M64 60 L56 30 L76 52 M136 60 L144 30 L124 52 M100 40 L100 14 L110 38" fill="#e3f7ff"/>
        <path d="M64 60 L100 96 L136 60 M44 110 L100 96 L156 110 M100 96 L100 180" fill="none" stroke-width="2" opacity=".5"/>`, 4)}
      <path d="M70 92 L92 98 L72 106 Z M130 92 L108 98 L128 106 Z" fill="#fff" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M84 132 L92 126 L100 132 L108 126 L116 132" fill="none" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>`;
    },
    ifrit(u) {
      return `<defs>${lg('f' + u, [[0, '#ffe066'], [0.5, '#ff8a1e'], [1, '#d6264a']])}</defs>
      <ellipse cx="100" cy="186" rx="76" ry="11" fill="#000" opacity=".25"/>
      ${G(`<path d="M28 120 Q20 90 40 70 Q42 92 56 100 Z M172 120 Q180 90 160 70 Q158 92 144 100 Z" fill="url(#f${u})"/>
        <path d="M54 182 Q40 130 58 96 Q60 120 72 124 Q66 84 90 50 Q92 80 104 86 Q102 60 120 34 Q124 70 138 92 Q150 82 146 64 Q170 108 150 182 Z" fill="url(#f${u})"/>
        <path d="M70 76 L56 52 L78 68 M130 76 L144 52 L122 68" fill="#3b2f5c"/>`, 4)}
      <path d="M72 112 L94 120 L74 128 Z M128 112 L106 120 L126 128 Z" fill="#fff6b0" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M80 150 Q100 166 120 150 Q100 158 80 150 Z" fill="${O}"/>`;
    },
    phantomKing(u) {
      return `<defs>${lg('p' + u, [[0, '#efe7ff'], [1, '#8f6ad8']])}</defs>
      <ellipse cx="100" cy="190" rx="70" ry="9" fill="#000" opacity=".22"/>
      ${G(`<path d="M30 110 Q18 100 14 80 Q34 88 50 86 Z M170 110 Q182 100 186 80 Q166 88 150 86 Z" fill="url(#p${u})"/>
        <path d="M44 176 Q36 70 100 56 Q164 70 156 176 L140 166 L126 180 L112 166 L100 180 L88 166 L74 180 L60 166 Z" fill="url(#p${u})"/>
        <path d="M58 72 L66 36 L82 58 L100 26 L118 58 L134 36 L142 72 Q100 60 58 72 Z" fill="#ffd34d"/>`, 4)}
      <circle cx="100" cy="46" r="6" fill="#ff4a8a" stroke="${O}" stroke-width="2.4"/>
      <circle cx="74" cy="60" r="4" fill="#5fd3ff" stroke="${O}" stroke-width="2"/><circle cx="126" cy="60" r="4" fill="#5fd3ff" stroke="${O}" stroke-width="2"/>
      <ellipse cx="82" cy="108" rx="9" ry="12" fill="${O}"/><ellipse cx="118" cy="108" rx="9" ry="12" fill="${O}"/>
      <circle cx="82" cy="110" r="3.6" fill="#ff4a5e"/><circle cx="118" cy="110" r="3.6" fill="#ff4a5e"/>
      <ellipse cx="100" cy="140" rx="8" ry="10" fill="${O}"/>`;
    },
  };

  /* ---------------------------------------------------------
   *  小物
   * --------------------------------------------------------- */
  function gearPath(R, r, teeth) {
    const pts = [];
    for (let i = 0; i < teeth; i++) {
      const a = (i / teeth) * Math.PI * 2;
      const w = Math.PI / teeth * 0.55;
      [[a - w * 1.25, r], [a - w * 0.75, R], [a + w * 0.75, R], [a + w * 1.25, r]].forEach(([aa, rr]) =>
        pts.push((Math.cos(aa) * rr).toFixed(1) + ' ' + (Math.sin(aa) * rr).toFixed(1)));
    }
    return 'M' + pts.join(' L') + ' Z';
  }
  const PROP = {
    gear: () => svg('-24 -24 48 48', `<path d="${gearPath(21, 15.5, 8)}" fill="#ffd23d" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <circle r="11" fill="#ffe680"/><circle r="5" fill="#b87800" stroke="${O}" stroke-width="2.4"/>`),
    bossGear: () => svg('-24 -24 48 48', `<path d="${gearPath(21, 14, 10)}" fill="#8b8f9c" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <circle r="9" fill="#5b5f6c" stroke="${O}" stroke-width="2.4"/><circle r="3.4" fill="#ff4a5e"/>`),
    ball: () => svg('-24 -24 48 48', `<circle r="21" fill="#fff" stroke="${O}" stroke-width="3"/>
      <polygon points="0,-7 6.7,-2.2 4.1,5.7 -4.1,5.7 -6.7,-2.2" fill="${O}"/>
      <path d="M0 -7 L0 -14 M6.7 -2.2 L13 -4.5 M4.1 5.7 L8 11.5 M-4.1 5.7 L-8 11.5 M-6.7 -2.2 L-13 -4.5" stroke="${O}" stroke-width="2"/>
      <path d="M-5 -19 L5 -19 L0 -14 Z M17 -9 L19 2 L13 -4.5 Z M12 16 L3 19 L8 11.5 Z M-12 16 L-3 19 L-8 11.5 Z M-17 -9 L-19 2 L-13 -4.5 Z" fill="${O}"/>`),
    drone: () => svg('-24 -24 48 48', `<g stroke="${O}" stroke-width="2.4" stroke-linecap="round">
      <path d="M-14 -10 L14 10 M14 -10 L-14 10" stroke-width="4"/>
      <ellipse cx="-15" cy="-11" rx="8" ry="3" fill="#bfe6ff"/><ellipse cx="15" cy="-11" rx="8" ry="3" fill="#bfe6ff"/>
      <ellipse cx="-15" cy="11" rx="8" ry="3" fill="#bfe6ff"/><ellipse cx="15" cy="11" rx="8" ry="3" fill="#bfe6ff"/>
      <rect x="-9" y="-7" width="18" height="14" rx="5" fill="#5a6378"/></g>
      <circle r="3.4" fill="#4fe0ff"/>`),
    healDrone: () => svg('-24 -24 48 48', `<g stroke="${O}" stroke-width="2.4" stroke-linecap="round">
      <path d="M-14 -10 L14 10 M14 -10 L-14 10" stroke-width="4"/>
      <ellipse cx="-15" cy="-11" rx="8" ry="3" fill="#c9ffd9"/><ellipse cx="15" cy="-11" rx="8" ry="3" fill="#c9ffd9"/>
      <ellipse cx="-15" cy="11" rx="8" ry="3" fill="#c9ffd9"/><ellipse cx="15" cy="11" rx="8" ry="3" fill="#c9ffd9"/>
      <rect x="-10" y="-8" width="20" height="16" rx="6" fill="#ffffff"/></g>
      <path d="M-2.5 -6 L2.5 -6 L2.5 -2.5 L6 -2.5 L6 2.5 L2.5 2.5 L2.5 6 L-2.5 6 L-2.5 2.5 L-6 2.5 L-6 -2.5 L-2.5 -2.5 Z" fill="#3ddc84"/>`),
    bottle: () => svg('-26 -34 52 58', `<g stroke="${O}" stroke-width="2.6" stroke-linejoin="round">
      <path d="M-4 -14 L4 -14 L4 -6 Q12 -2 12 8 L12 18 Q0 22 -12 18 L-12 8 Q-12 -2 -4 -6 Z" fill="#5fcf7a"/>
      <path d="M-4 -14 L4 -14 L5 -19 L-5 -19 Z" fill="#f3e2c0"/></g>
      <path d="M0 -19 Q-6 -26 0 -32 Q2 -26 6 -28 Q6 -22 0 -19 Z" fill="#ff8a1e" stroke="${O}" stroke-width="1.6"/>
      <path d="M-8 4 Q-8 12 -6 14" stroke="#fff" stroke-width="2.4" fill="none" opacity=".6" stroke-linecap="round"/>`),
    tomb: (color = '#ff5a5f') => svg('-30 -40 60 70', `<ellipse cx="0" cy="26" rx="24" ry="5" fill="#000" opacity=".25"/>
      <path d="M-18 24 L-18 -14 Q-18 -32 0 -32 Q18 -32 18 -14 L18 24 Z" fill="#a3a9b8" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M0 -22 L0 4 M-9 -12 L9 -12" stroke="${O}" stroke-width="4" stroke-linecap="round"/>
      <path d="M-18 10 L18 10 L18 17 L-18 17 Z" fill="${color}" stroke="${O}" stroke-width="2.4"/>`),
  };

  /* ---------- 公開関数 ---------- */
  function enemySvg(kind) { return ENEMY[kind] ? svg('0 0 100 100', ENEMY[kind]()) : ''; }
  function bossSvg(kind) { return BOSS[kind] ? svg('0 0 200 200', BOSS[kind](uid())) : ''; }
  function propSvg(kind, arg) { return PROP[kind] ? PROP[kind](arg) : ''; }
  /** ステージ絵の中に敵を置く（足元が x,y） */
  function foeInline(kind, x, y, size = 46, flip = false) {
    if (!ENEMY[kind]) return '';
    const s = size;
    const inner = `<svg x="${-s / 2}" y="${-s * 0.92}" width="${s}" height="${s}" viewBox="0 0 100 100">${ENEMY[kind]()}</svg>`;
    return `<g transform="translate(${x} ${y}) scale(${flip ? -1 : 1} 1)">${inner}</g>`;
  }
  /** 敵の顔アイコン（丸い枠用） */
  function enemyIcon(kind, cls = 'foe-icon') {
    if (ENEMY[kind]) return `<svg class="${cls}" viewBox="8 4 84 84" xmlns="http://www.w3.org/2000/svg">${ENEMY[kind]()}</svg>`;
    if (BOSS[kind]) return `<svg class="${cls}" viewBox="10 10 180 180" xmlns="http://www.w3.org/2000/svg">${BOSS[kind](uid())}</svg>`;
    return '';
  }

  Object.assign(DS.art, { enemySvg, bossSvg, propSvg, foeInline, enemyIcon });
})();

/* ---------- スキル・アビリティのアイコン（HUD とレベルアップ画面用） ---------- */
(function () {
  const O = '#231a3a';
  const box = (body, bg) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="1.5" y="1.5" width="45" height="45" rx="11" fill="${bg}" stroke="${O}" stroke-width="3"/>${body}</svg>`;
  const ICON = {
    kunai: () => box(`<svg x="4" y="4" width="40" height="40" viewBox="0 0 100 100">${DS.art.item('kunai').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`, '#ffe08a'),
    shotgun: () => box(`<svg x="4" y="4" width="40" height="40" viewBox="0 0 100 100">${DS.art.item('shotgun').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`, '#ffe08a'),
    lightsaber: () => box(`<svg x="4" y="4" width="40" height="40" viewBox="0 0 100 100">${DS.art.item('lightsaber').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`, '#ffe08a'),
    revolver: () => box(`<svg x="4" y="4" width="40" height="40" viewBox="0 0 100 100">${DS.art.item('revolver').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`, '#ffe08a'),
    defender: () => box(`<svg x="7" y="7" width="34" height="34" viewBox="-24 -24 48 48">${DS.art.propSvg('gear').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`, '#7fd0ff'),
    drone: () => box(`<svg x="5" y="5" width="38" height="38" viewBox="-24 -24 48 48">${DS.art.propSvg('drone').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`, '#a6f0c6'),
    thunder: () => box(`<path d="M27 6 L12 27 L22 27 L18 42 L36 19 L25 19 L30 6 Z" fill="#ffe14d" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/>`, '#5b5fd8'),
    soccer: () => box(`<svg x="6" y="6" width="36" height="36" viewBox="-24 -24 48 48">${DS.art.propSvg('ball').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`, '#8fe08a'),
    molotov: () => box(`<svg x="7" y="5" width="34" height="38" viewBox="-26 -34 52 58">${DS.art.propSvg('bottle').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`, '#ffb36b'),
    gravity: () => box(`<circle cx="24" cy="24" r="15" fill="#3b1f7a" stroke="${O}" stroke-width="2.6"/><path d="M24 12 Q36 14 34 26 Q32 34 24 32 Q18 30 20 24 Q22 20 26 22" fill="none" stroke="#d6b8ff" stroke-width="3" stroke-linecap="round"/>`, '#b98cff'),
    drink: () => box(`<rect x="15" y="9" width="18" height="30" rx="5" fill="#3ddc84" stroke="${O}" stroke-width="2.6"/><rect x="15" y="17" width="18" height="10" fill="#fff"/><path d="M22 18 L19 23 L23 23 L21 27 L27 21 L23 21 L25 18 Z" fill="#ff5a5f"/>`, '#d2ffe3'),
    ammo: () => box(`${[12, 21, 30].map((x) => `<path d="M${x} 38 L${x} 20 Q${x + 3.5} 10 ${x + 7} 20 L${x + 7} 38 Z" fill="#ffc94d" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/><path d="M${x} 32 L${x + 7} 32" stroke="${O}" stroke-width="2"/>`).join('')}`, '#ffd6c2'),
    battery: () => box(`<rect x="12" y="14" width="22" height="24" rx="4" fill="#ffe14d" stroke="${O}" stroke-width="2.6"/><rect x="18" y="9" width="10" height="5" fill="${O}"/><path d="M24 18 L18 27 L23 27 L21 34 L28 24 L24 24 Z" fill="${O}"/>`, '#c7e8ff'),
    vest: () => box(`<path d="M14 12 L20 10 Q24 16 28 10 L34 12 L36 38 L12 38 Z" fill="#5d6b4a" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/><rect x="17" y="22" width="14" height="9" rx="2" fill="#7b8a62" stroke="${O}" stroke-width="2"/>`, '#e4e8d2'),
    scroll: () => box(`<rect x="12" y="12" width="24" height="24" fill="#fff1cf" stroke="${O}" stroke-width="2.6"/><circle cx="12" cy="24" r="4" fill="#c9883a" stroke="${O}" stroke-width="2"/><circle cx="36" cy="24" r="4" fill="#c9883a" stroke="${O}" stroke-width="2"/><path d="M17 19 L31 19 M17 24 L31 24 M17 29 L27 29" stroke="#b07a3a" stroke-width="2"/>`, '#ffe6a6'),
    coin: () => box(`<svg x="8" y="8" width="32" height="32" viewBox="0 0 32 32">${DS.art.coin().replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`, '#fff3b0'),
    heal: () => box(`<path d="M24 38 Q10 28 10 19 Q10 11 17 11 Q22 11 24 16 Q26 11 31 11 Q38 11 38 19 Q38 28 24 38 Z" fill="#ff5a6a" stroke="${O}" stroke-width="2.6" stroke-linejoin="round"/>`, '#ffd6dc'),
  };
  DS.art.skillIcon = (key) => (ICON[key] ? ICON[key]() : '');
})();
