/* =========================================================
 *  game/sim.js  ― バトルの中身（ホストの端末だけで動く）
 *
 *  ・敵の出現/移動/攻撃、スキル、経験値、ボス、復活、勝敗をすべてここで計算
 *  ・プレイヤーの位置だけは各端末から送られてきた値を使う（操作の遅れをなくすため）
 *  ・snapshot() で画面描画・通信用の軽いデータを作る
 * ========================================================= */
(function () {
  const GC = DS.gameConfig;
  const SP = GC.SKILL_PARAMS;
  const ENEMY_TYPES = Object.keys(GC.ENEMIES);
  const PROJ_KINDS = ['magic', 'bone', 'seed', 'stone', 'ice', 'fire', 'soul', 'fireMagic', 'iceMagic', 'heal'];
  const TAU = Math.PI * 2;
  const WEAPONS = Object.keys(DS.config.ITEMS).filter((k) => DS.config.ITEMS[k].slot === 'weapon');

  const rand = (a, b) => a + Math.random() * (b - a);
  const randi = (a, b) => Math.floor(rand(a, b + 1));
  const dist2 = (ax, ay, bx, by) => (ax - bx) * (ax - bx) + (ay - by) * (ay - by);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

  /* ---------- 近くの敵をすばやく探すための格子 ---------- */
  class Grid {
    constructor(cell) { this.cell = cell; this.map = new Map(); }
    clear() { this.map.clear(); }
    insert(e) {
      const k = Math.floor(e.x / this.cell) * 65536 + Math.floor(e.y / this.cell);
      let a = this.map.get(k);
      if (!a) { a = []; this.map.set(k, a); }
      a.push(e);
    }
    each(x, y, r, fn) {
      const c = this.cell;
      const x0 = Math.floor((x - r) / c), x1 = Math.floor((x + r) / c);
      const y0 = Math.floor((y - r) / c), y1 = Math.floor((y + r) / c);
      for (let cx = x0; cx <= x1; cx++) {
        for (let cy = y0; cy <= y1; cy++) {
          const a = this.map.get(cx * 65536 + cy);
          if (a) for (let i = 0; i < a.length; i++) fn(a[i]);
        }
      }
    }
  }

  class Sim {
    /**
     * @param {object} o
     *  stageIndex: 0〜4
     *  players: [{ id, slot, name, atk, hp, spd, weapon, belt, boots }]
     */
    constructor(o) {
      this.stageIndex = o.stageIndex || 0;
      this.stage = DS.config.STAGES[this.stageIndex];
      this.roster = GC.STAGE_ENEMIES[this.stage.key];
      this.atkMult = Math.pow(GC.STAGE_ATK_MULT, this.stageIndex);
      this.hpMult = (GC.STAGE_HP_MULT || [])[this.stageIndex] || 1;
      this.W = GC.WORLD.w; this.H = GC.WORLD.h;
      this.t = 0;
      this.phase = 'battle';       // battle → gather → countdown → boss → win / lose
      this.level = 1; this.xp = 0;
      this.pendingLv = 0;
      this.levelup = null;         // { seq, options:{pid:[...]}, chosen:{pid:true} }
      this.lvSeq = 0;
      this.nextId = 1;
      this.enemies = []; this.shots = []; this.eshots = []; this.zones = []; this.bottles = [];
      this.fx = []; this.events = [];
      this.grid = new Grid(80);
      this.spawnTimer = 1;
      this.midbossDone = 0;
      this.altar = null; this.countdown = -1;
      this.boss = null;
      this.ended = false;
      this.clock = 0;              // 一時停止中以外は進み続ける時計（エフェクト用）
      // 1人なら1倍、パーティーなら3倍の難易度
      this.partyDiff = (o.players || []).length > 1 ? GC.DIFFICULTY.party : GC.DIFFICULTY.solo;
      this.boxes = []; this.heals = []; this.boxTimer = 60;
      this.rush = 0; this.rushDone = 0; this.rushTimer = 0; this.rushDir = 0;
      this.widowT = 0; this.widowSpd = 0;

      this.players = new Map();
      (o.players || []).forEach((p, i) => this.addPlayer(p, i));
      this.need = this.calcNeed();
      this.spawnBoxes(GC.BOXES.initial);
    }

    /* ======================= プレイヤー ======================= */
    addPlayer(p, i) {
      const PL = GC.PLAYER;
      const ang = (p.slot != null ? p.slot : i) * Math.PI / 2;
      const items = DS.config.ITEMS;
      const pl = {
        id: p.id, slot: p.slot != null ? p.slot : i, name: p.name || 'プレイヤー',
        x: this.W / 2 + Math.cos(ang) * 60, y: this.H / 2 + Math.sin(ang) * 60,
        r: PL.radius,
        baseAtk: Math.max(1, p.atk || 100), maxHp: Math.max(1, p.hp || 1000),
        spd: p.spd || 100,
        hp: Math.max(1, p.hp || 1000),
        weapon: WEAPONS.includes(p.weapon) ? p.weapon : 'kunai',
        down: false, revive: 0,
        kills: 0,
        vw: 220, vh: 450,
        skills: {}, abilities: {}, order: [], aorder: [],
        cd: {}, gearAng: 0, drone: null, ball: null, droneAcc: 0,
        frost: p.boots && items[p.boots] && items[p.boots].aura && items[p.boots].aura.enemySpd ? items[p.boots].aura : null,
        stella: p.belt && items[p.belt] && items[p.belt].aura && items[p.belt].aura.enemyAtkSpd ? items[p.belt].aura : null,
      };
      pl.skills[pl.weapon] = 1; pl.order.push(pl.weapon);
      // キャラの特殊スキル
      const ch = DS.config.CHARACTERS[p.char];
      pl.char = ch ? p.char : '';
      pl.look = p.look && DS.config.CHARACTERS[p.look] ? p.look : '';
      pl.cs = ch && ch.skill ? ch.skill : null;
      pl.scd = pl.cs && !pl.cs.passive ? Math.round(pl.cs.cd / 3) : 0;   // 最初は少し待つと使える
      pl.buff = { inv: 0, spd: 0, fast: 0 };
      this.players.set(pl.id, pl);
      return pl;
    }
    removePlayer(id) {
      this.players.delete(id);
      if (this.levelup) { delete this.levelup.options[id]; this.checkLevelupDone(); }
      this.need = this.calcNeed();
    }
    /** 各端末から届いた位置（と画面の大きさ）を反映 */
    setPlayerPos(id, x, y, vw, vh) {
      const p = this.players.get(id);
      if (!p || p.down) return;
      p.x = clamp(x, p.r, this.W - p.r); p.y = clamp(y, p.r, this.H - p.r);
      if (vw) { p.vw = clamp(vw, 120, 700); p.vh = clamp(vh, 120, 700); }
    }
    alivePlayers() { const a = []; this.players.forEach((p) => { if (!p.down) a.push(p); }); return a; }
    /** 人数による倍率。表（[0人,1人,2人,3人,4人]）か、1人増えるごとの値 */
    partyMul(k) {
      const n = this.players.size;
      if (Array.isArray(k)) return k[Math.min(n, k.length - 1)] || 1;
      return 1 + k * Math.max(0, n - 1);
    }
    atkOf(p) { return p.baseAtk * (1 + 0.1 * (p.abilities.ammo || 0)); }
    cdMul(p) { return 1 / (1 + 0.1 * (p.abilities.battery || 0)); }
    /** 武器の攻撃間隔の倍率（ガンマンのファストドロー中は 1/2） */
    wcd(p) { return p.buff.fast > 0 && p.cs && p.cs.rate ? 1 / p.cs.rate : 1; }

    /* ---------- キャラの特殊スキル ---------- */
    useSkill(id) {
      const p = this.players.get(id);
      if (!p || p.down || !p.cs || p.cs.passive || p.scd > 0 || this.ended || this.levelup) return false;
      const s = p.cs;
      p.scd = s.cd;
      if (p.char === 'widow') { this.widowT = Math.max(this.widowT, s.dur); this.widowSpd = s.enemySpd; }
      else if (p.char === 'duck') p.buff.spd = s.dur;
      else if (p.char === 'large') p.buff.inv = s.dur;
      else if (p.char === 'gunman') p.buff.fast = s.dur;
      else if (p.char === 'freya') {
        const dmg = this.atkOf(p) * s.dmg;
        this.fx.push({ id: this.nextId++, k: 7, x: p.x, y: p.y, r: s.radius, rt: this.clock });
        this.enemiesNear(p.x, p.y, s.radius).forEach((e, i) => {
          if (i < 40) this.fx.push({ id: this.nextId++, k: 5, x: e.x, y: e.y, rt: this.clock });
          this.damageEnemy(e, dmg, p.id);
        });
      }
      this.events.push({ type: 'skill', id: p.id, name: p.name, char: p.char });
      return true;
    }

    /* ---------- ダンボールと回復アイテム ---------- */
    spawnBoxes(n) {
      const B = GC.BOXES;
      for (let i = 0; i < n && this.boxes.length < B.max; i++) {
        let x, y, tries = 0;
        do {
          x = rand(200, this.W - 200); y = rand(200, this.H - 200); tries++;
        } while (tries < 20 && [...this.players.values()].some((p) => dist2(p.x, p.y, x, y) < 300 * 300));
        this.boxes.push({ id: this.nextId++, x, y, r: B.r });
      }
    }
    hitBoxes(x, y, r) {
      if (!this.boxes.length) return;
      for (const b of this.boxes) {
        if (!b.broken && dist2(x, y, b.x, b.y) < (r + b.r) * (r + b.r)) this.breakBox(b);
      }
    }
    breakBox(b) {
      b.broken = true;
      this.fx.push({ id: this.nextId++, k: 8, x: b.x, y: b.y, rt: this.clock });
      if (Math.random() < GC.BOXES.dropRate) this.heals.push({ id: this.nextId++, x: b.x, y: b.y });
    }

    hurtPlayer(p, dmg) {
      if (p.down || this.ended || p.buff.inv > 0) return;
      p.hp -= dmg * (1 - 0.1 * (p.abilities.vest || 0));
      if (p.hp <= 0) {
        p.hp = 0; p.down = true; p.revive = 0;
        p.drone = null; p.hdrone = null;
        this.events.push({ type: 'down', id: p.id, name: p.name });
        if (this.alivePlayers().length === 0) this.finish(false);
      }
    }

    /* ======================= 経験値・レベル ======================= */
    calcNeed() {
      const X = GC.XP;
      return Math.round(Math.min(X.cap || Infinity, X.base + X.growth * (this.level - 1)) * this.partyMul(GC.PARTY.xpNeed));
    }
    xpMul() { let s = 0; this.players.forEach((p) => { s += p.abilities.scroll || 0; }); return 1 + 0.1 * s; }
    gainXp(n) {
      this.xp += n * this.xpMul();
      while (this.xp >= this.need) {
        this.xp -= this.need;
        this.level++; this.pendingLv++;
        this.need = this.calcNeed();
      }
      if (this.pendingLv > 0 && !this.levelup && !this.ended) this.startLevelup();
    }
    optionsFor(p) {
      const cands = [];
      const MAX = GC.MAX_STAR;
      const ownedS = Object.keys(p.skills).length, ownedA = Object.keys(p.abilities).length;
      Object.keys(GC.SKILLS).forEach((k) => {
        const d = GC.SKILLS[k];
        if (d.weapon && k !== p.weapon) return;                 // 別の武器のスキルは出ない
        const s = p.skills[k] || 0;
        if (s >= MAX) return;                                  // ★5 は出ない
        if (!s && ownedS >= GC.SLOTS.skills) return;           // 枠がいっぱいなら新しいスキルは出ない
        cands.push({ kind: 'skill', key: k, star: s + 1 });
      });
      Object.keys(GC.ABILITIES).forEach((k) => {
        const s = p.abilities[k] || 0;
        if (s >= MAX) return;
        if (!s && ownedA >= GC.SLOTS.abilities) return;
        cands.push({ kind: 'ability', key: k, star: s + 1 });
      });
      const picked = shuffle(cands).slice(0, 3);
      if (!picked.length) picked.push({ kind: 'heal', key: 'heal', star: 0 });
      return picked;
    }
    startLevelup() {
      this.lvSeq++;
      const options = {};
      this.players.forEach((p) => { options[p.id] = this.optionsFor(p); });
      this.levelup = { seq: this.lvSeq, options, chosen: {} };
      this.events.push({ type: 'levelup', seq: this.lvSeq, level: this.level - this.pendingLv + 1 });
    }
    choose(id, seq, index) {
      const lu = this.levelup;
      if (!lu || lu.seq !== seq || lu.chosen[id] || !lu.options[id]) return false;
      const opt = lu.options[id][index] || lu.options[id][0];
      const p = this.players.get(id);
      if (p && opt) this.applyOption(p, opt);
      lu.chosen[id] = true;
      this.checkLevelupDone();
      return true;
    }
    checkLevelupDone() {
      const lu = this.levelup;
      if (!lu) return;
      const all = Object.keys(lu.options).every((id) => lu.chosen[id]);
      if (!all) return;
      this.levelup = null;
      this.pendingLv = Math.max(0, this.pendingLv - 1);
      this.events.push({ type: 'resume' });
      if (this.pendingLv > 0 && !this.ended) this.startLevelup();
    }
    applyOption(p, opt) {
      if (opt.kind === 'skill') {
        if (!p.skills[opt.key]) p.order.push(opt.key);
        p.skills[opt.key] = Math.min(GC.MAX_STAR, (p.skills[opt.key] || 0) + 1);
      } else if (opt.kind === 'ability') {
        if (!p.abilities[opt.key]) p.aorder.push(opt.key);
        p.abilities[opt.key] = Math.min(GC.MAX_STAR, (p.abilities[opt.key] || 0) + 1);
      } else if (opt.kind === 'heal' && !p.down) {
        p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.3);
      }
    }
    get paused() { return !!this.levelup; }

    /* ======================= 敵 ======================= */
    spawnEnemy(type, x, y, extra) {
      const d = GC.ENEMIES[type];
      const min = this.t / 60;
      let hpMul;
      if (d.midboss) hpMul = GC.MIDBOSS_HP_SCALE * this.hpMult * this.partyDiff;
      else hpMul = (1 + GC.ENEMY_HP_GROWTH_PER_MIN * min) * this.hpMult * (d.noParty ? 1 : this.partyDiff);
      const e = Object.assign({
        id: this.nextId++, type, ti: ENEMY_TYPES.indexOf(type), def: d,
        x: clamp(x, 30, this.W - 30), y: clamp(y, 30, this.H - 30), r: d.r,
        hp: d.hp * hpMul, maxHp: d.hp * hpMul, atk: d.atk * this.atkMult,
        speed: d.speed * rand(0.92, 1.08), xpv: d.xp,
        cd: d.ranged ? rand(1, d.ranged.cd) : 0,
        slow: 1, atkSlow: 1, flip: false, hits: null, last: null,
      }, extra);
      this.enemies.push(e);
      return e;
    }
    spawnGroup() {
      const alive = this.alivePlayers();
      if (!alive.length) return;
      const min = this.t;
      const pool = this.roster.spawns.filter((s) => min >= s.from);
      let total = pool.reduce((a, s) => a + s.w, 0), r = Math.random() * total, pick = pool[0];
      for (const s of pool) { if (r < s.w) { pick = s; break; } r -= s.w; }
      const d = GC.ENEMIES[pick.type];
      const grow = Math.min(1, this.t / (GC.SPAWN.packFullAt || 1));
      const n = d.pack ? randi(Math.max(2, Math.round(d.pack[0] * (0.5 + 0.5 * grow))), Math.round(d.pack[0] + (d.pack[1] - d.pack[0]) * grow)) : randi(1, 2);
      const p = alive[Math.floor(Math.random() * alive.length)];
      const a = Math.random() * TAU, dd = rand(620, 760);
      const cx = p.x + Math.cos(a) * dd, cy = p.y + Math.sin(a) * dd;
      for (let i = 0; i < n; i++) this.spawnEnemy(pick.type, cx + rand(-60, 60), cy + rand(-60, 60));
    }
    desiredCount() {
      const min = this.t / 60;
      return Math.min(GC.MAX_ENEMIES, Math.round((GC.SPAWN.base + GC.SPAWN.perMin * min) * this.partyMul(GC.PARTY.spawn)));
    }
    spawnMidboss() {
      const alive = this.alivePlayers();
      if (!alive.length) return;
      const p = alive[Math.floor(Math.random() * alive.length)];
      const a = Math.random() * TAU;
      const kind = this.roster.midboss || 'bigZombie';
      const e = this.spawnEnemy(kind, p.x + Math.cos(a) * 560, p.y + Math.sin(a) * 560, { mid: true });
      this.events.push({ type: 'midboss', id: e.id, name: GC.ENEMIES[kind].name });
    }
    spawnRushPack() {
      const alive = this.alivePlayers();
      if (!alive.length) return;
      const R = GC.RUSH;
      const p = alive[Math.floor(Math.random() * alive.length)];
      const a = this.rushDir + rand(-0.7, 0.7);
      const cx = p.x + Math.cos(a) * R.dist, cy = p.y + Math.sin(a) * R.dist;
      const types = this.roster.rush || ['wolf'];
      const n = randi(R.pack[0], R.pack[1]);
      const nx = -Math.sin(a), ny = Math.cos(a);
      for (let i = 0; i < n && this.enemies.length < R.max; i++) {
        const off = (i - n / 2) * 34, back = (i % 3) * 40;
        const e = this.spawnEnemy(types[i % types.length], cx + nx * off + Math.cos(a) * back, cy + ny * off + Math.sin(a) * back, { rush: true });
        e.speed *= R.speedMul;
      }
    }
    spawnBoss() {
      const key = this.roster.boss, d = GC.BOSSES[key];
      const n = this.players.size;
      const BP = GC.BOSS_PARTY;
      const hp = d.hp * (n > 1 ? BP.timeRatio * (1 + BP.perExtra * (n - 1)) : 1);
      this.enemies = []; this.eshots = [];                 // ボス出現と同時に雑魚は消える
      // ボスは祭壇の少し奥（北側）に出現。集まったプレイヤーと重ならないようにする
      this.boss = this.spawnEnemy('bigZombie', this.altar.x, this.altar.y - this.altar.r - 170, {
        isBoss: true, bossKey: key, bdef: d, r: d.r, hp, maxHp: hp, speed: 0, xpv: 0,
        cd: 2.5, gearAng: 0, ti: -1,
      });
      this.phase = 'boss';
      this.events.push({ type: 'boss', name: d.name });
    }
    damageEnemy(e, amount, owner) {
      if (e.hp <= 0) return;
      e.hp -= amount; e.last = owner;
      if (e.hp <= 0) this.killEnemy(e);
    }
    killEnemy(e) {
      e.dead = true;
      const p = this.players.get(e.last);
      if (p) p.kills++;
      this.fx.push({ id: this.nextId++, k: e.isBoss ? 3 : 2, x: e.x, y: e.y, rt: this.clock, r: e.r });
      if (e.isBoss) { this.finish(true); return; }
      if (e.mid) this.events.push({ type: 'midbossDown' });
      this.gainXp(e.xpv);
    }
    nearestEnemy(x, y, range, exclude) {
      let best = null, bd = range * range;
      this.grid.each(x, y, range, (e) => {
        if (e.dead || (exclude && exclude.has(e.id))) return;
        const d = dist2(x, y, e.x, e.y);
        if (d < bd) { bd = d; best = e; }
      });
      return best;
    }
    enemiesNear(x, y, range) {
      const out = [];
      this.grid.each(x, y, range + 90, (e) => {
        if (!e.dead && dist2(x, y, e.x, e.y) < (range + e.r) * (range + e.r)) out.push(e);
      });
      return out;
    }

    /* ======================= 1ステップ ======================= */
    step(dt) {
      if (this.ended || this.levelup) return;
      this.clock += dt;
      const players = this.alivePlayers();

      // ---- 時間と流れ ----
      if (this.phase === 'battle') {
        this.t += dt;
        GC.MIDBOSS_TIMES.forEach((tm, i) => {
          if (this.midbossDone <= i && this.t >= tm) { this.midbossDone = i + 1; this.spawnMidboss(); }
        });
        if (this.t >= GC.MATCH_SECONDS) {
          this.t = GC.MATCH_SECONDS;
          this.phase = 'gather';
          this.altar = { x: this.W / 2, y: this.H / 2, r: GC.ALTAR.radius };
          this.events.push({ type: 'gather' });
        }
      }
      if (this.phase === 'gather' || this.phase === 'countdown') {
        const inside = players.filter((p) => dist2(p.x, p.y, this.altar.x, this.altar.y) < this.altar.r * this.altar.r).length;
        this.altar.inside = inside; this.altar.total = players.length;
        if (players.length && inside === players.length) {
          if (this.phase === 'gather') { this.phase = 'countdown'; this.countdown = GC.ALTAR.countdown; }
          this.countdown -= dt;
          if (this.countdown <= 0) this.spawnBoss();
        } else if (this.phase === 'countdown') { this.phase = 'gather'; this.countdown = -1; }
      }

      // ---- 中ボスの少し前のラッシュ ----
      if (this.phase === 'battle') {
        GC.MIDBOSS_TIMES.forEach((tm, i) => {
          if (this.rushDone <= i && this.t >= tm - GC.RUSH.before) {
            this.rushDone = i + 1; this.rush = GC.RUSH.duration; this.rushTimer = 0; this.rushDir = rand(0, TAU);
            this.events.push({ type: 'rush' });
          }
        });
        // 1分ごとにダンボールを追加
        this.boxTimer -= dt;
        if (this.boxTimer <= 0) { this.boxTimer += 60; this.spawnBoxes(GC.BOXES.perMinute); }
      }
      if (this.rush > 0) {
        this.rush -= dt; this.rushTimer -= dt;
        if (this.rushTimer <= 0) { this.rushTimer = GC.RUSH.every; this.spawnRushPack(); }
      }

      // ---- 特殊スキルの時間 ----
      if (this.widowT > 0) this.widowT -= dt;
      this.players.forEach((p) => {
        if (p.scd > 0) p.scd = Math.max(0, p.scd - dt);
        for (const k in p.buff) if (p.buff[k] > 0) p.buff[k] = Math.max(0, p.buff[k] - dt);
      });

      // ---- ダンボールを壊す・回復アイテムを拾う ----
      for (const p of players) {
        this.hitBoxes(p.x, p.y, p.r);
        for (const h of this.heals) {
          if (!h.taken && dist2(p.x, p.y, h.x, h.y) < (p.r + 24) * (p.r + 24)) {
            h.taken = true;
            p.hp = Math.min(p.maxHp, p.hp + p.maxHp * GC.BOXES.healRatio);
            this.fx.push({ id: this.nextId++, k: 9, x: p.x, y: p.y, rt: this.clock, o: p.slot });
          }
        }
      }
      if (this.boxes.some((b) => b.broken)) this.boxes = this.boxes.filter((b) => !b.broken);
      if (this.heals.some((h) => h.taken)) this.heals = this.heals.filter((h) => !h.taken);

      // ---- 回復・復活 ----
      this.players.forEach((p) => {
        if (!p.down && p.abilities.drink) p.hp = Math.min(p.maxHp, p.hp + p.maxHp * (0.03 + 0.01 * p.abilities.drink) * dt);
        if (p.down) {
          const helper = players.some((q) => dist2(q.x, q.y, p.x, p.y) < GC.PLAYER.reviveRadius * GC.PLAYER.reviveRadius);
          p.revive = helper ? p.revive + dt : 0;
          if (p.revive >= GC.PLAYER.reviveSeconds) {
            p.down = false; p.revive = 0; p.hp = p.maxHp * GC.PLAYER.reviveHpRatio;
            this.events.push({ type: 'revive', id: p.id, name: p.name });
          }
        }
      });

      // ---- 出現 ----
      if (this.phase !== 'boss') {
        this.spawnTimer -= dt;
        if (this.spawnTimer <= 0) {
          this.spawnTimer = GC.SPAWN.interval / this.partyMul(GC.PARTY.spawn);
          if (this.enemies.length < this.desiredCount()) this.spawnGroup();
        }
      }

      // ---- 格子を作り直す ----
      this.grid.clear();
      const baseSlow = this.widowT > 0 ? Math.max(0.1, 1 + this.widowSpd / 100) : 1;   // ウィドウのスキル
      for (const e of this.enemies) { e.slow = baseSlow; e.atkSlow = 1; this.grid.insert(e); }

      // ---- プレイヤーのまわりの効果（重力・フロストブーツ・ステラベルト） ----
      for (const p of players) {
        const g = p.skills.gravity;
        if (g) {
          const amt = Math.min(0.9, SP.gravity.slow + SP.gravity.slowStep * (g - 1));
          const dps = (SP.gravity.dps + SP.gravity.dpsStep * (g - 1)) * this.atkOf(p);
          for (const e of this.enemiesNear(p.x, p.y, SP.gravity.r)) {
            if (!e.isBoss) e.slow = Math.min(e.slow, 1 - amt);
            this.damageEnemy(e, dps * dt, p.id);
          }
        }
        if (p.frost) for (const e of this.enemiesNear(p.x, p.y, p.frost.radius)) e.slow = Math.min(e.slow, 1 + p.frost.enemySpd / 100);
        if (p.stella) for (const e of this.enemiesNear(p.x, p.y, p.stella.radius)) e.atkSlow = Math.min(e.atkSlow, 1 + p.stella.enemyAtkSpd / 100);
      }

      // ---- 敵の行動 ----
      const FAR2 = 1800 * 1800;
      for (const e of this.enemies) {
        if (e.dead) continue;
        let tgt = null, td = Infinity;
        for (const p of players) { const d = dist2(e.x, e.y, p.x, p.y); if (d < td) { td = d; tgt = p; } }
        if (!tgt) continue;
        if (e.isBoss) { this.bossAct(e, players, dt); continue; }
        if (td > FAR2 && !e.mid) { e.dead = true; e.gone = true; continue; }   // 遠すぎる敵は消して近くに出し直す
        const d = Math.sqrt(td);
        const dx = (tgt.x - e.x) / (d || 1), dy = (tgt.y - e.y) / (d || 1);
        const sp = e.speed * e.slow;
        const R = e.def.ranged;
        let mv = 1;
        if (R) {
          if (d < R.keep) mv = -0.6; else if (d < R.range) mv = 0.15;
          e.cd -= dt * e.atkSlow;
          if (e.cd <= 0 && d < R.range) {
            e.cd = R.cd;
            const proj = e.type === 'mageZombie' && this.roster.mageProj ? this.roster.mageProj : R.proj;
            this.eshots.push({ id: this.nextId++, kind: PROJ_KINDS.indexOf(proj), x: e.x, y: e.y - 10, vx: dx * R.speed, vy: dy * R.speed, r: R.pr, atk: e.atk, life: R.range / R.speed + 0.6 });
          }
        }
        e.x += dx * sp * mv * dt; e.y += dy * sp * mv * dt;
        if (Math.abs(dx) > 0.2) e.flip = dx < 0;
        // 近接：触れている間ダメージ（クールタイムなし）
        if (e.def.melee && d < e.r + tgt.r + 4) this.hurtPlayer(tgt, e.atk * e.atkSlow * dt);
      }
      // 押し合い（重なりすぎ防止）
      for (const e of this.enemies) {
        if (e.dead || e.isBoss) continue;
        this.grid.each(e.x, e.y, e.r * 2, (o) => {
          if (o === e || o.dead) return;
          const dx = e.x - o.x, dy = e.y - o.y, rr = e.r + o.r;
          const d2 = dx * dx + dy * dy;
          if (d2 > 0 && d2 < rr * rr) {
            const d = Math.sqrt(d2), push = (rr - d) * 0.25;
            const w = o.isBoss || o.mid ? 1 : 0.5;
            e.x += dx / d * push * w * 2; e.y += dy / d * push * w * 2;
          }
        });
        e.x = clamp(e.x, 20, this.W - 20); e.y = clamp(e.y, 20, this.H - 20);
      }

      // ---- スキル ----
      for (const p of players) {
        this.skillsAct(p, dt);
        if (p.char === 'kitties' && p.cs) this.healDroneAct(p, dt, players);
      }

      // ---- 弾 ----
      this.updateShots(dt);
      this.updateEnemyShots(dt, players);
      this.updateZones(dt);

      // ---- 掃除 ----
      if (this.enemies.some((e) => e.dead)) this.enemies = this.enemies.filter((e) => !e.dead);
      this.fx = this.fx.filter((f) => this.clock - f.rt < 0.8);
    }

    /* ---------- ボス ---------- */
    bossAct(b, players, dt) {
      const d = b.bdef;
      b.cd -= dt * b.atkSlow;
      if (b.cd <= 0 && players.length) {
        b.cd = d.shot.cd;
        let tgt = players[0], td = Infinity;
        players.forEach((p) => { const dd = dist2(b.x, b.y, p.x, p.y); if (dd < td) { td = dd; tgt = p; } });
        const base = Math.atan2(tgt.y - b.y, tgt.x - b.x);
        const n = d.shot.count;
        for (let i = 0; i < n; i++) {
          const a = base + (n > 1 ? (i / (n - 1) - 0.5) * d.shot.spread : 0);
          this.eshots.push({ id: this.nextId++, kind: PROJ_KINDS.indexOf(d.shot.proj), x: b.x, y: b.y - 20, vx: Math.cos(a) * d.shot.speed, vy: Math.sin(a) * d.shot.speed, r: d.shot.pr, atk: d.shot.atk, life: 4 });
        }
      }
      if (d.gears) {
        b.gearAng += d.gears.speed * dt;
        for (let i = 0; i < d.gears.count; i++) {
          const a = b.gearAng + i * TAU / d.gears.count;
          const gx = b.x + Math.cos(a) * d.gears.radius, gy = b.y + Math.sin(a) * d.gears.radius;
          for (const p of players) {
            if (dist2(gx, gy, p.x, p.y) < (d.gears.r + p.r) * (d.gears.r + p.r)) this.hurtPlayer(p, d.gears.dps * b.atkSlow * dt);
          }
        }
      }
    }

    /* ---------- プレイヤーのスキル ---------- */
    ready(p, key, cd, dt) {
      p.cd[key] = (p.cd[key] == null ? 0.3 : p.cd[key]) - dt;
      if (p.cd[key] > 0) return false;
      p.cd[key] = cd * this.cdMul(p);
      return true;
    }
    /** キティースの回復ドローン：近くの味方か自分の中で一番HPの割合が低い人を回復 */
    healDroneAct(p, dt, players) {
      const cs = p.cs;
      const ox = p.x + 34, oy = p.y - 50 + Math.sin(this.clock * 3.2) * 5;
      if (!p.hdrone) p.hdrone = { x: ox, y: oy, acc: 0 };
      const d = p.hdrone;
      d.x += (ox - d.x) * Math.min(1, dt * 8); d.y += (oy - d.y) * Math.min(1, dt * 8);
      d.acc += dt * cs.rate;
      if (d.acc < 1) return;
      d.acc -= 1;
      let tgt = null, low = 1;
      for (const q of players) {
        if (q.hp >= q.maxHp || dist2(p.x, p.y, q.x, q.y) > cs.radius * cs.radius) continue;
        const r = q.hp / q.maxHp;
        if (r < low) { low = r; tgt = q; }
      }
      if (!tgt) return;
      tgt.hp = Math.min(tgt.maxHp, tgt.hp + tgt.maxHp * cs.heal);
      this.fx.push({ id: this.nextId++, k: 10, x: d.x, y: d.y, tx: tgt.x, ty: tgt.y, rt: this.clock, o: tgt.slot });
    }
    skillsAct(p, dt) {
      const atk = this.atkOf(p);
      const S = p.skills;

      // クナイ：追尾して必中
      if (S.kunai && this.ready(p, 'kunai', SP.kunai.cd * this.wcd(p), dt)) {
        const used = new Set(), targets = [];
        for (let i = 0; i < S.kunai; i++) {
          const t = this.nearestEnemy(p.x, p.y, SP.kunai.range, used) || targets[i % Math.max(1, targets.length)];
          if (!t) break;
          used.add(t.id); targets.push(t);
        }
        if (!targets.length) p.cd.kunai = 0.1;
        targets.forEach((t, i) => {
          const a = Math.atan2(t.y - p.y, t.x - p.x) + (i - (targets.length - 1) / 2) * 0.25;
          this.shots.push({ id: this.nextId++, kind: 0, owner: p.id, x: p.x, y: p.y, vx: Math.cos(a) * SP.kunai.speed, vy: Math.sin(a) * SP.kunai.speed, tgt: t, dmg: atk * SP.kunai.dmg, life: 2.5, r: 8 });
        });
      }
      // ショットガン：散弾
      if (S.shotgun) {
        const cd = SP.shotgun.cd - SP.shotgun.cdStep * (S.shotgun - 1);
        if (this.ready(p, 'shotgun', cd * this.wcd(p), dt)) {
          const t = this.nearestEnemy(p.x, p.y, SP.shotgun.range + 40);
          if (!t) p.cd.shotgun = 0.1;
          else {
            const base = Math.atan2(t.y - p.y, t.x - p.x);
            const n = SP.shotgun.pellets;
            const per = atk * SP.shotgun.total * Math.pow(SP.shotgun.mult, S.shotgun - 1) / n;
            for (let i = 0; i < n; i++) {
              const a = base + (i / (n - 1) - 0.5) * SP.shotgun.spread + rand(-0.04, 0.04);
              this.shots.push({ id: this.nextId++, kind: 1, owner: p.id, x: p.x, y: p.y, vx: Math.cos(a) * SP.shotgun.speed, vy: Math.sin(a) * SP.shotgun.speed, dmg: per, life: SP.shotgun.range / SP.shotgun.speed, r: 5 });
            }
          }
        }
      }
      // ライトセイバー：自分のまわりを回転斬り
      if (S.lightsaber) {
        const L = SP.lightsaber;
        const cd = Math.max(0.2, L.cd - L.cdStep * (S.lightsaber - 1));
        if (this.ready(p, 'lightsaber', cd * this.wcd(p), dt)) {
          const r = L.r * (p.cs && p.cs.saberRange ? p.cs.saberRange : 1);   // ソードは範囲1.5倍
          const dmg = atk * L.dmg * Math.pow(L.mult, S.lightsaber - 1);
          this.enemiesNear(p.x, p.y, r).forEach((e) => this.damageEnemy(e, dmg, p.id));
          this.hitBoxes(p.x, p.y, r);
          this.fx.push({ id: this.nextId++, k: 6, x: p.x, y: p.y, r, rt: this.clock, o: p.slot });
        }
      }
      // リボルバー：近くの敵1体を撃ち抜く
      if (S.revolver) {
        const V = SP.revolver;
        const cd = Math.max(0.1, V.cd - V.cdStep * (S.revolver - 1));
        if (this.ready(p, 'revolver', cd * this.wcd(p), dt)) {
          const t = this.nearestEnemy(p.x, p.y, V.range);
          if (!t) p.cd.revolver = 0.05;
          else {
            this.fx.push({ id: this.nextId++, k: 4, x: p.x, y: p.y - 6, tx: t.x, ty: t.y, rt: this.clock });
            this.damageEnemy(t, atk * V.dmg * Math.pow(V.mult, S.revolver - 1), p.id);
          }
        }
      }
      // ディフェンサー：回る歯車
      if (S.defender) {
        p.gearAng += SP.defender.angSpeed * dt;
        const n = S.defender + 1;
        for (let i = 0; i < n; i++) {
          const a = p.gearAng + i * TAU / n;
          const gx = p.x + Math.cos(a) * SP.defender.orbit, gy = p.y + Math.sin(a) * SP.defender.orbit;
          this.hitBoxes(gx, gy, SP.defender.r);
          this.grid.each(gx, gy, SP.defender.r + 60, (e) => {
            if (e.dead || dist2(gx, gy, e.x, e.y) > (SP.defender.r + e.r) * (SP.defender.r + e.r)) return;
            if (this.hitReady(e, 'g' + p.id, SP.defender.hitCd)) this.damageEnemy(e, atk * SP.defender.dmg, p.id);
          });
        }
      }
      // ドローン：ロックオン連射
      if (S.drone) {
        const ox = p.x - 34, oy = p.y - 46 + Math.sin(this.t * 4) * 4;
        if (!p.drone) p.drone = { x: ox, y: oy, tgt: null };
        p.drone.x += (ox - p.drone.x) * Math.min(1, dt * 8); p.drone.y += (oy - p.drone.y) * Math.min(1, dt * 8);
        let t = p.drone.tgt;
        if (!t || t.dead || dist2(p.x, p.y, t.x, t.y) > SP.drone.range * SP.drone.range) t = p.drone.tgt = this.nearestEnemy(p.x, p.y, SP.drone.range);
        if (t) {
          p.droneAcc += (SP.drone.rate + SP.drone.rateStep * (S.drone - 1)) * dt / this.cdMul(p);
          while (p.droneAcc >= 1 && !t.dead) { p.droneAcc -= 1; this.damageEnemy(t, atk * SP.drone.dmg, p.id); }
        } else p.droneAcc = 0;
      }
      // 雷発生機
      if (S.thunder && this.ready(p, 'thunder', SP.thunder.cd, dt)) {
        const cands = this.enemiesNear(p.x, p.y, SP.thunder.range);
        if (!cands.length) p.cd.thunder = 0.2;
        shuffle(cands).slice(0, S.thunder).forEach((t) => {
          this.fx.push({ id: this.nextId++, k: 0, x: t.x, y: t.y, rt: this.clock });
          this.zones.push({ id: this.nextId++, kind: 0, owner: p.id, x: t.x, y: t.y, r: SP.thunder.fieldR, dps: atk * SP.thunder.fieldDps, life: SP.thunder.fieldTime, max: SP.thunder.fieldTime });
          this.damageEnemy(t, atk * SP.thunder.dmg, p.id);
        });
      }
      // サッカーボール：画面の端で跳ね返る
      if (S.soccer) {
        const r = SP.soccer.rPerStar * S.soccer, sp = SP.soccer.speed + SP.soccer.speedStep * (S.soccer - 1);
        if (!p.ball) { const a = rand(0, TAU); p.ball = { x: p.x, y: p.y, vx: Math.cos(a), vy: Math.sin(a) }; }
        const b = p.ball;
        const len = Math.hypot(b.vx, b.vy) || 1;
        b.vx /= len; b.vy /= len;
        b.x += b.vx * sp * dt; b.y += b.vy * sp * dt;
        const L = p.x - p.vw + r, R = p.x + p.vw - r, T = p.y - p.vh + r, B = p.y + p.vh - r;
        if (b.x < L) { b.x = L; b.vx = Math.abs(b.vx); } else if (b.x > R) { b.x = R; b.vx = -Math.abs(b.vx); }
        if (b.y < T) { b.y = T; b.vy = Math.abs(b.vy); } else if (b.y > B) { b.y = B; b.vy = -Math.abs(b.vy); }
        b.r = r;
        this.hitBoxes(b.x, b.y, r);
        this.grid.each(b.x, b.y, r + 60, (e) => {
          if (e.dead || dist2(b.x, b.y, e.x, e.y) > (r + e.r) * (r + e.r)) return;
          if (this.hitReady(e, 'b' + p.id, SP.soccer.hitCd)) this.damageEnemy(e, atk * SP.soccer.dmg, p.id);
        });
      }
      // 火炎瓶
      if (S.molotov && this.ready(p, 'molotov', SP.molotov.cd, dt)) {
        const near = shuffle(this.enemiesNear(p.x, p.y, 320));
        for (let i = 0; i < SP.molotov.bottles; i++) {
          let tx, ty;
          if (near[i]) { tx = near[i].x; ty = near[i].y; }
          else { const a = rand(0, TAU); tx = p.x + Math.cos(a) * SP.molotov.throwDist; ty = p.y + Math.sin(a) * SP.molotov.throwDist; }
          this.bottles.push({ id: this.nextId++, owner: p.id, x0: p.x, y0: p.y, x1: tx, y1: ty, t: 0, dur: 0.6,
            r: SP.molotov.r + SP.molotov.rStep * (S.molotov - 1), dps: atk * (SP.molotov.dps + SP.molotov.dpsStep * (S.molotov - 1)) });
        }
      }
    }
    hitReady(e, key, cd) {
      if (!e.hits) e.hits = {};
      const last = e.hits[key];
      if (last != null && this.clock - last < cd) return false;
      e.hits[key] = this.clock;
      return true;
    }

    updateShots(dt) {
      for (const s of this.shots) {
        s.life -= dt;
        if (s.kind === 0) {
          // クナイ：標的を追いかける。倒されていたら近くの別の敵へ
          if (!s.tgt || s.tgt.dead) s.tgt = this.nearestEnemy(s.x, s.y, 320);
          if (s.tgt) {
            const dx = s.tgt.x - s.x, dy = s.tgt.y - s.y, d = Math.hypot(dx, dy) || 1;
            const sp = SP.kunai.speed;
            s.vx += (dx / d * sp - s.vx) * Math.min(1, dt * 14);
            s.vy += (dy / d * sp - s.vy) * Math.min(1, dt * 14);
            if (d < s.tgt.r + s.r + 6) { this.damageEnemy(s.tgt, s.dmg, s.owner); s.life = 0; continue; }
          }
          s.x += s.vx * dt; s.y += s.vy * dt;
        } else {
          s.x += s.vx * dt; s.y += s.vy * dt;
          this.hitBoxes(s.x, s.y, s.r);
          this.grid.each(s.x, s.y, s.r + 60, (e) => {
            if (s.life <= 0 || e.dead) return;
            if (dist2(s.x, s.y, e.x, e.y) < (s.r + e.r) * (s.r + e.r)) { this.damageEnemy(e, s.dmg, s.owner); s.life = 0; }
          });
        }
      }
      this.shots = this.shots.filter((s) => s.life > 0);

      for (const b of this.bottles) {
        b.t += dt;
        if (b.t >= b.dur) {
          b.done = true;
          this.zones.push({ id: this.nextId++, kind: 1, owner: b.owner, x: b.x1, y: b.y1, r: b.r, dps: b.dps, life: SP.molotov.time, max: SP.molotov.time });
        }
      }
      this.bottles = this.bottles.filter((b) => !b.done);
    }
    updateEnemyShots(dt, players) {
      for (const s of this.eshots) {
        s.life -= dt;
        s.x += s.vx * dt; s.y += s.vy * dt;
        for (const p of players) {
          if (dist2(s.x, s.y, p.x, p.y) < (s.r + p.r) * (s.r + p.r)) { this.hurtPlayer(p, s.atk); s.life = 0; break; }
        }
      }
      this.eshots = this.eshots.filter((s) => s.life > 0);
    }
    updateZones(dt) {
      for (const z of this.zones) {
        z.life -= dt;
        this.hitBoxes(z.x, z.y, z.r);
        for (const e of this.enemiesNear(z.x, z.y, z.r)) this.damageEnemy(e, z.dps * dt, z.owner);
      }
      this.zones = this.zones.filter((z) => z.life > 0);
    }

    finish(win) {
      if (this.ended) return;
      this.ended = true;
      this.phase = win ? 'win' : 'lose';
      this.levelup = null;
      const stats = {};
      this.players.forEach((p) => { stats[p.id] = { kills: p.kills, coins: 300 * (p.abilities.coin || 0) }; });
      this.result = { win, time: this.t, level: this.level, stats, stage: this.stageIndex };
      this.events.push({ type: 'end', result: this.result });
    }

    /* ======================= 描画・通信用データ ======================= */
    buildOf(p) {
      return p.order.map((k) => k + ':' + p.skills[k]).join(',') + '|' + p.aorder.map((k) => k + ':' + p.abilities[k]).join(',');
    }
    snapshot() {
      const R = Math.round;
      const P = [], E = [], K = [], Q = [], Z = [], O = [], X = [];
      this.players.forEach((p) => {
        P.push([p.id, p.slot, R(p.x), R(p.y), R(p.hp), R(p.maxHp), p.down ? 1 : 0, +(p.revive / GC.PLAYER.reviveSeconds).toFixed(2), p.kills,
          this.buildOf(p), p.skills.gravity ? SP.gravity.r : 0, (p.frost ? 1 : 0) | (p.stella ? 2 : 0),
          p.look, +p.scd.toFixed(1), +Math.max(p.buff.inv, p.buff.spd, p.buff.fast, p.char === 'widow' ? Math.max(0, this.widowT) : 0).toFixed(1),
          (p.buff.inv > 0 ? 1 : 0) | (p.buff.spd > 0 ? 2 : 0) | (p.buff.fast > 0 ? 4 : 0)]);
        if (p.down) return;
        if (p.skills.defender) {
          const n = p.skills.defender + 1;
          for (let i = 0; i < n; i++) {
            const a = p.gearAng + i * TAU / n;
            O.push([0, R(p.x + Math.cos(a) * SP.defender.orbit), R(p.y + Math.sin(a) * SP.defender.orbit), SP.defender.r, p.slot, p.id + 'g' + i]);
          }
        }
        if (p.ball) O.push([1, R(p.ball.x), R(p.ball.y), p.ball.r || 20, p.slot, p.id + 'b']);
        if (p.hdrone) O.push([5, R(p.hdrone.x), R(p.hdrone.y), 14, p.slot, p.id + 'h']);
        if (p.drone) {
          const t = p.drone.tgt && !p.drone.tgt.dead ? p.drone.tgt : null;
          O.push([2, R(p.drone.x), R(p.drone.y), 14, p.slot, p.id + 'd', t ? R(t.x) : null, t ? R(t.y) : null]);
        }
      });
      for (const e of this.enemies) {
        if (e.dead) continue;
        E.push([e.id, e.ti, R(e.x), R(e.y), R(e.hp / e.maxHp * 100), e.flip ? 1 : 0, e.slow < 1 ? 1 : 0, e.mid ? 1 : 0]);
        if (e.isBoss && e.bdef.gears) {
          const g = e.bdef.gears;
          for (let i = 0; i < g.count; i++) {
            const a = e.gearAng + i * TAU / g.count;
            O.push([3, R(e.x + Math.cos(a) * g.radius), R(e.y + Math.sin(a) * g.radius), g.r, -1, 'bg' + i]);
          }
        }
      }
      for (const s of this.shots) K.push([s.id, s.kind, R(s.x), R(s.y), +Math.atan2(s.vy, s.vx).toFixed(2)]);
      for (const s of this.eshots) Q.push([s.id, s.kind, R(s.x), R(s.y), s.r]);
      for (const z of this.zones) Z.push([z.id, z.kind, R(z.x), R(z.y), z.r, +(z.life / z.max).toFixed(2)]);
      for (const b of this.bottles) {
        const k = b.t / b.dur;
        O.push([4, R(b.x0 + (b.x1 - b.x0) * k), R(b.y0 + (b.y1 - b.y0) * k - Math.sin(k * Math.PI) * 60), 12, -1, 'm' + b.id]);
      }
      for (const f of this.fx) X.push([f.id, f.k, R(f.x), R(f.y), R(f.r || 0), f.tx != null ? R(f.tx) : null, f.ty != null ? R(f.ty) : null, f.o != null ? f.o : -1]);
      const BX = this.boxes.map((b) => [b.id, R(b.x), R(b.y)]);
      const HL = this.heals.map((h) => [h.id, R(h.x), R(h.y)]);
      const boss = this.boss && !this.boss.dead ? [this.boss.id, this.boss.bossKey, R(this.boss.hp), R(this.boss.maxHp)] : null;
      const altar = this.altar && this.phase !== 'boss' && !this.ended
        ? [R(this.altar.x), R(this.altar.y), this.altar.r, this.phase === 'countdown' ? +this.countdown.toFixed(1) : -1, this.altar.inside || 0, this.altar.total || 0] : null;
      return {
        tm: +this.t.toFixed(2), ph: this.phase, lv: this.level, xp: R(this.xp), nd: this.need,
        lu: this.levelup ? Object.keys(this.levelup.options).filter((id) => !this.levelup.chosen[id]) : null,
        P, E, K, Q, Z, O, X, boss, altar, BX, HL,
        rs: this.rush > 0 ? 1 : 0, wd: this.widowT > 0 ? 1 : 0, pd: this.partyDiff,
      };
    }
  }

  DS.Sim = Sim;
  DS.Sim.ENEMY_TYPES = ENEMY_TYPES;
  DS.Sim.PROJ_KINDS = PROJ_KINDS;
})();
