/* =========================================================
 *  game/gameConfig.js  ― バトルの設定値（敵・ボス・スキル・経験値）
 *  距離の単位は「ゲーム内ピクセル」。プレイヤーの半径が 20（直径40＝プレイヤー1人分）。
 *  時間の単位は秒。ダメージ倍率は「自分のATK × 倍率」。
 * ========================================================= */
window.DS = window.DS || {};

DS.gameConfig = {
  // ---- 試合の流れ ----
  MATCH_SECONDS: 480,          // 8分
  MIDBOSS_TIMES: [180, 360],   // 3分と6分に中ボス
  ALTAR: { radius: 230, countdown: 5 },   // ボスの祭壇：全員が入ると5秒カウントダウン

  // ---- マップ（とても広い） ----
  WORLD: { w: 9000, h: 9000 },
  VIEW_LONG_SIDE: 900,         // 画面の長い辺に映る距離

  // ---- プレイヤー ----
  PLAYER: {
    radius: 20,
    baseSpeed: 210,            // 装備の「速度100」のときの移動速度
    reviveRadius: 70,          // この範囲に仲間が留まると復活
    reviveSeconds: 3,
    reviveHpRatio: 0.5,
  },

  // ---- 敵の強さ ----
  STAGE_ATK_MULT: 1.5,         // ステージが1つ進むごとに敵の攻撃力 ×1.5
  // ステージごとの雑魚敵・中ボスの体力倍率（ステージ1〜5）。
  // そのステージに見合う装備がないと、雑魚敵でもワンパンできなくなる。
  STAGE_HP_MULT: [1, 7, 14, 23, 33],
  // 試合時間で雑魚の体力を増やしたい時はこの値を上げる（0.1 で1分ごとに+10%）
  ENEMY_HP_GROWTH_PER_MIN: 0,
  MAX_ENEMIES: 240,
  // 画面にいる敵の目標数 = base + perMin × 経過分（× 人数補正）。interval 秒ごとに群れを出す
  SPAWN: { base: 8, perMin: 16, interval: 0.3, packFullAt: 240 },   // 群れの大きさは packFullAt 秒で最大

  // ---- 難易度：1人討伐は1倍、パーティー討伐は3倍 ----
  // 雑魚敵（狼以外）と中ボスの体力にかかります。
  DIFFICULTY: { solo: 1, party: 3 },
  // ボスは「1人で約30秒、パーティーで約50秒」で倒せるように、パーティーでは
  // 体力 = 1人のときの体力 × timeRatio × (1 + perExtra × 増えた人数)
  //   今の値だと 2人で3倍、3人で4.5倍、4人で6倍。
  //   （人数分の火力 × 50秒/30秒 から、仲間のダウンや散らばりで火力が落ちる分を少し引いた値）
  BOSS_PARTY: { timeRatio: 1.5, perExtra: 1 },

  // ---- 人数による調整（左から 0人, 1人, 2人, 3人, 4人 のときの倍率） ----
  // パーティーでは敵の体力が3倍になるので、敵の数はおさえめ（1人あたりの負担が人数で変わりにくい値）
  //   spawn: 画面にいる敵の数、xpNeed: レベルアップに必要な経験値（経験値は全員で共有）
  PARTY: { spawn: [1, 1, 0.9, 1.3, 1.75], xpNeed: [1, 1, 1.0, 1.4, 1.9] },

  // 中ボスの体力倍率（下の表の体力 × この値 × 難易度）
  MIDBOSS_HP_SCALE: 3,

  // ---- ラッシュ：中ボスが出る30秒前から、敵の群れが一気に突撃してくる ----
  RUSH: { before: 30, duration: 18, every: 0.9, pack: [10, 16], speedMul: 1.25, dist: 720, max: 340 },

  // ---- ダンボール：壊すと 1/8 で回復アイテム（最大HPの30%回復） ----
  BOXES: { initial: 10, perMinute: 3, dropRate: 1 / 8, healRatio: 0.3, r: 22, max: 60 },

  // ---- 経験値とレベル ----
  // 次のレベルまでに必要な経験値 = min(cap, base + growth × (Lv-1)) × 人数補正
  // 目安：スキル全MAXには29回のレベルアップが必要。巻物なしだと8分までに Lv20〜27 前後、
  //       巻物を★5にすると Lv30 以上になり全MAXに届く（自動プレイで測定）。
  XP: { base: 5, growth: 26, cap: 620 },

  // ---- 敵キャラ ----
  // atk: 近接は「触れている間 1秒あたり」のダメージ（クールタイムなし）、遠距離は弾1発のダメージ
  ENEMIES: {
    wolf:          { name: '狼',           hp: 30,   atk: 10,  speed: 150, r: 16, xp: 1,  melee: true, pack: [6, 10], noParty: true },
    fireWolf:      { name: '炎狼',         hp: 30,   atk: 10,  speed: 150, r: 16, xp: 1,  melee: true, pack: [6, 10], noParty: true },
    iceWolf:       { name: '氷狼',         hp: 30,   atk: 10,  speed: 150, r: 16, xp: 1,  melee: true, pack: [6, 10], noParty: true },
    zombie:        { name: 'ゾンビ',       hp: 50,   atk: 30,  speed: 55,  r: 18, xp: 2,  melee: true, pack: [3, 6] },
    mageZombie:    { name: '魔法使いゾンビ', hp: 30, atk: 30,  speed: 70,  r: 18, xp: 3,  ranged: { cd: 3, range: 430, keep: 280, speed: 260, proj: 'magic', pr: 9 } },
    armorSkeleton: { name: '鎧スケルトン', hp: 80,   atk: 42,  speed: 45,  r: 20, xp: 4,  ranged: { cd: 3, range: 460, keep: 300, speed: 300, proj: 'bone', pr: 9 } },
    bigZombie:     { name: 'でかいゾンビ', hp: 2000, atk: 200, speed: 50,  r: 46, xp: 60, melee: true, midboss: true },
    eliteZombie:   { name: 'エリートゾンビ', hp: 4000, atk: 400, speed: 50, r: 50, xp: 120, melee: true, midboss: true },   // でかいゾンビの2倍の強さ
  },

  // ---- ボス（動かない） ----
  // 体力は「そのステージに見合う装備で、1人で約30秒」になるよう自動プレイで調整した値。
  BOSSES: {
    aurott:      { name: 'オーロット',       title: '木の怪物', hp: 135000, r: 74,
                   shot: { atk: 120, cd: 5, count: 1, spread: 0, speed: 280, proj: 'seed', pr: 14 },
                   gears: { count: 4, radius: 170, speed: 1.1, dps: 60, r: 22 } },
    orock:       { name: 'オーロック',       title: '石の怪物', hp: 180000, r: 78,
                   shot: { atk: 400, cd: 5, count: 1, spread: 0, speed: 300, proj: 'stone', pr: 22 } },
    frostGolem:  { name: 'フロストゴーレム', title: '氷の巨人', hp: 230000, r: 80,
                   shot: { atk: 300, cd: 4, count: 3, spread: 0.5, speed: 320, proj: 'ice', pr: 14 },
                   gears: { count: 3, radius: 190, speed: 1.4, dps: 120, r: 24 } },
    ifrit:       { name: 'イフリート',       title: '炎の魔人', hp: 520000, r: 80,
                   shot: { atk: 450, cd: 4, count: 5, spread: 0.9, speed: 300, proj: 'fire', pr: 16 } },
    phantomKing: { name: 'ファントムキング', title: '亡霊の王', hp: 760000, r: 84,
                   shot: { atk: 440, cd: 3.8, count: 7, spread: 1.8, speed: 300, proj: 'soul', pr: 15 },
                   gears: { count: 5, radius: 200, speed: 1.6, dps: 170, r: 24 } },
  },

  // ---- ステージごとの出現キャラ ----
  // spawns: from=出現し始める秒数、w=出現の重み
  STAGE_ENEMIES: {
    meadow:  { boss: 'aurott',      midboss: 'bigZombie',   rush: ['wolf'], spawns: [{ type: 'wolf', w: 4, from: 0 }, { type: 'zombie', w: 4, from: 0 }, { type: 'mageZombie', w: 1.5, from: 45 }] },
    desert:  { boss: 'orock',       midboss: 'bigZombie',   mageProj: 'fireMagic', rush: ['fireWolf'], spawns: [{ type: 'fireWolf', w: 4, from: 0 }, { type: 'zombie', w: 4, from: 0 }, { type: 'mageZombie', w: 1.4, from: 40 }, { type: 'armorSkeleton', w: 1.0, from: 90 }] },
    snow:    { boss: 'frostGolem',  midboss: 'bigZombie',   mageProj: 'iceMagic', rush: ['iceWolf', 'iceWolf', 'zombie'], spawns: [{ type: 'iceWolf', w: 5, from: 0 }, { type: 'zombie', w: 3, from: 0 }, { type: 'mageZombie', w: 1.5, from: 30 }, { type: 'armorSkeleton', w: 1.6, from: 60 }] },
    volcano: { boss: 'ifrit',       midboss: 'eliteZombie', rush: ['wolf', 'zombie', 'zombie'], spawns: [{ type: 'wolf', w: 4, from: 0 }, { type: 'zombie', w: 4, from: 0 }, { type: 'mageZombie', w: 1.4, from: 20 }, { type: 'armorSkeleton', w: 1.3, from: 45 }] },
    ruins:   { boss: 'phantomKing', midboss: 'eliteZombie', rush: ['wolf', 'zombie', 'armorSkeleton'], spawns: [{ type: 'wolf', w: 4, from: 0 }, { type: 'zombie', w: 4, from: 0 }, { type: 'mageZombie', w: 1.3, from: 30 }, { type: 'armorSkeleton', w: 1.3, from: 60 }] },
  },

  // ---- スキル（武器を含めて3枠） ----
  // 武器スキルは最初から★1。取得するたびに★が1つ上がる（最大★5）。
  SLOTS: { skills: 3, abilities: 3 },
  MAX_STAR: 5,
  SKILLS: {
    kunai:    { name: 'クナイ',       weapon: true, desc: (s) => `1秒ごとにクナイを${s}本投げる。敵を追いかけて必ず当たる（ATK×1.0）` },
    shotgun:  { name: 'ショットガン', weapon: true, desc: (s) => `${(1.5 - 0.2 * (s - 1)).toFixed(1)}秒ごとに散弾を撃つ。全弾命中でATK×${(2 * Math.pow(1.1, s - 1)).toFixed(2)}` },
    lightsaber: { name: 'ライトセイバー', weapon: true, desc: (s) => `${(1 - 0.1 * (s - 1)).toFixed(1)}秒ごとに自分のまわりを回転斬り（ATK×${Math.pow(1.2, s - 1).toFixed(2)}）` },
    revolver: { name: 'リボルバー',   weapon: true, desc: (s) => `${(0.5 - 0.05 * (s - 1)).toFixed(2)}秒ごとに近くの敵1体を撃ち抜く（ATK×${Math.pow(1.2, s - 1).toFixed(2)}）` },
    defender: { name: 'ディフェンサー', desc: (s) => `自分の周りを歯車が${s + 1}つ回る。触れた敵にATK×1.0` },
    drone:    { name: 'ドローン',     desc: (s) => `近くの敵をロックオンして毎秒${5 + 3 * (s - 1)}発の連射（1発ATK×0.2）` },
    thunder:  { name: '雷発生機',     desc: (s) => `雷を${s}本落とし、5秒間電気が残る（ATK×1.0、電気は毎秒ATK×0.6）` },
    soccer:   { name: 'サッカーボール', desc: (s) => `画面の端で跳ね返るボール（大きさ${s}人分、ATK×2.0）` },
    molotov:  { name: '火炎瓶',       desc: (s) => `火炎瓶を2つ投げて炎を残す（範囲${s + 1}人分、毎秒ATK×${(0.6 + 0.2 * (s - 1)).toFixed(1)}）` },
    gravity:  { name: '重力発生機',   desc: (s) => `周りの敵を${Math.round((0.5 + 0.1 * (s - 1)) * 100)}%遅くし、毎秒ATK×${(0.2 + 0.2 * (s - 1)).toFixed(1)}` },
  },
  SKILL_PARAMS: {
    kunai:    { cd: 1.0, dmg: 1.0, speed: 760, range: 620 },
    shotgun:  { cd: 1.5, cdStep: 0.2, pellets: 7, spread: 0.9, total: 2.0, mult: 1.1, speed: 950, range: 380 },
    lightsaber: { cd: 1.0, cdStep: 0.1, r: 90, dmg: 1.0, mult: 1.2 },
    revolver: { cd: 0.5, cdStep: 0.05, dmg: 1.0, mult: 1.2, range: 520 },
    defender: { orbit: 105, angSpeed: 1.8, r: 16, dmg: 1.0, hitCd: 0.7 },
    drone:    { rate: 5, rateStep: 3, dmg: 0.2, range: 460 },
    thunder:  { cd: 2.5, dmg: 1.0, fieldR: 60, fieldTime: 5, fieldDps: 0.6, range: 520 },
    soccer:   { rPerStar: 20, speed: 200, speedStep: 70, dmg: 2.0, hitCd: 0.5 },
    molotov:  { cd: 4, bottles: 2, r: 40, rStep: 20, time: 3, dps: 0.6, dpsStep: 0.2, throwDist: 230 },
    gravity:  { r: 150, dps: 0.2, dpsStep: 0.2, slow: 0.5, slowStep: 0.1 },
  },

  // ---- アビリティ（3枠） ----
  ABILITIES: {
    drink:   { name: 'エナジードリンク', desc: (s) => `毎秒HPを${3 + s}%回復` },
    ammo:    { name: '弾薬',             desc: (s) => `攻撃力 +${10 * s}%` },
    battery: { name: 'エネルギー装置',   desc: (s) => `攻撃速度 +${10 * s}%` },
    vest:    { name: '防弾チョッキ',     desc: (s) => `受けるダメージ -${10 * s}%` },
    scroll:  { name: '巻物',             desc: (s) => `チーム全体の経験値 +${10 * s}%` },
    coin:    { name: 'コイン獲得',       desc: (s) => `試合終了後にコイン +${300 * s}` },
  },

  // ---- ミッション ----
  MISSIONS: {
    stageClearReward: 3000,    // ステージを1つクリアするたびに
    killStep: 100,             // 敵を100体倒すごとに
    killReward: 300,
  },
};
