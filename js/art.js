/* =========================================================
 *  art.js  ― すべてのイラストを SVG で描画
 *  画像ファイルを使わないので、GitHub にそのまま置いても軽量です。
 *  各関数は SVG 文字列を返します。
 * ========================================================= */
(function () {
  const O = '#231a3a';          // 共通の輪郭線の色
  let seq = 0;
  const uid = () => 'g' + (++seq).toString(36);   // グラデーション ID の衝突を防ぐ

  function lg(id, stops, x1 = 0, y1 = 0, x2 = 0, y2 = 1) {
    return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${
      stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  }
  function rg(id, stops, cx = 0.5, cy = 0.5, r = 0.5) {
    return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${
      stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('')}</radialGradient>`;
  }
  function starPts(cx, cy, R, r, n = 5, rot = -90) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = (rot + i * 180 / n) * Math.PI / 180;
      const rr = i % 2 ? r : R;
      pts.push((cx + Math.cos(a) * rr).toFixed(1) + ',' + (cy + Math.sin(a) * rr).toFixed(1));
    }
    return pts.join(' ');
  }
  function sparkle(cx, cy, s, fill = '#fff', op = 1) {
    return `<path d="M${cx} ${cy - s}Q${cx} ${cy} ${cx + s} ${cy}Q${cx} ${cy} ${cx} ${cy + s}Q${cx} ${cy} ${cx - s} ${cy}Q${cx} ${cy} ${cx} ${cy - s}Z" fill="${fill}" opacity="${op}"/>`;
  }
  const svg = (vb, body, cls = '') => `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

  /* ---------------------------------------------------------
   *  装備アイテム（viewBox 0 0 100 100）
   * --------------------------------------------------------- */
  const BOOT = 'M34 18 L60 18 L61 52 Q62 60 70 62 L82 65 Q92 68 92 76 L92 82 L32 82 L32 60 Q31 40 34 18 Z';
  const BOOT_SOLE = 'M29 80 L95 80 Q96 88 89 89 L34 89 Q28 88 29 80 Z';
  const STRAP = 'M4 44 Q50 32 86 42 L96 50 L86 58 Q50 48 4 60 Z';

  const ITEM_ART = {
    kunai() {
      const u = uid();
      return `<defs>${lg('b' + u, [[0, '#ffffff'], [0.48, '#c9d4e4'], [0.52, '#8796ad'], [1, '#56637a']], 0, 0, 1, 0)}</defs>
      <g transform="rotate(40 50 50)" stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <circle cx="50" cy="88" r="7" fill="none" stroke-width="7"/>
        <circle cx="50" cy="88" r="7" fill="none" stroke="#f2b33d" stroke-width="3"/>
        <rect x="45" y="58" width="10" height="24" rx="2" fill="#3b2f5c"/>
        <path d="M45 63 L55 67 M45 69 L55 73 M45 75 L55 79" stroke="#ff5a6a" stroke-width="2.4"/>
        <rect x="40" y="53" width="20" height="6" rx="2.5" fill="#f2b33d"/>
        <path d="M50 5 L62 35 L50 55 L38 35 Z" fill="url(#b${u})"/>
        <path d="M50 11 L50 50" stroke="#fff" stroke-width="1.6" opacity=".75"/>
      </g>
      ${sparkle(74, 20, 6)}${sparkle(84, 34, 3.5, '#fff', 0.8)}`;
    },

    shotgun() {
      const u = uid();
      return `<defs>${lg('w' + u, [[0, '#e0904a'], [1, '#8a4a22']])}${lg('s' + u, [[0, '#d7deea'], [0.5, '#8d98ad'], [1, '#4c566c']])}</defs>
      <g transform="rotate(-28 50 54)" stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M6 52 L30 44 L34 57 L22 63 L11 72 Q3 68 4 60 Z" fill="url(#w${u})"/>
        <path d="M34 54 Q35 65 45 61" fill="none" stroke-width="2.6"/>
        <rect x="28" y="40" width="23" height="15" rx="3" fill="#4a5068"/>
        <rect x="49" y="40" width="46" height="7.5" rx="2" fill="url(#s${u})"/>
        <rect x="49" y="48" width="38" height="5" rx="2" fill="#363b4f"/>
        <rect x="57" y="46" width="21" height="10" rx="3.5" fill="url(#w${u})"/>
        <path d="M62 48 L62 54 M67 48 L67 54 M72 48 L72 54" stroke-width="1.8"/>
        <rect x="92" y="38.5" width="5" height="10.5" rx="1.5" fill="#2b2f3d"/>
        <circle cx="38" cy="47" r="2.2" fill="#f2b33d" stroke-width="1.5"/>
      </g>
      ${sparkle(82, 16, 5)}`;
    },

    lightsaber() {
      const u = uid();
      return `<defs>${lg('h' + u, [[0, '#f4f8ff'], [0.5, '#a9b6ca'], [1, '#5d6b82']], 0, 0, 1, 0)}</defs>
      <g transform="rotate(45 50 50)" stroke-linecap="round">
        <line x1="50" y1="7" x2="50" y2="60" stroke="#3fe0ff" stroke-width="17" opacity=".28"/>
        <line x1="50" y1="7" x2="50" y2="60" stroke="#5fe9ff" stroke-width="11" opacity=".6"/>
        <line x1="50" y1="7" x2="50" y2="60" stroke="#f2ffff" stroke-width="5"/>
        <g stroke="${O}" stroke-width="3" stroke-linejoin="round">
          <rect x="43" y="60" width="14" height="31" rx="3" fill="url(#h${u})"/>
          <rect x="40" y="57" width="20" height="7" rx="2.5" fill="#4a5068"/>
          <path d="M43 70 L57 70 M43 76 L57 76 M43 82 L57 82" stroke-width="2.4"/>
          <circle cx="50" cy="66" r="2.4" fill="#ff4a5e" stroke-width="1.5"/>
        </g>
      </g>
      ${sparkle(80, 18, 6)}${sparkle(66, 10, 3.5, '#dffcff')}`;
    },

    revolver() {
      const u = uid();
      return `<defs>${lg('w' + u, [[0, '#d98a4a'], [1, '#7a4220']])}${lg('s' + u, [[0, '#e6ecf5'], [0.5, '#9aa6ba'], [1, '#56607a']])}</defs>
      <g transform="rotate(-20 50 52)" stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M26 54 L40 56 Q35 72 41 86 L23 88 Q12 70 26 54 Z" fill="url(#w${u})"/>
        <path d="M24 62 L36 63 M23 70 L35 71" stroke="#4a2810" stroke-width="1.6"/>
        <path d="M38 57 Q41 70 52 63" fill="none" stroke-width="2.6"/>
        <path d="M22 36 L46 36 L46 57 L26 59 Z" fill="#4a5068"/>
        <rect x="44" y="37" width="50" height="9" rx="2" fill="url(#s${u})"/>
        <rect x="48" y="46" width="30" height="5" rx="2" fill="#3a3f52"/>
        <rect x="88" y="32" width="4" height="6" rx="1" fill="#2b2f3d" stroke-width="2"/>
        <rect x="28" y="34" width="22" height="21" rx="6" fill="url(#s${u})"/>
        <path d="M34 36 L34 53 M40 36 L40 53 M46 36 L46 53" stroke-width="1.8" opacity=".7"/>
        <path d="M22 37 L15 28 L24 31 Z" fill="#4a5068" stroke-width="2.4"/>
      </g>
      ${sparkle(84, 16, 6)}`;
    },

    plateArmor() {
      const u = uid();
      return `<defs>${lg('p' + u, [[0, '#f4f8ff'], [0.45, '#b8c6da'], [1, '#6b7a94']], 0, 0, 1, 1)}</defs>
      <g stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <ellipse cx="22" cy="37" rx="15" ry="12" fill="url(#p${u})"/>
        <ellipse cx="78" cy="37" rx="15" ry="12" fill="url(#p${u})"/>
        <path d="M12 38 Q22 30 32 38 M68 38 Q78 30 88 38" fill="none" stroke-width="2"/>
        <path d="M30 26 Q50 18 70 26 Q74 40 72 52 Q74 66 66 78 Q50 88 34 78 Q26 66 28 52 Q26 40 30 26 Z" fill="url(#p${u})"/>
        <path d="M40 23 Q50 35 60 23 Q50 20 40 23 Z" fill="#2b2540"/>
        <path d="M37 24 Q50 39 63 24" fill="none" stroke="#f2b33d" stroke-width="3.2"/>
        <path d="M50 38 L50 84" stroke-width="2" opacity=".55"/>
        <path d="M30 61 Q50 69 70 61 M33 71 Q50 79 67 71" fill="none" stroke-width="2.4"/>
        <path d="M50 39 L57 47 L50 55 L43 47 Z" fill="#ff4a5e"/>
        <circle cx="36" cy="38" r="2.2" fill="#eef3fa" stroke-width="1.5"/>
        <circle cx="64" cy="38" r="2.2" fill="#eef3fa" stroke-width="1.5"/>
      </g>
      <path d="M35 32 Q39 28 44 31 Q38 40 37 52 Q33 44 35 32 Z" fill="#fff" opacity=".55"/>
      ${sparkle(85, 18, 5)}`;
    },

    leatherArmor() {
      const u = uid();
      return `<defs>${lg('l' + u, [[0, '#e8a265'], [1, '#93542a']], 0, 0, 1, 1)}</defs>
      <g stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <rect x="43" y="22" width="14" height="60" fill="#f6e7c8"/>
        <path d="M29 26 L45 21 Q45 50 47 82 L31 82 Q22 60 27 42 Z" fill="url(#l${u})"/>
        <path d="M71 26 L55 21 Q55 50 53 82 L69 82 Q78 60 73 42 Z" fill="url(#l${u})"/>
        <ellipse cx="29" cy="30" rx="9" ry="7" fill="#7a4220"/>
        <ellipse cx="71" cy="30" rx="9" ry="7" fill="#7a4220"/>
        <path d="M46 33 L54 39 M54 33 L46 39 M46 45 L54 51 M54 45 L46 51 M46 57 L54 63 M54 57 L46 63 M46 69 L54 75 M54 69 L46 75" stroke="#5a3216" stroke-width="2.2"/>
        <rect x="31" y="56" width="11" height="11" rx="2" fill="#b86d35" stroke-width="2.4"/>
        <path d="M31 60 L42 60" stroke-width="2"/>
      </g>
      <g fill="none" stroke="#ffd9a8" stroke-width="1.4" stroke-dasharray="3 2.6">
        <path d="M41 27 Q41 52 43 78"/><path d="M59 27 Q59 52 57 78"/>
        <path d="M31 46 Q29 62 34 78"/><path d="M69 46 Q71 62 66 78"/>
      </g>
      ${sparkle(86, 18, 5)}`;
    },

    eternalBoots() {
      const u = uid();
      return `<defs>${lg('e' + u, [[0, '#8ff7ea'], [1, '#169aa6']], 0, 0, 1, 1)}${lg('g' + u, [[0, '#fff2a0'], [1, '#e6a400']])}</defs>
      <g stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="M38 26 Q22 10 6 17 Q13 21 15 25 Q3 27 3 37 Q13 35 17 37 Q7 43 9 51 Q21 45 36 46 Z" fill="#fff"/>
        <path d="M14 26 Q24 28 32 33 M12 37 Q24 38 33 40" fill="none" stroke="#9fd8ff" stroke-width="2"/>
        <path d="${BOOT}" fill="url(#e${u})"/>
        <path d="${BOOT_SOLE}" fill="#3a2f5c"/>
        <rect x="31" y="12" width="32" height="10" rx="4" fill="url(#g${u})"/>
        <path d="M61 54 Q66 63 79 66" fill="none" stroke="#fff2a0" stroke-width="3"/>
        <circle cx="47" cy="40" r="6.5" fill="url(#g${u})"/>
        <circle cx="47" cy="40" r="2.6" fill="#5ff0e4" stroke-width="1.5"/>
      </g>
      <path d="M38 28 Q40 46 38 66" stroke="#fff" stroke-width="3" opacity=".45" fill="none" stroke-linecap="round"/>
      ${sparkle(86, 50, 6)}${sparkle(76, 40, 3.5, '#fff', 0.8)}`;
    },

    frostBoots() {
      const u = uid();
      const flake = (x, y, s) => [0, 60, 120].map((a) =>
        `<g transform="rotate(${a} ${x} ${y})"><path d="M${x} ${y - s}L${x} ${y + s}M${x - 3} ${y - s + 3}L${x} ${y - s + 6}L${x + 3} ${y - s + 3}M${x - 3} ${y + s - 3}L${x} ${y + s - 6}L${x + 3} ${y + s - 3}"/></g>`).join('');
      return `<defs>${lg('f' + u, [[0, '#f4feff'], [0.5, '#8fd2f7'], [1, '#3f86d6']], 0, 0, 1, 1)}</defs>
      <g stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="${BOOT}" fill="url(#f${u})"/>
        <path d="${BOOT_SOLE}" fill="#2f4a7a"/>
        <path d="M30 20 L33 6 L38 16 L43 2 L48 15 L53 5 L57 16 L62 8 L64 20 Z" fill="#e3f7ff"/>
        <path d="M66 63 L70 52 L74 63 M78 66 L83 57 L86 67" fill="#e3f7ff"/>
      </g>
      <g stroke="#2a6bb8" stroke-width="4.6" stroke-linecap="round" fill="none">${flake(47, 44, 10)}</g>
      <g stroke="#fff" stroke-width="2.2" stroke-linecap="round" fill="none">${flake(47, 44, 10)}</g>
      <circle cx="16" cy="40" r="2.4" fill="#cdefff"/><circle cx="20" cy="56" r="1.8" fill="#cdefff"/>
      ${sparkle(14, 26, 5, '#e8f9ff')}${sparkle(88, 46, 5, '#fff')}`;
    },

    stellaBelt() {
      const u = uid();
      return `<defs>${lg('n' + u, [[0, '#6c71ea'], [1, '#262a7a']])}${lg('g' + u, [[0, '#fff3a6'], [1, '#e2a000']], 0, 0, 1, 1)}</defs>
      <g stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="${STRAP}" fill="url(#n${u})"/>
        <ellipse cx="74" cy="48" rx="2" ry="2.6" fill="${O}" stroke-width="1"/>
        <ellipse cx="82" cy="49.5" rx="2" ry="2.6" fill="${O}" stroke-width="1"/>
        <polygon points="${starPts(40, 48, 24, 10.5)}" fill="url(#g${u})"/>
        <polygon points="${starPts(40, 48.5, 11, 5)}" fill="#fff8cf" stroke-width="1.8"/>
        <circle cx="40" cy="49" r="3.2" fill="#7fe3ff" stroke-width="1.5"/>
        <polygon points="${starPts(13, 51, 5, 2.2)}" fill="#ffe27a" stroke-width="1.4"/>
        <polygon points="${starPts(64, 45.5, 5, 2.2)}" fill="#ffe27a" stroke-width="1.4"/>
      </g>
      ${sparkle(70, 26, 6)}${sparkle(20, 30, 4, '#fff8cf')}${sparkle(84, 66, 3.5, '#fff', 0.8)}`;
    },

    eternalBelt() {
      const u = uid();
      return `<defs>${lg('r' + u, [[0, '#ff6b7f'], [1, '#8f1d38']])}${lg('g' + u, [[0, '#fff3a6'], [1, '#d99400']], 0, 0, 1, 1)}</defs>
      <g stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        <path d="${STRAP}" fill="url(#r${u})"/>
        <circle cx="12" cy="51.5" r="2.4" fill="#ffd34d" stroke-width="1.4"/>
        <circle cx="21" cy="49.5" r="2.4" fill="#ffd34d" stroke-width="1.4"/>
        <circle cx="72" cy="47" r="2.4" fill="#ffd34d" stroke-width="1.4"/>
        <circle cx="80" cy="48.5" r="2.4" fill="#ffd34d" stroke-width="1.4"/>
        <rect x="29" y="33" width="38" height="31" rx="8" fill="url(#g${u})"/>
        <rect x="34" y="38" width="28" height="21" rx="5" fill="#fff4bf" stroke-width="2"/>
        <path d="M40 48.5 C40 42.5 46 42.5 48 48.5 C50 54.5 56 54.5 56 48.5 C56 42.5 50 42.5 48 48.5 C46 54.5 40 54.5 40 48.5 Z" fill="none" stroke="#b3123a" stroke-width="3.4"/>
      </g>
      <path d="M33 36 L40 36" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
      ${sparkle(76, 24, 6)}${sparkle(22, 30, 4, '#ffe3e8')}`;
    },
  };

  function item(itemKey, cls = 'item-art') {
    const f = ITEM_ART[itemKey];
    return f ? svg('0 0 100 100', f(), cls) : '';
  }

  /* ---------------------------------------------------------
   *  プレイヤーキャラ（ちびキャラ）
   * --------------------------------------------------------- */
  function heroBody(color, hair = '#4a2e1f') {
    return `<ellipse cx="60" cy="133" rx="30" ry="6" fill="#000" opacity=".22"/>
    <g stroke="${O}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
      <rect x="46" y="106" width="11" height="21" rx="4" fill="#3b3f63"/>
      <rect x="63" y="106" width="11" height="21" rx="4" fill="#3b3f63"/>
      <ellipse cx="50" cy="128" rx="9.5" ry="5.5" fill="#2a2140"/>
      <ellipse cx="70" cy="128" rx="9.5" ry="5.5" fill="#2a2140"/>
      <ellipse cx="33" cy="95" rx="7" ry="12" fill="${color}" transform="rotate(14 33 95)"/>
      <ellipse cx="87" cy="95" rx="7" ry="12" fill="${color}" transform="rotate(-14 87 95)"/>
      <circle cx="31" cy="107" r="6" fill="#ffd9b8"/>
      <circle cx="89" cy="107" r="6" fill="#ffd9b8"/>
      <path d="M38 84 Q60 74 82 84 L84 112 Q60 118 36 112 Z" fill="${color}"/>
      <path d="M37 103 Q60 108 83 103 L83 110 Q60 115 37 110 Z" fill="#2a2140"/>
      <rect x="55" y="102" width="10" height="9" rx="2" fill="#ffd34d" stroke-width="2"/>
      <path d="M92 41 L110 33 L105 45 L113 52 L94 48 Z" fill="${color}"/>
      <circle cx="60" cy="50" r="34" fill="#ffd9b8"/>
      <path d="M26 52 Q22 16 60 13 Q98 16 94 52 Q89 35 78 33 Q70 41 56 37 Q44 43 34 37 Q28 43 26 52 Z" fill="${hair}"/>
      <path d="M27 40 Q60 25 93 40 L92 48 Q60 34 28 48 Z" fill="${color}"/>
    </g>
    <ellipse cx="47" cy="57" rx="4.6" ry="6.4" fill="${O}"/>
    <ellipse cx="73" cy="57" rx="4.6" ry="6.4" fill="${O}"/>
    <circle cx="48.6" cy="54.6" r="1.8" fill="#fff"/><circle cx="74.6" cy="54.6" r="1.8" fill="#fff"/>
    <ellipse cx="38" cy="67" rx="5.5" ry="3.2" fill="#ff8f9a" opacity=".6"/>
    <ellipse cx="82" cy="67" rx="5.5" ry="3.2" fill="#ff8f9a" opacity=".6"/>
    <path d="M54 68 Q60 74 66 68" fill="none" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M38 41 Q60 31 82 41" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>`;
  }
  function hero(color = '#ff5a5f', cls = 'hero-art') { return svg('0 0 120 140', heroBody(color), cls); }
  function heroFace(color = '#ff5a5f', cls = 'face-art') { return svg('22 12 80 80', heroBody(color), cls); }

  const foe = (...a) => (DS.art.foeInline ? DS.art.foeInline(...a) : '');
  const cloud = (x, y, s = 1, c = '#fff', op = 0.95) =>
    `<g transform="translate(${x} ${y}) scale(${s})" fill="${c}" opacity="${op}"><circle cx="0" cy="0" r="12"/><circle cx="14" cy="-6" r="15"/><circle cx="30" cy="0" r="11"/><rect x="0" y="-2" width="30" height="13" rx="6"/></g>`;
  const tree = (x, y, s = 1, c = '#2f9e44') =>
    `<g transform="translate(${x} ${y}) scale(${s})" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"><rect x="-4" y="-16" width="8" height="16" rx="2" fill="#8a5a2b"/><circle cx="0" cy="-28" r="16" fill="${c}"/><circle cx="-10" cy="-20" r="10" fill="${c}"/><circle cx="10" cy="-20" r="10" fill="${c}"/><circle cx="-5" cy="-33" r="4" fill="#fff" stroke="none" opacity=".35"/></g>`;
  const pine = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"><rect x="-3" y="-8" width="6" height="8" fill="#6b4423"/><path d="M0 -50 L14 -26 L8 -26 L18 -8 L-18 -8 L-8 -26 L-14 -26 Z" fill="#2e7d5b"/><path d="M0 -50 L7 -38 Q0 -34 -7 -38 Z M-9 -26 Q0 -22 9 -26 L12 -20 Q0 -16 -12 -20 Z" fill="#fff" stroke="none"/></g>`;
  const cactus = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})" stroke="${O}" stroke-width="2.4" stroke-linejoin="round" fill="#43b05c"><rect x="-6" y="-40" width="12" height="40" rx="6"/><path d="M-6 -20 L-14 -20 Q-18 -20 -18 -24 L-18 -32" fill="none" stroke-width="7" stroke="${O}"/><path d="M-6 -20 L-14 -20 Q-18 -20 -18 -24 L-18 -32" fill="none" stroke-width="3.6" stroke="#43b05c"/><path d="M6 -26 L13 -26 Q17 -26 17 -30 L17 -36" fill="none" stroke-width="7" stroke="${O}"/><path d="M6 -26 L13 -26 Q17 -26 17 -30 L17 -36" fill="none" stroke-width="3.6" stroke="#43b05c"/></g>`;

  /* ---------------------------------------------------------
   *  ステージイラスト（viewBox 0 0 360 200）
   * --------------------------------------------------------- */
  const STAGE_ART = {
    meadow(u) {
      return `<defs>${lg('sky' + u, [[0, '#6fcdfd'], [1, '#d8f5ff']])}${rg('sun' + u, [[0, '#fff6b0'], [0.6, '#ffe066'], [1, '#ffe066', 0]])}</defs>
      <rect width="360" height="200" fill="url(#sky${u})"/>
      <circle cx="300" cy="44" r="40" fill="url(#sun${u})"/><circle cx="300" cy="44" r="20" fill="#ffe066" stroke="${O}" stroke-width="2.4"/>
      ${cloud(40, 40, 1.1)}${cloud(170, 28, 0.8)}${cloud(240, 70, 0.6, '#fff', 0.8)}
      <path d="M0 118 Q60 78 130 110 Q200 70 270 104 Q320 86 360 98 L360 200 L0 200 Z" fill="#82d86c"/>
      ${tree(46, 122, 0.9, '#3cb44b')}${tree(318, 116, 1, '#2f9e44')}${tree(286, 120, 0.7, '#3cb44b')}
      <path d="M0 150 Q90 120 180 146 Q270 122 360 150 L360 200 L0 200 Z" fill="#4fb24a" stroke="${O}" stroke-width="2.4"/>
      <path d="M150 200 Q170 170 200 160 Q240 150 260 140 L272 142 Q250 158 214 168 Q186 178 176 200 Z" fill="#f2d48c" opacity=".9"/>
      <g fill="#ff6b8a"><circle cx="70" cy="170" r="3"/><circle cx="96" cy="182" r="3"/><circle cx="300" cy="176" r="3"/></g>
      <g fill="#ffe066"><circle cx="82" cy="160" r="2.6"/><circle cx="316" cy="188" r="2.6"/><circle cx="40" cy="186" r="2.6"/></g>
      ${foe('wolf', 92, 150, 40)}${foe('mageZombie', 284, 172, 52, true)}${foe('zombie', 132, 182, 62)}${foe('wolf', 222, 192, 50, true)}`;
    },
    desert(u) {
      return `<defs>${lg('sky' + u, [[0, '#ff9f5a'], [1, '#ffe2a1']])}${rg('sun' + u, [[0, '#fff6c8'], [0.5, '#ffd25a'], [1, '#ffb347', 0]])}</defs>
      <rect width="360" height="200" fill="url(#sky${u})"/>
      <circle cx="96" cy="64" r="56" fill="url(#sun${u})"/><circle cx="96" cy="64" r="26" fill="#ffd25a" stroke="${O}" stroke-width="2.4"/>
      <path d="M210 120 L262 52 L314 120 Z" fill="#f2b45a" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M262 52 L314 120 L278 120 Z" fill="#d98f3a"/><path d="M230 96 L294 96 M244 78 L280 78" stroke="${O}" stroke-width="1.6" opacity=".4"/>
      <path d="M0 128 Q80 100 170 124 Q260 104 360 124 L360 200 L0 200 Z" fill="#f6c76b"/>
      ${cactus(40, 140, 1)}${cactus(330, 136, 0.8)}
      <path d="M0 158 Q120 132 220 160 Q300 146 360 156 L360 200 L0 200 Z" fill="#eaa84a" stroke="${O}" stroke-width="2.4"/>
      <g stroke="${O}" stroke-width="1.8" fill="#fff8e7"><circle cx="300" cy="182" r="6"/><rect x="292" y="186" width="16" height="4" rx="2"/></g>
      <circle cx="298" cy="181" r="1.6" fill="${O}"/><circle cx="303" cy="181" r="1.6" fill="${O}"/>
      ${foe('mageZombie', 186, 160, 40, true)}${foe('zombie', 140, 184, 58)}${foe('armorSkeleton', 232, 182, 56, true)}${foe('fireWolf', 82, 192, 44)}`;
    },
    snow(u) {
      return `<defs>${lg('sky' + u, [[0, '#8fcaf5'], [1, '#eaf7ff']])}</defs>
      <rect width="360" height="200" fill="url(#sky${u})"/>
      <path d="M-10 130 L70 46 L120 100 L180 34 L260 112 L300 70 L370 130 Z" fill="#9ab4d6" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M70 46 L88 66 L78 64 L68 72 L58 60 Z M180 34 L202 56 L188 54 L178 64 L164 52 Z M300 70 L314 84 L304 82 L296 88 L288 82 Z" fill="#fff"/>
      ${pine(30, 146, 0.9)}${pine(60, 150, 0.7)}${pine(326, 146, 1)}${pine(296, 150, 0.7)}
      <path d="M0 146 Q90 128 180 144 Q270 128 360 146 L360 200 L0 200 Z" fill="#f4fbff" stroke="${O}" stroke-width="2.4"/>
      <path d="M200 170 Q240 162 290 168 Q260 178 210 176 Z" fill="#bfe6ff"/>
      <g fill="#fff">${[[30, 30], [90, 20], [140, 70], [220, 30], [260, 90], [330, 30], [20, 100], [120, 120], [350, 100]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6"/>`).join('')}</g>
      ${foe('iceWolf', 250, 178, 44, true)}${foe('iceWolf', 104, 188, 50)}${foe('armorSkeleton', 172, 186, 60)}`;
    },
    volcano(u) {
      return `<defs>${lg('sky' + u, [[0, '#3b1030'], [0.7, '#c2402f'], [1, '#ff8a3d']])}${lg('lava' + u, [[0, '#ffe066'], [1, '#ff5a1f']])}</defs>
      <rect width="360" height="200" fill="url(#sky${u})"/>
      <path d="M150 34 Q160 14 176 24 Q186 6 202 20 Q218 12 222 32 Z" fill="#5b3a4a" opacity=".85"/>
      <path d="M90 150 L160 52 L210 52 L290 150 Z" fill="#4a2a35" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>
      <path d="M160 52 L210 52 L204 60 Q186 56 166 60 Z" fill="url(#lava${u})"/>
      <path d="M176 56 Q170 90 182 110 Q190 130 176 150 L196 150 Q206 126 196 104 Q188 84 194 56 Z" fill="url(#lava${u})" stroke="${O}" stroke-width="2"/>
      <path d="M0 150 Q90 136 180 150 Q270 136 360 150 L360 200 L0 200 Z" fill="#2e1b26" stroke="${O}" stroke-width="2.4"/>
      <path d="M0 176 Q60 168 110 178 Q150 186 200 176 L200 182 Q150 192 110 184 Q60 174 0 182 Z" fill="url(#lava${u})"/>
      <g stroke="${O}" stroke-width="2" fill="#5a3a45"><path d="M300 160 L316 146 L334 158 L326 168 Z"/><path d="M30 156 L44 146 L58 160 Z"/></g>
      <g fill="#ffb347">${[[60, 60], [120, 90], [250, 70], [300, 110], [330, 40], [40, 120]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.2"/>`).join('')}</g>
      ${foe('mageZombie', 126, 172, 56)}${foe('armorSkeleton', 250, 178, 60, true)}${foe('wolf', 318, 194, 40, true)}`;
    },
    ruins(u) {
      const win = (x, y) => `<rect x="${x}" y="${y}" width="6" height="8" fill="#ffe27a"/>`;
      return `<defs>${lg('sky' + u, [[0, '#1b1242'], [1, '#6b3fa4']])}${rg('moon' + u, [[0, '#fff8d6'], [0.55, '#fff3c4', 0.6], [1, '#fff3c4', 0]])}</defs>
      <rect width="360" height="200" fill="url(#sky${u})"/>
      <g fill="#fff">${[[20, 20], [70, 50], [120, 16], [200, 40], [240, 14], [340, 60], [160, 70], [30, 90]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4"/>`).join('')}</g>
      <circle cx="286" cy="50" r="46" fill="url(#moon${u})"/><circle cx="286" cy="50" r="22" fill="#fff3c4" stroke="${O}" stroke-width="2.4"/>
      <circle cx="279" cy="44" r="4" fill="#efdca0"/><circle cx="292" cy="58" r="3" fill="#efdca0"/>
      <g stroke="${O}" stroke-width="2.4" stroke-linejoin="round" fill="#2c2350">
        <path d="M14 150 L14 70 L30 64 L38 74 L54 66 L54 150 Z"/>
        <path d="M70 150 L70 92 L96 92 L102 84 L110 96 L110 150 Z"/>
        <path d="M236 150 L236 80 L252 72 L262 86 L276 78 L276 150 Z"/>
        <path d="M300 150 L300 104 L340 98 L348 110 L348 150 Z"/>
      </g>
      ${win(22, 84)}${win(38, 100)}${win(22, 118)}${win(80, 104)}${win(244, 96)}${win(260, 116)}${win(312, 118)}${win(330, 112)}
      <path d="M150 60 l-8 -4 l-4 4 l4 2 l-6 6 l8 -4 l6 4 l6 -4 l8 4 l-6 -6 l4 -2 l-4 -4 l-8 4 Z" fill="${O}"/>
      <path d="M200 90 l-6 -3 l-3 3 l3 1.5 l-4.5 4.5 l6 -3 l4.5 3 l4.5 -3 l6 3 l-4.5 -4.5 l3 -1.5 l-3 -3 l-6 3 Z" fill="${O}"/>
      <path d="M0 150 Q90 136 180 150 Q270 136 360 150 L360 200 L0 200 Z" fill="#3a2f5c" stroke="${O}" stroke-width="2.4"/>
      <g stroke="${O}" stroke-width="2" fill="#7a6f9a"><path d="M40 176 L40 162 Q48 154 56 162 L56 176 Z"/><path d="M300 180 L300 168 Q306 162 312 168 L312 180 Z"/></g>
      ${foe('armorSkeleton', 282, 168, 46, true)}${foe('zombie', 140, 180, 58)}${foe('mageZombie', 222, 188, 58, true)}`;
    },
  };

  function stage(key, cls = 'stage-art') {
    const f = STAGE_ART[key];
    return f ? svg('0 0 360 200', f(uid()), cls) : '';
  }

  /* ---------------------------------------------------------
   *  ガチャの宝箱（viewBox 0 0 220 190）
   * --------------------------------------------------------- */
  function chest(cls = 'chest-art') {
    const u = uid();
    const rays = Array.from({ length: 12 }, (_, i) =>
      `<path d="M110 100 L${110 + Math.cos((i * 30 - 6) * Math.PI / 180) * 200} ${100 + Math.sin((i * 30 - 6) * Math.PI / 180) * 200} L${110 + Math.cos((i * 30 + 6) * Math.PI / 180) * 200} ${100 + Math.sin((i * 30 + 6) * Math.PI / 180) * 200} Z"/>`).join('');
    return svg('0 0 220 190', `<defs>
        ${lg('w' + u, [[0, '#c9773b'], [1, '#7a3f1d']])}${lg('g' + u, [[0, '#fff2a0'], [1, '#e09a00']])}
        ${rg('glow' + u, [[0, '#fff7c2', 0.95], [0.5, '#ffd34d', 0.5], [1, '#ffd34d', 0]])}
        <clipPath id="lid${u}"><path d="M40 96 L40 76 Q40 40 110 37 Q180 40 180 76 L180 96 Z"/></clipPath>
      </defs>
      <g class="chest-rays" fill="#fff6c2" opacity=".35">${rays}</g>
      <circle class="chest-glow" cx="110" cy="96" r="90" fill="url(#glow${u})"/>
      <g stroke="${O}" stroke-width="4" stroke-linejoin="round">
        <rect x="40" y="92" width="140" height="74" rx="8" fill="url(#w${u})"/>
        <path d="M44 128 L176 128" stroke-width="2.4" opacity=".5"/>
        <rect x="58" y="92" width="16" height="74" fill="url(#g${u})" stroke-width="3"/>
        <rect x="146" y="92" width="16" height="74" fill="url(#g${u})" stroke-width="3"/>
        <rect x="36" y="156" width="148" height="12" rx="5" fill="url(#g${u})" stroke-width="3"/>
      </g>
      <g class="chest-lid">
        <path d="M40 96 L40 76 Q40 40 110 37 Q180 40 180 76 L180 96 Z" fill="url(#w${u})" stroke="${O}" stroke-width="4" stroke-linejoin="round"/>
        <g clip-path="url(#lid${u})" fill="url(#g${u})" stroke="${O}" stroke-width="3">
          <rect x="58" y="30" width="16" height="70"/><rect x="146" y="30" width="16" height="70"/>
        </g>
        <path d="M52 62 Q110 46 168 62" fill="none" stroke="#fff" stroke-width="3" opacity=".3" stroke-linecap="round"/>
        <rect x="36" y="88" width="148" height="12" rx="5" fill="url(#g${u})" stroke="${O}" stroke-width="3"/>
        <circle cx="110" cy="58" r="7" fill="#ff4a8a" stroke="${O}" stroke-width="2.6"/>
        <circle cx="108" cy="56" r="2" fill="#fff"/>
      </g>
      <g stroke="${O}" stroke-width="3" stroke-linejoin="round">
        <rect x="95" y="86" width="30" height="32" rx="7" fill="url(#g${u})"/>
        <circle cx="110" cy="99" r="4.6" fill="${O}" stroke="none"/><path d="M107.5 101 L112.5 101 L111.5 110 L108.5 110 Z" fill="${O}" stroke="none"/>
      </g>
      ${sparkle(30, 70, 8)}${sparkle(196, 54, 7)}${sparkle(186, 130, 5, '#fff7c2')}${sparkle(24, 140, 5, '#fff7c2')}`, cls);
  }

  /* ---------------------------------------------------------
   *  小物アイコン
   * --------------------------------------------------------- */
  function coin(cls = 'coin-art') {
    const u = uid();
    return svg('0 0 32 32', `<defs>${lg('c' + u, [[0, '#fff3a0'], [0.5, '#ffd23d'], [1, '#e09a00']], 0, 0, 1, 1)}</defs>
      <circle cx="16" cy="16" r="13.5" fill="url(#c${u})" stroke="#8a5500" stroke-width="2"/>
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="#b87800" stroke-width="1.6" opacity=".7"/>
      <polygon points="${starPts(16, 16.5, 6, 2.6)}" fill="#fff6c2" stroke="#b87800" stroke-width="1"/>`, cls);
  }

  const NAV = {
    gacha() {
      const u = uid();
      return `<defs>${lg('w' + u, [[0, '#ff9a5a'], [1, '#c4502a']])}</defs>
      <g stroke="${O}" stroke-width="2.6" stroke-linejoin="round">
        <rect x="8" y="22" width="32" height="18" rx="3" fill="url(#w${u})"/>
        <path d="M8 24 L8 18 Q8 8 24 8 Q40 8 40 18 L40 24 Z" fill="#ff7a59"/>
        <rect x="14" y="8" width="5" height="32" fill="#ffd34d" stroke-width="2"/><rect x="29" y="8" width="5" height="32" fill="#ffd34d" stroke-width="2"/>
        <rect x="20" y="19" width="8" height="10" rx="2" fill="#ffd34d"/>
      </g>${sparkle(42, 8, 4.5)}`;
    },
    lobby() {
      const sword = (rot) => `<g transform="rotate(${rot} 24 24)" stroke="${O}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
        <path d="M24 3 L28 8 L28 30 L20 30 L20 8 Z" fill="#e8eef8"/><rect x="15" y="29" width="18" height="5" rx="2" fill="#ffd34d"/>
        <rect x="21.5" y="34" width="5" height="9" rx="2" fill="#7a4a2a"/></g>`;
      return sword(-38) + sword(38);
    },
    equip() {
      const u = uid();
      return `<defs>${lg('s' + u, [[0, '#7fd0ff'], [1, '#2f6fd6']])}</defs>
      <g stroke="${O}" stroke-width="2.6" stroke-linejoin="round">
        <path d="M24 4 L41 10 Q42 32 24 44 Q6 32 7 10 Z" fill="url(#s${u})"/>
        <path d="M24 10 L35 14 Q35 30 24 38 Q13 30 13 14 Z" fill="none" stroke="#fff" stroke-width="2" opacity=".6"/>
        <polygon points="${starPts(24, 24, 9, 4)}" fill="#ffd34d" stroke-width="2"/>
      </g>`;
    },
  };
  function navIcon(key) { return svg('0 0 48 48', NAV[key](), 'nav-art'); }

  /** ロビー参加画面の 4 人イラスト */
  function squad() {
    const cols = DS.config.PLAYER_COLORS;
    const pos = [[6, 34, 92], [74, 22, 104], [150, 22, 104], [222, 34, 92]];
    return svg('0 0 320 170', `
      <ellipse cx="160" cy="160" rx="150" ry="10" fill="#000" opacity=".15"/>
      ${pos.map(([x, y, w], i) => `<svg x="${x}" y="${y}" width="${w}" height="${w * 140 / 120}" viewBox="0 0 120 140">${heroBody(cols[i])}</svg>`).join('')}
      ${sparkle(20, 24, 7)}${sparkle(300, 20, 8)}${sparkle(160, 12, 6, '#fff7c2')}`, 'squad-art');
  }

  function crown(cls = 'crown-art') {
    return svg('0 0 32 24', `<path d="M3 20 L5 6 L11 13 L16 3 L21 13 L27 6 L29 20 Z" fill="#ffd34d" stroke="${O}" stroke-width="2.2" stroke-linejoin="round"/><circle cx="16" cy="15" r="2.4" fill="#ff4a5e"/>`, cls);
  }

  /** ロビー画面の背景（空・雲・丘） */
  function lobbyBg() {
    return svg('0 0 400 800', `
      ${cloud(20, 120, 1.4)}${cloud(250, 90, 1.1)}${cloud(300, 250, 0.8, '#fff', 0.7)}${cloud(-10, 330, 0.9, '#fff', 0.6)}
      ${sparkle(360, 150, 7, '#fff', 0.8)}${sparkle(60, 230, 5, '#fff', 0.7)}${sparkle(330, 380, 5, '#fff', 0.6)}
      <path d="M0 640 Q80 590 170 626 Q260 580 400 620 L400 800 L0 800 Z" fill="#7fd36b"/>
      ${tree(40, 640, 1.2, '#3cb44b')}${tree(360, 630, 1.4, '#2f9e44')}${tree(320, 640, 0.9, '#3cb44b')}
      <path d="M0 690 Q100 650 200 684 Q300 650 400 686 L400 800 L0 800 Z" fill="#4fb24a" stroke="${O}" stroke-width="3"/>
      <g fill="#ff6b8a"><circle cx="60" cy="720" r="4"/><circle cx="330" cy="740" r="4"/></g>
      <g fill="#ffe066"><circle cx="90" cy="740" r="3.5"/><circle cx="300" cy="714" r="3.5"/></g>`, 'lobby-bg-art')
      .replace('<svg ', '<svg preserveAspectRatio="xMidYMax slice" ');
  }

  DS.art = { item, hero, heroFace, stage, chest, coin, navIcon, squad, crown, sparkle, starPts, lobbyBg };
})();
