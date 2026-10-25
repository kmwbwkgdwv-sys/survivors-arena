/* =========================================================
 *  state.js  ― プレイヤーデータ（コイン・装備・キャラ・ミッション）
 *  localStorage に保存します（引き継ぎ設定時はクラウドにも保存）。
 *
 *  所持装備は「アイテム : レアリティ : 合成段階」ごとに個数で管理します。
 *    inventory: { 'kunai:common:0': 2, 'frostBoots:epic:1': 1, ... }
 *    equipped : { weapon: 'kunai:common:0', belt: null, armor: null, boots: null }
 *  キャラ：
 *    chars: { smoke: 1, widow: 2 }   char: 'widow' または null（初期キャラ）
 * ========================================================= */
(function () {
  const C = DS.config;
  const F = C.FUSION;
  const listeners = new Set();

  const RARITY = {};
  C.RARITIES.forEach((r, i) => { RARITY[r.key] = Object.assign({ rank: i }, r); });

  function makeKey(item, rarity, lv = 0) { return item + ':' + rarity + ':' + (lv | 0); }
  function parseKey(key) {
    if (!key) return null;
    const [item, rarity, lvs] = String(key).split(':');
    const lv = Math.max(0, Math.min(F.max, parseInt(lvs || '0', 10) || 0));
    if (!C.ITEMS[item] || !RARITY[rarity]) return null;
    return { key: makeKey(item, rarity, lv), item, rarity, lv, def: C.ITEMS[item], rar: RARITY[rarity], slot: C.ITEMS[item].slot };
  }

  function randomName() {
    return 'サバイバー' + String(Math.floor(1000 + Math.random() * 9000));
  }

  function freshSave() {
    const s = {
      version: 3,
      name: randomName(),
      coins: C.START_COINS,
      inventory: {},
      equipped: { weapon: null, belt: null, armor: null, boots: null },
      // char: スキルと強さを使うキャラ（持っているキャラだけ） / look: 見た目（いつでも誰でも）
      chars: {}, char: null, look: null,
      tickets: Object.assign({}, C.START_TICKETS),
      flags: {},
      totalPulls: 0,
      // ミッションの進み具合（回数を数えて、受け取った回数との差が受け取れる報酬）
      missions: { clears: 0, clearsClaimed: 0, kills: 0, killsClaimed: 0, stages: {} },
      updatedAt: Date.now(),
    };
    C.STARTER_ITEMS.forEach((st) => {
      const k = makeKey(st.item, st.rarity, 0);
      s.inventory[k] = (s.inventory[k] || 0) + 1;
      if (st.equip) s.equipped[C.ITEMS[st.item].slot] = k;
    });
    return s;
  }

  /** 読み込んだデータを正しい形に整える（古い形式の移行もここで） */
  function normalize(obj) {
    const old = obj || {};
    const s = Object.assign(freshSave(), old);
    s.missions = Object.assign(freshSave().missions, s.missions || {});
    s.flags = s.flags && typeof s.flags === 'object' ? s.flags : {};
    s.tickets = Object.assign({ item10: 0, char10: 0 }, s.tickets || {});
    if ((old.version || 1) < 3) {
      // 前のバージョンからの移行：まだガチャを引いていなければ最初のチケットを渡す
      s.tickets.item10 = (old.totalPulls || 0) > 0 ? 0 : C.START_TICKETS.item10;
      s.tickets.char10 = 0;
      s.look = old.char || null;
    }
    s.chars = s.chars && typeof s.chars === 'object' ? s.chars : {};
    // 装備のキーを「アイテム:レアリティ:合成段階」にそろえる
    const inv = {};
    Object.keys(s.inventory || {}).forEach((k) => {
      const p = parseKey(k);
      const n = Math.floor(Number(s.inventory[k]) || 0);
      if (p && n > 0) inv[p.key] = (inv[p.key] || 0) + n;
    });
    s.inventory = inv;
    const eq = { weapon: null, belt: null, armor: null, boots: null };
    C.SLOTS.forEach(({ key }) => {
      const p = parseKey(s.equipped && s.equipped[key]);
      if (p && inv[p.key] && p.slot === key) eq[key] = p.key;
    });
    // 武器は必ず1つ
    if (!eq.weapon) {
      const w = Object.keys(inv).map(parseKey).find((p) => p.slot === 'weapon');
      if (w) eq.weapon = w.key;
      else { const k = makeKey('kunai', 'common', 0); inv[k] = 1; eq.weapon = k; }
    }
    s.equipped = eq;
    Object.keys(s.chars).forEach((k) => { if (!C.CHARACTERS[k] || !(s.chars[k] > 0)) delete s.chars[k]; });
    if (s.char && !s.chars[s.char]) s.char = null;
    if (s.look && !C.CHARACTERS[s.look]) s.look = null;
    ['item10', 'char10'].forEach((k) => { s.tickets[k] = Math.max(0, Math.floor(Number(s.tickets[k]) || 0)); });
    s.version = 3;
    grantProgressRewards(s);
    return s;
  }

  /* ---------- 進み具合（ステージ解放・ガチャ解放・チケット） ---------- */
  /** 一番先までクリアしたステージ（0 始まり）。1つもクリアしていなければ -1 */
  function progressOf(s) {
    let p = -1;
    C.STAGES.forEach((st, i) => { if ((s.missions.stages[st.key] || 0) > 0) p = Math.max(p, i); });
    return p;
  }
  /** 進み具合に応じたごほうびを渡す（何度呼んでも1回だけ）。新しく起きたことを配列で返す */
  function grantProgressRewards(s) {
    const p = progressOf(s), got = [];
    if (p >= C.FULL_RARITY_UNLOCK && !s.flags.fullRarity) { s.flags.fullRarity = true; got.push('fullRarity'); }
    if (p >= C.CHAR_TICKET_STAGE && !s.flags.charTicket) {
      s.flags.charTicket = true;
      s.tickets.char10 = (s.tickets.char10 || 0) + 1;
      got.push('charTicket');
    }
    return got;
  }

  function load() {
    try {
      const raw = localStorage.getItem(C.SAVE_KEY);
      return raw ? normalize(JSON.parse(raw)) : freshSave();
    } catch (e) {
      return freshSave();
    }
  }

  let save = load();
  const progress = () => progressOf(save);
  /** 遊べる一番先のステージ（0 始まり）。前のステージをクリアすると次が遊べる */
  const maxStage = () => Math.min(C.STAGES.length - 1, progress() + 1);
  const isStageOpen = (i) => i <= maxStage();
  const fullRarity = () => !!save.flags.fullRarity;

  function persist() {
    save.updatedAt = Date.now();
    try { localStorage.setItem(C.SAVE_KEY, JSON.stringify(save)); } catch (e) { /* 保存できない環境では無視 */ }
    listeners.forEach((fn) => fn(save));
  }
  persist(); // 初回起動時のデータもすぐ保存しておく

  // ---------- ステータス計算 ----------
  function itemStats(key) {
    const p = parseKey(key);
    if (!p) return null;
    const slotDef = C.SLOTS.find((s) => s.key === p.slot);
    const base = { atk: 0, hp: 0, spd: 0 };
    const rv = p.rar[slotDef.stat] * F.mult[p.lv];     // 合成すると 2倍 / 5倍 / 10倍
    base[slotDef.stat] += rv;
    const bonus = p.def.bonus || {};
    return {
      atk: base.atk + (bonus.atk || 0),
      hp: base.hp + (bonus.hp || 0),
      spd: base.spd + (bonus.spd || 0),
      rarityStat: { stat: slotDef.stat, value: rv },
      bonus,
      aura: p.def.aura || null,
    };
  }

  function charInfo(key) {
    const d = C.CHARACTERS[key];
    if (!d) return null;
    return Object.assign({ key, mult: C.CHAR_MULT[d.rarity], rar: RARITY[d.rarity] }, d);
  }

  function getStats(equipped, charKey) {
    const eq = equipped || save.equipped;
    const ch = charInfo(charKey === undefined ? save.char : charKey);
    const t = Object.assign({}, C.BASE_STATS);
    const auras = [];
    C.SLOTS.forEach(({ key }) => {
      const st = itemStats(eq[key]);
      if (!st) return;
      t.atk += st.atk; t.hp += st.hp; t.spd += st.spd;
      if (st.aura) auras.push(Object.assign({ from: parseKey(eq[key]).def.name }, st.aura));
    });
    const m = ch ? ch.mult : 1;
    return { atk: Math.round(t.atk * m), hp: Math.round(t.hp * m), spd: t.spd, auras, charMult: m };
  }

  /** バトルで使うプレイヤー情報 */
  function getLoadout() {
    const stats = getStats();
    const w = parseKey(save.equipped.weapon);
    return {
      name: save.name,
      atk: stats.atk, hp: stats.hp, spd: stats.spd,
      auras: stats.auras,
      weapon: w ? Object.assign({ item: w.item, rarity: w.rarity }, w.def.weapon) : null,
      equipped: Object.assign({}, save.equipped),
      char: save.char,
      look: save.look,
    };
  }

  // ---------- 操作 ----------
  function addCoins(n) { save.coins = Math.max(0, save.coins + n); persist(); }

  function spendCoins(n) {
    if (save.coins < n) return false;
    save.coins -= n; persist();
    return true;
  }

  /** 所持装備に追加。初入手なら true を返す */
  function addItem(item, rarity, lv = 0) {
    const k = makeKey(item, rarity, lv);
    const isNew = !save.inventory[k];
    save.inventory[k] = (save.inventory[k] || 0) + 1;
    return isNew;
  }

  function equip(key) {
    const p = parseKey(key);
    if (!p || !save.inventory[p.key]) return false;   // 所持していない装備は装着不可
    save.equipped[p.slot] = p.key;
    persist();
    return true;
  }

  function unequip(slot) {
    if (slot === 'weapon') return false;            // 武器は必ず1つ装備
    save.equipped[slot] = null;
    persist();
    return true;
  }

  /** 合成：同じ装備3つ → 1段階上。成功したら新しいキーを返す */
  function canFuse(key) {
    const p = parseKey(key);
    return !!p && p.lv < F.max && (save.inventory[p.key] || 0) >= F.need;
  }
  function fuse(key, silent) {
    if (!canFuse(key)) return null;
    const p = parseKey(key);
    const nk = makeKey(p.item, p.rarity, p.lv + 1);
    save.inventory[p.key] -= F.need;
    if (save.inventory[p.key] <= 0) delete save.inventory[p.key];
    save.inventory[nk] = (save.inventory[nk] || 0) + 1;
    // 装備中の装備がなくなったら、合成後の装備をそのまま装備する
    if (save.equipped[p.slot] === p.key && !save.inventory[p.key]) save.equipped[p.slot] = nk;
    if (!silent) persist();
    return nk;
  }
  /** 合成できるものを全部合成（低い段階から順に）。合成結果の一覧を返す */
  function fuseAll() {
    const made = [];
    let again = true;
    while (again) {
      again = false;
      for (const k of Object.keys(save.inventory).sort((a, b) => parseKey(a).lv - parseKey(b).lv)) {
        while (canFuse(k)) { made.push(fuse(k, true)); again = true; }
      }
    }
    if (made.length) persist();
    return made;
  }
  function fusibleList() { return inventoryList().filter((x) => x.lv < F.max && x.count >= F.need); }

  // ---------- キャラ ----------
  function addChar(key) {
    if (!C.CHARACTERS[key]) return false;
    const isNew = !save.chars[key];
    save.chars[key] = (save.chars[key] || 0) + 1;
    return isNew;
  }
  function setChar(key) {
    if (key && !save.chars[key]) return false;
    save.char = key || null;
    persist();
    return true;
  }
  function charList() {
    return Object.keys(C.CHARACTERS).map((k) => Object.assign(charInfo(k), { count: save.chars[k] || 0 }))
      .sort((a, b) => b.rar.rank - a.rar.rank);
  }
  function charGachaUnlocked() { return progress() >= C.CHAR_TICKET_STAGE; }
  function setLook(key) {
    if (key && !C.CHARACTERS[key]) return false;
    save.look = key || null;
    persist();
    return true;
  }
  function useTicket(kind) {
    if (!(save.tickets[kind] > 0)) return false;
    save.tickets[kind]--;
    return true;
  }

  function setName(name) {
    save.name = String(name).trim().slice(0, 10) || save.name;
    persist();
  }

  function inventoryList() {
    return Object.keys(save.inventory)
      .map((k) => { const p = parseKey(k); return p && Object.assign(p, { count: save.inventory[k] }); })
      .filter(Boolean)
      .sort((a, b) => b.rar.rank - a.rar.rank || b.lv - a.lv
        || C.SLOTS.findIndex((s) => s.key === a.slot) - C.SLOTS.findIndex((s) => s.key === b.slot)
        || a.item.localeCompare(b.item));
  }

  function resetSave() { save = freshSave(); persist(); }

  /** クラウドから復元したデータで置き換える */
  function replaceSave(data) {
    save = normalize(data);
    persist();
  }
  /** クラウド保存用のデータ */
  function exportSave() { return JSON.parse(JSON.stringify(save)); }

  // ---------- 試合結果とミッション ----------
  /** 試合が終わったら呼ぶ：倒した数・クリア・コイン獲得（アビリティ）を記録 */
  function recordMatch({ win, stageKey, kills, coins }) {
    const m = save.missions;
    const before = maxStage();
    m.kills += Math.max(0, kills | 0);
    if (win) { m.clears++; m.stages[stageKey] = (m.stages[stageKey] || 0) + 1; }
    if (coins > 0) save.coins += coins;
    const got = grantProgressRewards(save);
    if (maxStage() > before) got.push('stage:' + maxStage());
    persist();
    return got;
  }
  function missionStatus() {
    const MC = DS.gameConfig.MISSIONS, m = save.missions;
    const clearN = Math.max(0, m.clears - m.clearsClaimed);
    const killN = Math.max(0, Math.floor(m.kills / MC.killStep) - m.killsClaimed);
    return {
      clears: m.clears, kills: m.kills, stages: m.stages,
      clearN, clearCoins: clearN * MC.stageClearReward,
      killN, killCoins: killN * MC.killReward,
      killProgress: m.kills % MC.killStep, killStep: MC.killStep,
      claimable: clearN + killN,
    };
  }
  /** kind: 'clear' | 'kill'。受け取ったコインの数を返す */
  function claimMission(kind) {
    const st = missionStatus(), m = save.missions;
    let coins = 0;
    if (kind === 'clear' && st.clearN) { coins = st.clearCoins; m.clearsClaimed += st.clearN; }
    if (kind === 'kill' && st.killN) { coins = st.killCoins; m.killsClaimed += st.killN; }
    if (coins) { save.coins += coins; persist(); }
    return coins;
  }

  DS.state = {
    get data() { return save; },
    RARITY, makeKey, parseKey, itemStats, getStats, getLoadout,
    addCoins, spendCoins, addItem, equip, unequip, setName,
    canFuse, fuse, fuseAll, fusibleList,
    addChar, setChar, setLook, charInfo, charList, charGachaUnlocked, useTicket,
    progress, maxStage, isStageOpen, fullRarity,
    inventoryList, persist, resetSave, replaceSave, exportSave, normalize,
    recordMatch, missionStatus, claimMission,
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
  };
})();
