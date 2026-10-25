/* =========================================================
 *  config.js  ― ゲーム全体の設定値
 *  数値バランスの調整はこのファイルだけで完結するようにしています。
 * ========================================================= */
window.DS = window.DS || {};

DS.config = {
  // ---- タイトル（好きな名前に変えてください） ----
  GAME_TITLE: 'SURVIVORS ARENA',
  GAME_SUBTITLE: 'サバイバーズ・アリーナ',

  // ---- セーブ ----
  SAVE_KEY: 'survivors-arena/save/v1',
  CLOUD_KEY: 'survivors-arena/cloud/v1',

  // ---- コイン ----
  START_COINS: 0,              // 初回起動時のコイン（配布なし）
  DEBUG_COIN_BUTTON: false,    // true にするとコイン横に「＋」ボタン（テスト用）が出る
  DEBUG_COIN_AMOUNT: 30000,

  // ---- はじめのチケットと解放 ----
  START_TICKETS: { item10: 1, char10: 0 },   // 最初に装備ガチャ10連無料チケットを1枚
  // ステージ1をクリアするまでは、ガチャからコモン・アンコモン・レアだけが出る（リセマラ防止）
  // その間はエピック・レジェンドの分がレアになる（コモン60% / アンコモン25% / レア15%）
  EARLY_RARITIES: ['common', 'uncommon', 'rare'],
  FULL_RARITY_UNLOCK: 0,       // このステージ（0=ステージ1）をクリアすると全レアリティ解放
  CHAR_TICKET_STAGE: 1,        // このステージ（1=ステージ2）をクリアするとキャラガチャ10連無料チケット

  // ---- プレイヤー基礎ステータス（装備なしの値） ----
  BASE_STATS: { atk: 100, hp: 1000, spd: 100 },

  // ---- マルチプレイ ----
  MAX_PLAYERS: 4,
  NET: {
    // 'auto'  : PeerJS（オンライン）を使い、読み込めない時はローカルに切替
    // 'online': PeerJS のみ
    // 'local' : 同じブラウザのタブ同士だけで通信（開発・テスト用）
    // URL に ?net=local を付けても切り替えられます
    MODE: 'auto',
    PEERJS_URLS: [
      'https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js',
      'https://cdn.jsdelivr.net/npm/peerjs@1.5.4/dist/peerjs.min.js',
    ],
    PEER_OPTIONS: {},          // 自前の PeerServer を使う時は { host, port, path, secure } を指定
    ID_PREFIX: 'survivors-arena-v1-lobby-',
    HEARTBEAT_MS: 3000,
    TIMEOUT_MS: 30000,
  },

  // ---- ガチャ ----
  GACHA: {
    singleCost: 3000,
    multiCost: 30000,
    multiCount: 10,
  },

  // ---- レアリティ ----
  // weight は 1000 分率（60% = 600）。合計 1000。
  // 武器・ベルトは atk が、防具・靴は hp が上がります。
  RARITIES: [
    { key: 'common',   name: 'コモン',     weight: 600, rate: '60%',   atk: 60,  hp: 60,  color: '#ffffff' },
    { key: 'uncommon', name: 'アンコモン', weight: 250, rate: '25%',   atk: 120, hp: 120, color: '#3ccf5a' },
    { key: 'rare',     name: 'レア',       weight: 115, rate: '11.5%', atk: 180, hp: 180, color: '#3c8dff' },
    { key: 'epic',     name: 'エピック',   weight: 30,  rate: '3%',    atk: 260, hp: 260, color: '#a74dff' },
    { key: 'legend',   name: 'レジェンド', weight: 5,   rate: '0.5%',  atk: 350, hp: 350, color: '#ffc21a' },
  ],

  // ---- 装備スロット ----
  SLOTS: [
    { key: 'weapon', name: '武器',   stat: 'atk' },
    { key: 'belt',   name: 'ベルト', stat: 'atk' },
    { key: 'armor',  name: '防具',   stat: 'hp'  },
    { key: 'boots',  name: '靴',     stat: 'hp'  },
  ],

  // ガチャ画面に並べる順番（上から 武器 → 防具 → ベルト → 靴）
  GACHA_ORDER: ['weapon', 'armor', 'belt', 'boots'],

  // ---- 装備アイテム ----
  // 見た目と名前はレアリティ共通。背景と ATK/HP だけがレアリティで変わります。
  // bonus : 装備としてのプラス補正（レアリティの値に上乗せ）
  // aura  : 一定範囲内の敵へのデバフ（radius はゲーム内の距離。ゲーム実装時に使用）
  // weapon: 武器の挙動パラメータ（ゲーム実装時に使用）
  ITEMS: {
    kunai: {
      slot: 'weapon', name: 'クナイ',
      desc: '遠くの敵に単発の攻撃をすばやく連射する。',
      weapon: { pattern: 'single', range: 'long', fireIntervalMs: 280, projectileSpeed: 9 },
      traits: ['遠距離', '単発連射'],
    },
    shotgun: {
      slot: 'weapon', name: 'ショットガン',
      desc: '弾が扇状に拡散する。近距離ほど多くの弾が当たり、高いダメージを出せる。',
      weapon: { pattern: 'spread', range: 'short', fireIntervalMs: 900, pellets: 7, spreadDeg: 50 },
      traits: ['近距離', '拡散'],
    },
    lightsaber: {
      slot: 'weapon', name: 'ライトセイバー',
      desc: '1秒ごとに自分のまわり（キャラ3体分）を回転斬りする。',
      weapon: { pattern: 'spin', range: 'short' },
      traits: ['近距離', '回転斬り'],
    },
    revolver: {
      slot: 'weapon', name: 'リボルバー',
      desc: '0.5秒ごとに近くの敵1体を撃ち抜く。',
      weapon: { pattern: 'single', range: 'middle' },
      traits: ['単発', '高速連射'],
    },
    plateArmor: {
      slot: 'armor', name: '鎧',
      desc: '耐久力は高いが、重くて移動速度が落ちる。',
      bonus: { hp: 30, spd: -10 },
    },
    leatherArmor: {
      slot: 'armor', name: 'レザーアーマー',
      desc: '鎧より耐久は落ちるが、身軽に動ける。',
      bonus: { hp: 15 },
    },
    eternalBoots: {
      slot: 'boots', name: 'エターナルブーツ',
      desc: '羽のように軽いブーツ。移動速度が上がる。',
      bonus: { spd: 10 },
    },
    frostBoots: {
      slot: 'boots', name: 'フロストブーツ',
      desc: '冷気をまとうブーツ。自分は遅くなるが、周囲の敵も凍えて遅くなる。',
      bonus: { spd: -15 },
      aura: { radius: 160, enemySpd: -5 },
    },
    stellaBelt: {
      slot: 'belt', name: 'ステラベルト',
      desc: '星の力を宿すベルト。周囲の敵の攻撃速度を下げる。',
      aura: { radius: 160, enemyAtkSpd: -10 },
    },
    eternalBelt: {
      slot: 'belt', name: 'エターナルベルト',
      desc: '尽きない力を秘めたベルト。攻撃力が上がる。',
      bonus: { atk: 30 },
    },
  },

  // ---- 合成 ----
  // 同じ装備（種類・レアリティ・合成段階が同じ）を3つで1段階上に。❸が最大。
  // mult: 合成段階ごとの ATK/HP 倍率（合成していない状態から見て）
  FUSION: { need: 3, max: 3, mult: [1, 2, 5, 10], marks: ['', '❶', '❷', '❸'] },

  // ---- キャラクター ----
  // キャラガチャで手に入り、装備画面で設定。レアリティが高いほど ATK と HP の倍率が高い。
  CHAR_MULT: { common: 1.2, uncommon: 1.5, rare: 1.8, epic: 2.2, legend: 3.0 },
  // キャラガチャはステージ2クリアで解放（CHAR_TICKET_STAGE と同じステージ）
  // 見た目はキャラを持っていなくても、ステージをクリアしていなくても、いつでも変更できる
  CHARACTERS: {
    smoke:   { rarity: 'common',   name: 'スモーク',   desc: '髭がよく似合うイケおじ。' },
    jasper:  { rarity: 'common',   name: 'ジャスパー', desc: 'オレンジ髪のスパイ。' },
    johnson: { rarity: 'uncommon', name: 'ジョンソン', desc: '白髪のイケおじ。' },
    jay:     { rarity: 'uncommon', name: 'ジェイ',     desc: '青い髪の怖いお姉さん。' },
    widow:   { rarity: 'rare',     name: 'ウィドウ',   desc: '黒い服を着た怖い女性。',
               skill: { name: 'ブラックヴェール', cd: 30, dur: 10, enemySpd: -10, desc: '10秒間、すべての敵の移動速度 -10' } },
    kitties: { rarity: 'rare',     name: 'キティース', desc: '服を着た二足歩行の猫。',
               skill: { name: 'ヒールドローン', passive: true, radius: 400, rate: 1, heal: 0.01, desc: '回復ドローンがいつも飛んでいて、近くの味方か自分の中で一番HPが少ない人を毎秒1%回復（常に発動）' } },
    duck:    { rarity: 'rare',     name: 'ダック',     desc: '二足歩行の黄色いアヒル。',
               skill: { name: 'ダッシュ', cd: 30, dur: 5, spd: 30, desc: '5秒間、自分の移動速度 +30%' } },
    large:   { rarity: 'epic',     name: 'ラージ',     desc: '二足歩行のロボット。',
               skill: { name: 'アイアンボディ', cd: 30, dur: 3, desc: '3秒間、自分が無敵になる' } },
    freya:   { rarity: 'epic',     name: 'フレイヤ',   desc: '茶髪の弓使い。',
               skill: { name: 'アローレイン', cd: 60, radius: 400, dmg: 3, desc: '自分から一定範囲内の敵全員に矢を放つ' } },
    sword:   { rarity: 'legend',   name: 'ソード',     desc: '金髪の女性剣士。',
               skill: { name: '剣聖', passive: true, saberRange: 1.5, desc: 'ライトセイバー使用中、攻撃範囲が1.5倍（常に発動）' } },
    gunman:  { rarity: 'legend',   name: 'ガンマン',   desc: '西部のガンマン。',
               skill: { name: 'ファストドロー', cd: 30, dur: 8, rate: 2, desc: '8秒間、武器の攻撃速度が2倍' } },
  },

  // ---- 引き継ぎ（Firebase） ----
  // README の手順で Firebase を作り、apiKey と databaseURL を貼り付けると
  // 「プレイヤーID + 4桁パスワード」でデータを別の端末に引き継げるようになります。
  CLOUD: {
    // ↓ Firebase の apiKey を '' の間に貼り付ける（例: 'AIzaSyB...'）
    apiKey: '',
    // ↓ Realtime Database の URL を '' の間に貼り付ける（例: 'https://xxxx-default-rtdb.asia-southeast1.firebasedatabase.app'）
    databaseURL: '',
    emailDomain: 'player.survivors-arena.game',   // 内部用（メールは送られません）
    autoSaveSec: 15,
  },

  // 最初から持っている装備（武器は外せないので必ず1つ）
  STARTER_ITEMS: [{ item: 'kunai', rarity: 'common', equip: true }],

  // ---- ステージ ----
  STAGES: [
    { key: 'meadow',  no: 1, name: 'はじまりの草原', diff: 1, desc: 'ゾンビと狼がうろつく草原。まずはここから。', accent: '#5fd35a' },
    { key: 'desert',  no: 2, name: '灼熱の砂漠',     diff: 2, desc: '炎狼と鎧スケルトンが現れる砂漠。石の怪物が待つ。',     accent: '#ffb547' },
    { key: 'snow',    no: 3, name: '凍てつく雪原',   diff: 3, desc: '氷狼の大群と骸骨兵が吹雪の中から襲ってくる。',           accent: '#7cd3ff' },
    { key: 'volcano', no: 4, name: '怒れる火山',     diff: 4, desc: 'エリートゾンビと炎の魔人が待つ灼熱地帯。',         accent: '#ff6a3d' },
    { key: 'ruins',   no: 5, name: '月夜の廃墟都市', diff: 5, desc: '月明かりの下、亡霊の王が待つ最終ステージ。', accent: '#b07cff' },
  ],

  // ロビー内のプレイヤー枠の色（P1〜P4）
  PLAYER_COLORS: ['#ff5a5f', '#3fa9ff', '#39d17a', '#ffc93c'],
};
