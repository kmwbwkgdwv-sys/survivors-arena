/* =========================================================
 *  charArt.js  ― キャラクターのイラスト（SVG、viewBox 0 0 120 140）
 *  主人公と同じ体の作りで、髪型・服・小物を組み合わせて描きます。
 *  ダック（アヒル）とラージ（ロボット）は専用の絵です。
 * ========================================================= */
(function () {
  const O = '#231a3a';
  const G = (b, sw = 3) => `<g stroke="${O}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round">${b}</g>`;
  const SHADOW = '<ellipse cx="60" cy="133" rx="30" ry="6" fill="#000" opacity=".22"/>';

  /* ---------- 髪 ---------- */
  const HAIR_BACK = {
    long: (c) => `<path d="M26 44 Q14 84 22 108 Q30 112 38 106 L40 70 L80 70 L82 106 Q90 112 98 108 Q106 84 94 44 Z" fill="${c}"/>`,
    bob: (c) => `<path d="M24 46 Q20 76 30 86 L90 86 Q100 76 96 46 Z" fill="${c}"/>`,
    pony: (c) => `<path d="M88 30 Q112 40 108 72 Q104 92 96 100 Q100 76 92 58 Z" fill="${c}"/>`,
  };
  const HAIR_FRONT = {
    short: (c) => `<path d="M26 50 Q24 16 60 13 Q96 16 94 50 Q90 34 80 30 Q70 38 56 34 Q44 40 34 34 Q28 42 26 50 Z" fill="${c}"/>`,
    slick: (c) => `<path d="M27 48 Q24 14 62 11 Q98 15 94 48 Q90 30 76 26 Q60 22 46 28 Q32 32 27 48 Z" fill="${c}"/>
      <path d="M44 20 Q60 14 80 20" fill="none" stroke="rgba(255,255,255,.45)" stroke-width="2.4"/>`,
    bangs: (c) => `<path d="M26 54 Q22 14 60 12 Q98 14 94 54 Q90 38 82 30 L76 41 L68 29 Q58 37 48 30 L42 41 L37 32 Q30 40 26 54 Z" fill="${c}"/>`,
    side: (c) => `<path d="M26 54 Q22 14 60 12 Q98 14 94 50 Q86 30 70 30 Q52 32 40 46 Q34 52 26 54 Z" fill="${c}"/>`,
    spiky: (c) => `<path d="M26 50 L22 30 L34 34 L36 16 L48 26 L58 10 L66 26 L80 14 L82 30 L96 28 L94 50 Q86 34 60 34 Q36 34 26 50 Z" fill="${c}"/>`,
  };

  /* ---------- 目 ---------- */
  const EYES = {
    normal: () => `<ellipse cx="47" cy="57" rx="4.6" ry="6.4" fill="${O}"/><ellipse cx="73" cy="57" rx="4.6" ry="6.4" fill="${O}"/>
      <circle cx="48.6" cy="54.6" r="1.8" fill="#fff"/><circle cx="74.6" cy="54.6" r="1.8" fill="#fff"/>`,
    calm: () => `<path d="M41 57 Q47 52 53 57 Q47 60 41 57 Z M67 57 Q73 52 79 57 Q73 60 67 57 Z" fill="${O}"/>
      <path d="M39 48 L53 47 M67 47 L81 48" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`,
    sharp: (iris = O) => `<path d="M40 58 Q46 50 54 54 Q50 60 40 58 Z M80 58 Q74 50 66 54 Q70 60 80 58 Z" fill="#fff" stroke="${O}" stroke-width="2"/>
      <circle cx="48" cy="56" r="2.8" fill="${iris}"/><circle cx="72" cy="56" r="2.8" fill="${iris}"/>
      <path d="M38 48 L54 51 M82 48 L66 51" stroke="${O}" stroke-width="3" stroke-linecap="round"/>`,
    shades: () => `<path d="M34 51 L86 51 L84 60 Q76 66 66 60 L62 55 L58 55 L54 60 Q44 66 36 60 Z" fill="#1d1a2e" stroke="${O}" stroke-width="2"/>
      <path d="M40 54 L48 54" stroke="#8fd6ff" stroke-width="2" stroke-linecap="round"/>`,
    bright: () => `<ellipse cx="47" cy="57" rx="5.2" ry="7" fill="${O}"/><ellipse cx="73" cy="57" rx="5.2" ry="7" fill="${O}"/>
      <circle cx="49" cy="54" r="2.2" fill="#fff"/><circle cx="75" cy="54" r="2.2" fill="#fff"/><circle cx="45.5" cy="60" r="1" fill="#fff"/><circle cx="71.5" cy="60" r="1" fill="#fff"/>
      <path d="M41 49 Q47 46 52 48 M68 48 Q73 46 79 49" fill="none" stroke="${O}" stroke-width="2" stroke-linecap="round"/>`,
  };

  /* ---------- 体（主人公と同じ形） ---------- */
  function body(o) {
    const skin = o.skin || '#ffd9b8';
    const top = o.top, arm = o.arm || o.top, pants = o.pants || '#3b3f63', shoes = o.shoes || '#2a2140';
    return `${SHADOW}
      ${o.back || ''}
      ${G(`<rect x="46" y="106" width="11" height="21" rx="4" fill="${pants}"/>
        <rect x="63" y="106" width="11" height="21" rx="4" fill="${pants}"/>
        <ellipse cx="50" cy="128" rx="9.5" ry="5.5" fill="${shoes}"/>
        <ellipse cx="70" cy="128" rx="9.5" ry="5.5" fill="${shoes}"/>
        <ellipse cx="33" cy="95" rx="7" ry="12" fill="${arm}" transform="rotate(14 33 95)"/>
        <ellipse cx="87" cy="95" rx="7" ry="12" fill="${arm}" transform="rotate(-14 87 95)"/>
        <circle cx="31" cy="107" r="6" fill="${o.glove || skin}"/>
        <circle cx="89" cy="107" r="6" fill="${o.glove || skin}"/>
        <path d="M38 84 Q60 74 82 84 L84 112 Q60 118 36 112 Z" fill="${top}"/>`)}
      ${o.outfit || ''}
      ${o.hairBack ? G(o.hairBack) : ''}
      ${G(`<circle cx="60" cy="50" r="34" fill="${skin}"/>`)}
      ${o.face || ''}
      ${o.beard ? G(o.beard, 2.4) : ''}
      ${o.eyes || EYES.normal()}
      ${o.noCheek ? '' : `<ellipse cx="38" cy="67" rx="5.5" ry="3.2" fill="#ff8f9a" opacity="${o.cheek || 0.55}"/><ellipse cx="82" cy="67" rx="5.5" ry="3.2" fill="#ff8f9a" opacity="${o.cheek || 0.55}"/>`}
      ${o.mouth || `<path d="M54 69 Q60 74 66 69" fill="none" stroke="${O}" stroke-width="2.6" stroke-linecap="round"/>`}
      ${o.hairFront ? G(o.hairFront) : ''}
      ${o.hat ? G(o.hat) : ''}
      ${o.item ? G(o.item) : ''}`;
  }

  const CHARS = {
    // コモン：スモーク（髭のイケおじ）
    smoke: () => body({
      top: '#8a5a33', arm: '#8a5a33', pants: '#36507a',
      outfit: G(`<path d="M52 80 L60 96 L68 80 Q60 84 52 80 Z" fill="#f4efe6"/><path d="M60 96 L60 112" stroke-width="2"/>`, 2.4),
      hairFront: HAIR_FRONT.slick('#5a3b26'),
      beard: `<path d="M30 56 Q30 84 60 88 Q90 84 90 56 Q86 70 76 70 Q66 76 60 72 Q54 76 44 70 Q34 70 30 56 Z" fill="#5a3b26"/>`,
      eyes: EYES.calm(),
      mouth: `<path d="M52 72 Q60 70 68 72" fill="none" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>`,
      noCheek: true,
    }),
    // コモン：ジャスパー（オレンジ髪のスパイ）
    jasper: () => body({
      top: '#2b2b3d', arm: '#2b2b3d', pants: '#2b2b3d', glove: '#2b2b3d',
      outfit: G(`<path d="M37 103 Q60 108 83 103 L83 109 Q60 114 37 109 Z" fill="#6b5a44"/><rect x="66" y="102" width="9" height="9" rx="2" fill="#ffd34d" stroke-width="2"/>`, 2.4),
      hairBack: HAIR_BACK.bob('#ff8a2e'),
      hairFront: HAIR_FRONT.side('#ff8a2e'),
      eyes: EYES.shades(),
      mouth: `<path d="M55 71 Q61 72 66 69" fill="none" stroke="${O}" stroke-width="2.4" stroke-linecap="round"/>`,
    }),
    // アンコモン：ジョンソン（白髪のイケおじ）
    johnson: () => body({
      top: '#2d3b6e', arm: '#2d3b6e', pants: '#2d3b6e',
      outfit: G(`<path d="M50 80 L60 92 L70 80 Q60 84 50 80 Z" fill="#fff"/><path d="M58 86 L62 86 L64 104 L60 108 L56 104 Z" fill="#e8394d" stroke-width="2"/>`, 2.4),
      hairFront: HAIR_FRONT.slick('#eceff4'),
      beard: `<path d="M46 66 Q53 61 60 65 Q67 61 74 66 Q67 71 60 68 Q53 71 46 66 Z" fill="#eceff4"/>`,
      eyes: EYES.calm(),
      mouth: `<path d="M55 73 Q60 75 65 73" fill="none" stroke="${O}" stroke-width="2.2" stroke-linecap="round"/>`,
      noCheek: true,
    }),
    // アンコモン：ジェイ（青い髪の怖いお姉さん）
    jay: () => body({
      top: '#1f1f2e', arm: '#1f1f2e', pants: '#2e2e44',
      outfit: G(`<path d="M50 82 L60 98 L70 82 Q60 86 50 82 Z" fill="#a74dff"/><path d="M40 90 L50 84 M80 90 L70 84" stroke="#5a5a7a" stroke-width="2"/>`, 2.4),
      hairBack: HAIR_BACK.long('#2f7bf0'),
      hairFront: HAIR_FRONT.bangs('#2f7bf0'),
      eyes: EYES.sharp('#7a2fd0'),
      mouth: `<path d="M54 70 Q60 73 66 70 Q60 71 54 70 Z" fill="#d6264a" stroke="#d6264a" stroke-width="2" stroke-linejoin="round"/>`,
      cheek: 0.3,
    }),
    // レア：ウィドウ（黒い服の怖い女性）
    widow: () => body({
      top: '#1a1626', arm: '#1a1626', pants: '#1a1626', glove: '#1a1626',
      back: G(`<path d="M28 84 Q12 112 20 131 L100 131 Q108 112 92 84 Z" fill="#2c2440"/>`) +
        `<path d="M60 92 L28 128 M60 92 L60 131 M60 92 L92 128 M36 120 Q60 110 84 120 M44 108 Q60 101 76 108" stroke="#6b5a92" stroke-width="1.5" fill="none"/>`,
      outfit: G(`<path d="M40 82 Q60 92 80 82 L80 88 Q60 98 40 88 Z" fill="#2c2440"/><circle cx="60" cy="96" r="5" fill="#d6264a" stroke-width="2"/>
        <path d="M60 90 L60 102 M54 93 L66 99 M66 93 L54 99" stroke="#1a1626" stroke-width="1.6"/>`, 2.4),
      hairBack: HAIR_BACK.long('#1d1b26'),
      hairFront: HAIR_FRONT.bangs('#1d1b26'),
      eyes: EYES.sharp('#e8394d'),
      mouth: `<path d="M54 70 Q60 72 66 70" fill="none" stroke="#8f1d38" stroke-width="3" stroke-linecap="round"/>`,
      cheek: 0.2,
      hat: `<path d="M30 30 Q60 8 90 30 Q60 22 30 30 Z" fill="#1a1626"/><path d="M34 32 Q60 44 86 32" fill="none" stroke="#3d3550" stroke-width="1.5" stroke-dasharray="2 2"/>`,
    }),
    // エピック：フレイヤ（茶髪の弓使い）
    freya: () => body({
      top: '#3f8f4a', arm: '#3f8f4a', pants: '#5a4026',
      back: G(`<path d="M30 82 Q14 108 22 130 L98 130 Q106 108 90 82 Z" fill="#2f7a3c"/>
          <path d="M22 130 L30 120 L38 131 L46 121 L54 131 L62 121 L70 131 L78 121 L86 131 L94 121 L98 130" fill="#4fae5a" stroke-width="2"/>
          <rect x="18" y="58" width="12" height="40" rx="4" fill="#8a5a33" transform="rotate(-18 24 78)"/>`) +
        `<path d="M14 58 L20 46 M20 60 L28 48 M26 62 L34 50" stroke="#bff7ff" stroke-width="3" stroke-linecap="round"/>
         <circle cx="20" cy="46" r="3" fill="#7ff0ff"/><circle cx="28" cy="48" r="3" fill="#7ff0ff"/><circle cx="34" cy="50" r="3" fill="#7ff0ff"/>` +
        G(`<path d="M86 56 Q108 90 86 124" fill="none" stroke-width="7"/><path d="M86 56 Q108 90 86 124" fill="none" stroke="#e0a82e" stroke-width="3.6"/><path d="M86 56 L86 124" stroke="#fff6c2" stroke-width="1.4"/>`),
      hat: `<path d="M34 30 Q60 18 86 30" fill="none" stroke="#ffd34d" stroke-width="4"/><path d="M56 24 L60 16 L64 24 L60 28 Z" fill="#7ff0ff" stroke-width="2"/>`,
      outfit: G(`<path d="M37 103 Q60 108 83 103 L83 109 Q60 114 37 109 Z" fill="#6b4423"/><path d="M48 82 L60 92 L72 82" fill="none" stroke="#ffd34d" stroke-width="2.4"/>`, 2.4),
      hairBack: HAIR_BACK.pony('#8a5a33'),
      hairFront: HAIR_FRONT.side('#8a5a33'),
      eyes: EYES.bright(),
    }),
    // レジェンド：ソード（金髪の女性剣士）
    sword: () => body({
      top: '#c9d4e6', arm: '#3c6ee0', pants: '#2d3b6e',
      back: G(`<path d="M28 82 Q14 110 20 131 L100 131 Q106 110 92 82 Z" fill="#2f5fd0"/><path d="M20 131 Q60 124 100 131" fill="none" stroke="#ffd34d" stroke-width="4"/>`),
      outfit: G(`<path d="M42 86 Q60 80 78 86 L76 104 Q60 110 44 104 Z" fill="#e9eef6"/><path d="M60 86 L60 106" stroke-width="2"/><circle cx="60" cy="92" r="4" fill="#4fd0ff" stroke-width="1.8"/>
        <ellipse cx="34" cy="86" rx="13" ry="9" fill="#e9eef6"/><ellipse cx="86" cy="86" rx="13" ry="9" fill="#e9eef6"/>
        <path d="M23 86 Q34 80 45 86 M75 86 Q86 80 97 86" fill="none" stroke="#ffd34d" stroke-width="2.6"/>`, 2.4),
      hat: `<path d="M38 26 L44 16 L52 24 L60 12 L68 24 L76 16 L82 26 Q60 20 38 26 Z" fill="#ffd34d"/><circle cx="60" cy="21" r="3" fill="#4fd0ff" stroke-width="1.6"/>`,
      hairBack: HAIR_BACK.long('#ffd75e'),
      hairFront: HAIR_FRONT.bangs('#ffd75e'),
      eyes: EYES.bright(),
      item: `<path d="M96 106 L116 52" stroke="#5fe9ff" stroke-width="14" opacity=".35"/><path d="M96 106 L116 52" stroke-width="7"/><path d="M96 106 L116 52" stroke="#f2ffff" stroke-width="3.6"/>
        <path d="M89 102 L103 110" stroke-width="5"/><path d="M89 102 L103 110" stroke="#ffd34d" stroke-width="2.4"/>`,
    }),
    // レジェンド：ガンマン（西部のガンマン）
    gunman: () => body({
      skin: '#9a6440', top: '#a8452e', arm: '#3b2a20', pants: '#4a3a2e', shoes: '#3b2416',
      back: G(`<path d="M32 86 L20 131 L48 127 L60 112 L72 127 L100 131 L88 86 Z" fill="#3b2a20"/>`) +
        G(`<path d="M70 80 Q92 82 104 96 Q92 92 84 94 Q90 100 96 112 Q82 102 74 90 Z" fill="#d6264a"/>`, 2.4),
      outfit: G(`<path d="M34 86 L60 100 L86 86 L84 98 L60 110 L36 98 Z" fill="#d9a441"/><path d="M40 92 L46 96 M52 98 L56 100 M64 100 L68 98 M74 96 L80 92" stroke="#7a4a22" stroke-width="2"/>
        <path d="M40 80 Q60 90 80 80 L80 86 Q60 96 40 86 Z" fill="#d6264a"/>
        <polygon points="${DS.art.starPts(46, 100, 6, 2.6)}" fill="#ffd34d" stroke-width="1.6"/>`, 2.4),
      hairFront: HAIR_FRONT.short('#2a1a12'),
      beard: `<path d="M34 62 Q36 82 60 84 Q84 82 86 62 Q80 74 72 74 Q66 78 60 76 Q54 78 48 74 Q40 74 34 62 Z" fill="#2a1a12" opacity=".85"/>`,
      eyes: EYES.calm(),
      mouth: `<path d="M53 74 Q61 73 67 71" fill="none" stroke="#f3e2c0" stroke-width="2.2" stroke-linecap="round"/>`,
      noCheek: true,
      hat: `<path d="M12 34 Q60 46 108 34 Q100 42 60 44 Q20 42 12 34 Z" fill="#5a3418"/><path d="M32 36 Q30 8 60 8 Q90 8 88 36 Q60 30 32 36 Z" fill="#6b4423"/><path d="M33 30 Q60 24 87 30" fill="none" stroke="#ffd34d" stroke-width="3.6"/>`,
      item: `<path d="M86 104 L106 97 L108 104 L92 110 Z" fill="#ffd34d"/><path d="M88 106 L86 117 L93 117 L95 108" fill="#7a4220"/>
        <path d="M34 104 L14 97 L12 104 L28 110 Z" fill="#ffd34d"/><path d="M32 106 L34 117 L27 117 L25 108" fill="#7a4220"/>`,
    }),
    // レア：ダック（二足歩行のアヒル）
    duck: () => `${SHADOW}
      ${G(`<path d="M44 118 L44 126 M76 118 L76 126" stroke="#ff9a1e" stroke-width="5"/>
        <path d="M34 128 L52 128 L44 120 Z M68 128 L86 128 L76 120 Z" fill="#ff9a1e"/>
        <ellipse cx="60" cy="96" rx="34" ry="28" fill="#ffd93d"/>
        <path d="M26 92 Q14 98 20 110 Q28 104 34 100 Z M94 92 Q106 98 100 110 Q92 104 86 100 Z" fill="#ffc21a"/>
        <circle cx="60" cy="48" r="28" fill="#ffd93d"/>
        <path d="M58 22 Q60 10 70 14 Q64 16 64 22" fill="#ffd93d"/>
        <path d="M60 60 Q84 54 90 62 Q84 72 60 68 Z" fill="#ff9a1e"/>
        <path d="M40 72 Q60 84 80 72 L82 80 Q60 92 38 80 Z" fill="#ff4a5e"/>
        <path d="M44 80 L30 100 L42 98 L48 84 Z" fill="#ff4a5e"/>
        <path d="M42 26 L78 26 L76 33 Q68 36 63 31 L57 31 Q52 36 44 33 Z" fill="#1d1a2e"/>`)}
      <path d="M62 64 L86 63" stroke="${O}" stroke-width="2" stroke-linecap="round"/>
      <ellipse cx="50" cy="44" rx="4.6" ry="6" fill="${O}"/><ellipse cx="72" cy="44" rx="4.6" ry="6" fill="${O}"/>
      <circle cx="51.6" cy="42" r="1.8" fill="#fff"/><circle cx="73.6" cy="42" r="1.8" fill="#fff"/>
      <ellipse cx="40" cy="56" rx="5" ry="3" fill="#ff8f9a" opacity=".6"/>
      <path d="M46 92 Q60 100 74 92" fill="none" stroke="#fff" stroke-width="3" opacity=".5" stroke-linecap="round"/>`,
    // レア：キティース（服を着た二足歩行の猫）
    kitties: () => `${SHADOW}
      ${G(`<path d="M86 118 Q112 112 104 84 Q100 76 96 84 Q102 104 84 110 Z" fill="#f2a95a"/>
        <rect x="46" y="108" width="11" height="19" rx="4" fill="#f2a95a"/>
        <rect x="63" y="108" width="11" height="19" rx="4" fill="#f2a95a"/>
        <ellipse cx="50" cy="128" rx="9" ry="5" fill="#fff4e6"/><ellipse cx="70" cy="128" rx="9" ry="5" fill="#fff4e6"/>
        <ellipse cx="33" cy="95" rx="7" ry="12" fill="#ffffff" transform="rotate(14 33 95)"/>
        <ellipse cx="87" cy="95" rx="7" ry="12" fill="#ffffff" transform="rotate(-14 87 95)"/>
        <circle cx="31" cy="107" r="6" fill="#fff4e6"/><circle cx="89" cy="107" r="6" fill="#fff4e6"/>
        <path d="M38 82 Q60 72 82 82 L84 114 Q60 120 36 114 Z" fill="#ffffff"/>
        <path d="M60 80 L60 114" stroke-width="2"/>
        <path d="M24 30 L28 4 L48 20 Z M96 30 L92 4 L72 20 Z" fill="#f2a95a"/>
        <ellipse cx="60" cy="50" rx="36" ry="32" fill="#f2a95a"/>`)}
      <path d="M30 24 L31 10 L42 20 Z M90 24 L89 10 L78 20 Z" fill="#ffb3c1"/>
      <path d="M44 22 Q48 30 46 36 M60 18 L60 30 M76 22 Q72 30 74 36" stroke="#d9823a" stroke-width="3.6" fill="none" stroke-linecap="round"/>
      <ellipse cx="60" cy="64" rx="17" ry="12" fill="#fff4e6"/>
      <path d="M48 92 L54 92 L54 86 L60 86 L60 92 L66 92 L66 98 L60 98 L60 104 L54 104 L54 98 L48 98 Z" fill="#3ddc84" stroke="${O}" stroke-width="1.6" transform="translate(16 0)"/>
      <ellipse cx="46" cy="52" rx="5.4" ry="7" fill="${O}"/><ellipse cx="74" cy="52" rx="5.4" ry="7" fill="${O}"/>
      <ellipse cx="46" cy="52" rx="2" ry="5" fill="#7ad94a"/><ellipse cx="74" cy="52" rx="2" ry="5" fill="#7ad94a"/>
      <circle cx="47.6" cy="49" r="1.6" fill="#fff"/><circle cx="75.6" cy="49" r="1.6" fill="#fff"/>
      <path d="M56 60 L64 60 L60 65 Z" fill="#ff8fa3" stroke="${O}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M60 65 Q56 71 51 68 M60 65 Q64 71 69 68" fill="none" stroke="${O}" stroke-width="2" stroke-linecap="round"/>
      <path d="M40 62 L22 58 M40 66 L22 68 M80 62 L98 58 M80 66 L98 68" stroke="${O}" stroke-width="1.6" stroke-linecap="round"/>
      <g transform="translate(100 34) scale(.42)"><g stroke="${O}" stroke-width="3" stroke-linecap="round">
        <path d="M-14 -10 L14 10 M14 -10 L-14 10" stroke-width="5"/>
        <ellipse cx="-15" cy="-11" rx="8" ry="3" fill="#c9ffd9"/><ellipse cx="15" cy="-11" rx="8" ry="3" fill="#c9ffd9"/>
        <ellipse cx="-15" cy="11" rx="8" ry="3" fill="#c9ffd9"/><ellipse cx="15" cy="11" rx="8" ry="3" fill="#c9ffd9"/>
        <rect x="-10" y="-8" width="20" height="16" rx="6" fill="#fff"/></g>
        <path d="M-2.5 -6 L2.5 -6 L2.5 -2.5 L6 -2.5 L6 2.5 L2.5 2.5 L2.5 6 L-2.5 6 L-2.5 2.5 L-6 2.5 L-6 -2.5 L-2.5 -2.5 Z" fill="#3ddc84"/></g>`,
    // エピック：ラージ（二足歩行ロボット）
    large: () => `${SHADOW}
      <path d="M44 132 Q48 140 52 132 M68 132 Q72 140 76 132" fill="#ffb13d"/>
      ${G(`<rect x="34" y="70" width="52" height="16" rx="5" fill="#4a5068"/>
        <rect x="4" y="66" width="26" height="14" rx="5" fill="#6b7a94"/><rect x="0" y="69" width="10" height="8" rx="2" fill="#3a3f52"/>
        <rect x="90" y="66" width="26" height="14" rx="5" fill="#6b7a94"/><rect x="110" y="69" width="10" height="8" rx="2" fill="#3a3f52"/>`)}
      ${G(`<rect x="42" y="106" width="13" height="18" rx="3" fill="#6b7a94"/><rect x="65" y="106" width="13" height="18" rx="3" fill="#6b7a94"/>
        <rect x="38" y="122" width="20" height="9" rx="3" fill="#3a3f52"/><rect x="62" y="122" width="20" height="9" rx="3" fill="#3a3f52"/>
        <rect x="18" y="80" width="14" height="28" rx="6" fill="#8b9bb3"/><rect x="88" y="80" width="14" height="28" rx="6" fill="#8b9bb3"/>
        <circle cx="25" cy="112" r="7" fill="#3a3f52"/><circle cx="95" cy="112" r="7" fill="#3a3f52"/>
        <rect x="32" y="76" width="56" height="36" rx="10" fill="#a9b6ca"/>
        <circle cx="60" cy="94" r="8" fill="#4fe0ff"/>
        <path d="M60 14 L60 24" stroke-width="3"/>
        <rect x="28" y="22" width="64" height="52" rx="16" fill="#c9d4e6"/>
        <rect x="36" y="36" width="48" height="22" rx="10" fill="#1d2440"/>
        <rect x="22" y="40" width="8" height="16" rx="3" fill="#8b9bb3"/><rect x="90" y="40" width="8" height="16" rx="3" fill="#8b9bb3"/>`)}
      <circle cx="60" cy="12" r="5" fill="#ff4a5e" stroke="${O}" stroke-width="2.4"/>
      <rect x="42" y="42" width="12" height="9" rx="3" fill="#4fe0ff"/><rect x="66" y="42" width="12" height="9" rx="3" fill="#4fe0ff"/>
      <path d="M50 66 L70 66" stroke="${O}" stroke-width="3" stroke-linecap="round"/>
      <circle cx="60" cy="94" r="13" fill="#4fe0ff" opacity=".35"/>
      <circle cx="57" cy="91" r="2.6" fill="#fff"/>
      <path d="M36 82 L36 106 M84 82 L84 106" stroke="#4fe0ff" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M34 28 Q60 22 86 28" fill="none" stroke="#fff" stroke-width="2.4" opacity=".6" stroke-linecap="round"/>`,
  };

  /* ---------- レアリティが高いほど強そうに見せるオーラ ---------- */
  let auraSeq = 0;
  function aura(rarity) {
    const sp = DS.art.sparkle, u = 'au' + (++auraSeq).toString(36);
    if (rarity === 'rare') {
      return `<ellipse cx="60" cy="131" rx="40" ry="9" fill="#5aaeff" opacity=".45"/>${sp(14, 70, 4, '#bfe0ff', 0.9)}${sp(108, 52, 3.5, '#bfe0ff', 0.8)}`;
    }
    if (rarity === 'epic') {
      return `<defs><radialGradient id="${u}" cx="50%" cy="55%" r="50%"><stop offset="0" stop-color="#d7a4ff" stop-opacity=".75"/><stop offset=".6" stop-color="#a74dff" stop-opacity=".35"/><stop offset="1" stop-color="#a74dff" stop-opacity="0"/></radialGradient></defs>
        <ellipse cx="60" cy="78" rx="62" ry="70" fill="url(#${u})"/>
        <ellipse cx="60" cy="131" rx="44" ry="10" fill="#b56cff" opacity=".55"/>
        ${sp(10, 54, 5, '#f0dcff')}${sp(112, 40, 4.5, '#f0dcff')}${sp(104, 110, 3.5, '#f0dcff', 0.85)}
        <circle cx="16" cy="100" r="2.4" fill="#e6c8ff"/><circle cx="102" cy="78" r="2" fill="#e6c8ff"/>`;
    }
    if (rarity === 'legend') {
      const rays = Array.from({ length: 12 }, (_, i) => {
        const a1 = (i * 30 - 7) * Math.PI / 180, a2 = (i * 30 + 7) * Math.PI / 180;
        return `<path d="M60 76 L${(60 + Math.cos(a1) * 64).toFixed(1)} ${(76 + Math.sin(a1) * 64).toFixed(1)} L${(60 + Math.cos(a2) * 64).toFixed(1)} ${(76 + Math.sin(a2) * 64).toFixed(1)} Z"/>`;
      }).join('');
      return `<defs><radialGradient id="${u}" cx="50%" cy="55%" r="50%"><stop offset="0" stop-color="#fff6c2" stop-opacity=".95"/><stop offset=".55" stop-color="#ffd23d" stop-opacity=".45"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient></defs>
        <g fill="#ffe680" opacity=".38">${rays}</g>
        <ellipse cx="60" cy="78" rx="64" ry="72" fill="url(#${u})"/>
        <ellipse cx="60" cy="131" rx="48" ry="11" fill="#ffd23d" opacity=".6"/>
        <ellipse cx="60" cy="131" rx="48" ry="11" fill="none" stroke="#fff6c2" stroke-width="2"/>
        ${sp(8, 46, 6)}${sp(114, 34, 6)}${sp(110, 108, 4.5, '#fff6c2')}${sp(10, 112, 4.5, '#fff6c2')}${sp(60, 6, 4, '#fff6c2')}`;
    }
    return '';
  }
  const rarityOf = (key) => (DS.config.CHARACTERS[key] || {}).rarity;

  /** opt.aura === false でオーラなし */
  function charSvg(key, cls = 'char-art', opt = {}) {
    const f = CHARS[key];
    if (!f) return DS.art.hero(DS.config.PLAYER_COLORS[0], cls);
    const vb = opt.aura === false ? '0 0 120 140' : '-6 -6 132 146';
    return `<svg class="${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${opt.aura === false ? '' : aura(rarityOf(key))}${f()}</svg>`;
  }
  function charFace(key, cls = 'face-art') {
    const f = CHARS[key];
    if (!f) return DS.art.heroFace(DS.config.PLAYER_COLORS[0], cls);
    return `<svg class="${cls}" viewBox="22 8 80 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${f()}</svg>`;
  }

  /* ---------- 特殊スキルのボタン模様（viewBox 0 0 64 64） ---------- */
  const SKILL_ICON = {
    widow: `<circle cx="32" cy="32" r="22" fill="none" stroke="#e9e3ff" stroke-width="2.4"/>
      <path d="M32 10 L32 54 M10 32 L54 32 M16 16 L48 48 M48 16 L16 48" stroke="#e9e3ff" stroke-width="2"/>
      <circle cx="32" cy="32" r="12" fill="none" stroke="#e9e3ff" stroke-width="2"/>
      <circle cx="32" cy="32" r="6" fill="#e8394d" stroke="${O}" stroke-width="2"/>`,
    duck: `<path d="M14 40 L30 40 M10 32 L28 32 M14 24 L30 24" stroke="#fff" stroke-width="4" stroke-linecap="round"/>
      <path d="M30 46 Q30 16 50 18 Q58 22 52 30 Q60 36 54 46 Z" fill="#ffd93d" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M50 24 L60 24 L52 28 Z" fill="#ff9a1e" stroke="${O}" stroke-width="2"/>`,
    large: `<path d="M32 8 L52 16 Q52 40 32 56 Q12 40 12 16 Z" fill="#5fb6ef" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M32 16 L44 21 Q44 37 32 47 Q20 37 20 21 Z" fill="none" stroke="#fff" stroke-width="2.4" opacity=".8"/>`,
    freya: `<path d="M14 50 Q10 22 34 12" fill="none" stroke="#c98a3a" stroke-width="4" stroke-linecap="round"/>
      <path d="M14 50 L34 12" stroke="#fff" stroke-width="1.6"/>
      <path d="M22 40 L52 14 M30 46 L56 24 M18 30 L44 8" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <path d="M52 14 L46 14 L52 20 Z M56 24 L50 24 L56 30 Z M44 8 L38 8 L44 14 Z" fill="#ffd34d" stroke="#ffd34d" stroke-width="2" stroke-linejoin="round"/>`,
    gunman: `<circle cx="32" cy="32" r="20" fill="#9aa6ba" stroke="${O}" stroke-width="3"/>
      ${[0, 60, 120, 180, 240, 300].map((a) => `<circle cx="${32 + Math.cos(a * Math.PI / 180) * 11}" cy="${32 + Math.sin(a * Math.PI / 180) * 11}" r="4.4" fill="#ffd34d" stroke="${O}" stroke-width="2"/>`).join('')}
      <circle cx="32" cy="32" r="3" fill="${O}"/>`,
    kitties: `<g transform="translate(32 30) scale(1.15)"><g stroke="${O}" stroke-width="2.6" stroke-linecap="round">
        <path d="M-14 -10 L14 10 M14 -10 L-14 10" stroke-width="4"/>
        <ellipse cx="-15" cy="-11" rx="8" ry="3" fill="#c9ffd9"/><ellipse cx="15" cy="-11" rx="8" ry="3" fill="#c9ffd9"/>
        <ellipse cx="-15" cy="11" rx="8" ry="3" fill="#c9ffd9"/><ellipse cx="15" cy="11" rx="8" ry="3" fill="#c9ffd9"/>
        <rect x="-10" y="-8" width="20" height="16" rx="6" fill="#fff"/></g>
        <path d="M-2.5 -6 L2.5 -6 L2.5 -2.5 L6 -2.5 L6 2.5 L2.5 2.5 L2.5 6 L-2.5 6 L-2.5 2.5 L-6 2.5 L-6 -2.5 L-2.5 -2.5 Z" fill="#3ddc84"/></g>`,
    sword: `<path d="M18 50 L46 14" stroke="#e9f3ff" stroke-width="6" stroke-linecap="round"/>
      <path d="M12 44 L24 54 M16 48 L10 56" stroke="#ffd34d" stroke-width="4" stroke-linecap="round"/>`,
  };
  function skillButtonIcon(key) {
    return `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">${SKILL_ICON[key] || ''}</svg>`;
  }

  /* ---------- ダンボールと回復アイテム ---------- */
  const PROPS = {
    box: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 60 60">
      <ellipse cx="0" cy="24" rx="26" ry="5" fill="#000" opacity=".22"/>
      <g stroke="${O}" stroke-width="2.8" stroke-linejoin="round">
        <path d="M-24 -8 L0 -18 L24 -8 L24 18 L0 26 L-24 18 Z" fill="#c98a4a"/>
        <path d="M-24 -8 L0 2 L24 -8 M0 2 L0 26" fill="none"/>
        <path d="M-24 -8 L0 -18 L24 -8 L0 2 Z" fill="#dda25e"/>
        <path d="M-12 -13 L12 -3" stroke="#f3e2c0" stroke-width="5"/>
      </g>
      <path d="M-18 6 L-6 11 M-18 12 L-10 15" stroke="#8a5a2b" stroke-width="2" stroke-linecap="round"/></svg>`,
    heal: () => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-30 -30 60 60">
      <ellipse cx="0" cy="22" rx="16" ry="4" fill="#000" opacity=".2"/>
      <path d="M0 18 Q-22 4 -22 -8 Q-22 -20 -10 -20 Q-3 -20 0 -12 Q3 -20 10 -20 Q22 -20 22 -8 Q22 4 0 18 Z" fill="#ff4a5e" stroke="${O}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M-4 -10 L4 -10 L4 -4 L10 -4 L10 4 L4 4 L4 10 L-4 10 L-4 4 L-10 4 L-10 -4 L-4 -4 Z" fill="#fff"/>
      <path d="M-15 -12 Q-13 -16 -8 -16" stroke="#fff" stroke-width="2.4" fill="none" stroke-linecap="round" opacity=".7"/></svg>`,
  };

  Object.assign(DS.art, {
    charSvg, charFace, skillButtonIcon,
    charRaw: (key) => (CHARS[key] ? CHARS[key]() : null),
    boxSvg: PROPS.box, healSvg: PROPS.heal,
  });
})();
