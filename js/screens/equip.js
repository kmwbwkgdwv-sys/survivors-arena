/* =========================================================
 *  screens/equip.js  ― 装備画面
 *   スロット: 武器 / ベルト / 防具 / 靴（所持している装備だけ装着できる）
 *   キャラ  : キャラガチャで手に入れたキャラを設定（ATK・HP に倍率）
 *   合成    : 同じ装備3つで ❶ → ❷ → ❸（ATK/HP が 2倍 / 5倍 / 10倍）
 * ========================================================= */
(function () {
  const C = DS.config, S = DS.state, A = DS.art, U = DS.ui;
  const F = C.FUSION;
  const { $, $$, esc, fmt, toast, modal } = U;
  const PLACEHOLDER = { weapon: 'kunai', belt: 'eternalBelt', armor: 'plateArmor', boots: 'eternalBoots' };
  let filter = 'all';

  const card = (p, extra = {}) => U.itemCard(p.item, p.rarity, Object.assign({ lv: p.lv }, extra));
  const fullName = (p) => p.def.name + (p.lv ? ' ' + F.marks[p.lv] : '');

  function render() {
    const el = $('#screen-equip');
    const slotBox = (key) => {
      const s = C.SLOTS.find((x) => x.key === key);
      return `<button class="eslot" data-slot="${key}"><span class="eslot-card" id="eslot-${key}"></span><span class="eslot-label">${s.name}</span></button>`;
    };
    el.innerHTML = `
      <div class="screen-bg equip-bg"></div>
      <div class="screen-scroll">
        <div class="stat-bar">
          <div class="stat"><b class="c-atk">ATK</b><span id="st-atk"></span></div>
          <div class="stat"><b class="c-hp">HP</b><span id="st-hp"></span></div>
          <div class="stat"><b class="c-spd">速度</b><span id="st-spd"></span></div>
        </div>
        <div class="equip-stage">
          <div class="slot-col">${slotBox('weapon')}${slotBox('belt')}</div>
          <button class="equip-hero" id="equip-hero" aria-label="キャラを変更">
            <div class="pedestal"></div><div class="equip-hero-art" id="equip-hero-art"></div>
            <span class="char-chip" id="char-chip"></span>
          </button>
          <div class="slot-col">${slotBox('armor')}${slotBox('boots')}</div>
        </div>
        <div class="effects" id="effects"></div>
        <div class="inv">
          <div class="inv-head">
            <span class="inv-title">所持装備</span><small id="inv-count"></small>
            <button class="btn btn-small btn-yellow fuse-btn" id="btn-fuse">合成<b class="badge hidden" id="fuse-badge"></b></button>
          </div>
          <div class="chips" id="inv-filter">
            <button class="chip" data-f="all">全て</button>
            ${C.SLOTS.map((s) => `<button class="chip" data-f="${s.key}">${s.name}</button>`).join('')}
          </div>
          <div class="inv-grid" id="inv-grid"></div>
        </div>
      </div>`;
    $$('.eslot', el).forEach((b) => b.addEventListener('click', () => {
      const key = S.data.equipped[b.dataset.slot];
      if (key) openDetail(key);
      else {
        setFilter(b.dataset.slot);
        $('#inv-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
        toast(`装備する${C.SLOTS.find((s) => s.key === b.dataset.slot).name}を選んでください`);
      }
    }));
    $$('#inv-filter .chip', el).forEach((c) => c.addEventListener('click', () => setFilter(c.dataset.f)));
    $('#btn-fuse', el).addEventListener('click', openFusion);
    $('#equip-hero', el).addEventListener('click', () => openChars('look'));
    update();
  }

  function setFilter(f) { filter = f; update(); }

  function update() {
    if (!$('#st-atk')) return;
    const st = S.getStats();
    $('#st-atk').textContent = fmt(st.atk);
    $('#st-hp').textContent = fmt(st.hp);
    $('#st-spd').textContent = fmt(st.spd);

    // キャラ
    const ch = S.charInfo(S.data.char);
    $('#equip-hero-art').innerHTML = A.charSvg(S.data.look);
    $('#char-chip').innerHTML = ch
      ? `${U.rarityLabel(ch.rarity)}<b>${esc(ch.name)}</b><em>×${ch.mult}</em>`
      : '<b>見た目・キャラ変更</b>';

    // スロット
    C.SLOTS.forEach(({ key }) => {
      const eq = S.parseKey(S.data.equipped[key]);
      $('#eslot-' + key).innerHTML = eq
        ? card(eq)
        : `<div class="icard empty">${A.item(PLACEHOLDER[key])}<span class="plus">＋</span></div>`;
    });

    // 発動中の効果
    const lines = [];
    if (ch) {
      lines.push(`<span class="eff good"><i>${esc(ch.name)}</i>ATK・HP ×${ch.mult}</span>`);
      if (ch.skill) lines.push(`<span class="eff skill"><i>${esc(ch.skill.name)}</i>${esc(ch.skill.desc)}</span>`);
    }
    C.SLOTS.forEach(({ key }) => {
      const eq = S.parseKey(S.data.equipped[key]);
      if (!eq) return;
      U.effectLines(eq.item).forEach((e) => lines.push(`<span class="eff ${e.good ? 'good' : 'bad'}"><i>${esc(eq.def.name)}</i>${esc(e.text)}</span>`));
    });
    $('#effects').innerHTML = lines.length
      ? `<div class="effects-title">装備効果</div><div class="effs">${lines.join('')}</div>`
      : '';

    // 合成できる数
    const fusible = S.fusibleList().length;
    $('#fuse-badge').textContent = fusible;
    $('#fuse-badge').classList.toggle('hidden', !fusible);

    // 所持装備リスト
    const list = S.inventoryList();
    const shown = list.filter((x) => filter === 'all' || x.slot === filter);
    const total = list.reduce((a, x) => a + x.count, 0);
    $('#inv-count').textContent = `${total}個`;
    $$('#inv-filter .chip').forEach((c) => c.classList.toggle('active', c.dataset.f === filter));
    const equippedKeys = Object.values(S.data.equipped);
    $('#inv-grid').innerHTML = shown.length
      ? shown.map((x) => card(x, {
        count: x.count, equipped: equippedKeys.includes(x.key),
        tag: x.lv < F.max && x.count >= F.need ? '合成可' : '',
        attrs: `data-key="${x.key}" role="button" tabindex="0"`,
      })).join('')
      : `<p class="inv-empty">この種類の装備はまだ持っていません。<br>ガチャで手に入れよう！</p>`;
    $$('#inv-grid .icard').forEach((c) => c.addEventListener('click', () => openDetail(c.dataset.key)));
  }

  /* ---------- 装備の詳細 ---------- */
  function openDetail(key) {
    const p = S.parseKey(key);
    if (!p) return;
    const slotDef = C.SLOTS.find((s) => s.key === p.slot);
    const isEquipped = S.data.equipped[p.slot] === p.key;
    const count = S.data.inventory[p.key] || 0;
    const statName = U.STAT_NAME[slotDef.stat];
    const value = p.rar[slotDef.stat] * F.mult[p.lv];

    let compare = '';
    if (!isEquipped) {
      const now = S.getStats();
      const next = S.getStats(Object.assign({}, S.data.equipped, { [p.slot]: p.key }));
      const diffs = ['atk', 'hp', 'spd'].map((k) => [k, next[k] - now[k]]).filter(([, v]) => v !== 0);
      compare = `<div class="compare"><small>装備すると</small>${diffs.length
        ? diffs.map(([k, v]) => `<span class="${v > 0 ? 'up' : 'down'}">${U.STAT_NAME[k]} ${U.sign(v)}</span>`).join('')
        : '<span>ステータス変化なし</span>'}</div>`;
    }
    const fuseInfo = p.lv < F.max
      ? `<div class="fuse-hint ${count >= F.need ? 'ok' : ''}">合成 ${Math.min(count, F.need)} / ${F.need}　→　${F.marks[p.lv + 1]}（${statName} ${fmt(p.rar[slotDef.stat] * F.mult[p.lv + 1])}）</div>`
      : `<div class="fuse-hint max">合成は ${F.marks[F.max]} が最大です</div>`;

    const effects = U.effectLines(p.item);
    const buttons = [{ label: 'とじる', cls: 'btn-gray' }];
    if (S.canFuse(p.key)) {
      buttons.push({ label: `合成 ${F.marks[p.lv + 1]}`, cls: 'btn-yellow', onClick: () => { const nk = S.fuse(p.key); if (nk) showFused([nk]); } });
    }
    if (isEquipped) {
      if (p.slot !== 'weapon') buttons.push({ label: '外す', cls: 'btn-red', onClick: () => { S.unequip(p.slot); toast(`${p.def.name}を外しました`); } });
    } else {
      buttons.push({ label: '装備する', cls: 'btn-green', onClick: () => { S.equip(p.key); toast(`${fullName(p)}（${p.rar.name}）を装備しました`, 'good'); } });
    }

    modal({
      title: fullName(p),
      body: `
        <div class="detail">
          <div class="detail-card">${card(p)}</div>
          <div class="detail-info">
            <div class="detail-tags">${U.rarityLabel(p.rarity)}<span class="slot-tag">${slotDef.name}</span>${p.lv ? `<span class="slot-tag fz-tag">合成${F.marks[p.lv]} ×${F.mult[p.lv]}</span>` : ''}</div>
            <div class="detail-stat"><b class="c-${slotDef.stat}">${statName}</b><span>+${fmt(value)}</span></div>
            ${effects.length ? `<div class="effs">${effects.map((e) => `<span class="eff ${e.good ? 'good' : 'bad'}">${esc(e.text)}</span>`).join('')}</div>` : ''}
            <div class="detail-own">所持数 ×${count}${isEquipped ? '　<b class="eq-mark">装備中</b>' : ''}</div>
          </div>
        </div>
        <p class="detail-desc">${esc(p.def.desc)}</p>
        ${fuseInfo}
        ${compare}
        ${isEquipped && p.slot === 'weapon' ? '<p class="note dark center">武器は外せません。別の武器を装備すると入れ替わります。</p>' : ''}`,
      buttons,
    });
  }

  /* ---------- 合成 ---------- */
  function fusionBody() {
    const list = S.fusibleList();
    if (!list.length) {
      return `<p class="center">合成できる装備はありません。</p>
        <p class="note dark center">同じ装備（種類・レアリティ・合成段階が同じもの）を${F.need}つ集めると合成できます。<br>
        ${F.marks.slice(1).map((m, i) => `${m}：ATK/HP ${F.mult[i + 1]}倍`).join('　')}</p>`;
    }
    return `<p class="note dark center">同じ装備${F.need}つで1段階上がります。${F.marks.slice(1).map((m, i) => `${m} ${F.mult[i + 1]}倍`).join(' → ')}</p>
      <div class="fuse-list">${list.map((x) => {
        const next = Object.assign({}, x, { lv: x.lv + 1 });
        const times = Math.floor(x.count / F.need);
        return `<div class="fuse-row">
          <div class="fuse-from">${card(x, { cls: 'mini' })}<span>×${F.need}</span></div>
          <span class="fuse-arrow">➜</span>
          <div class="fuse-to">${card(next, { cls: 'mini' })}</div>
          <div class="fuse-name"><b>${esc(fullName(next))}</b><small>${x.rar.name}・${times}回できます</small></div>
          <button class="btn btn-yellow btn-small" data-key="${x.key}">合成</button>
        </div>`;
      }).join('')}</div>`;
  }
  function openFusion() {
    const m = modal({
      title: '合成', cls: 'modal-wide', body: fusionBody(),
      buttons: [
        { label: 'とじる', cls: 'btn-gray' },
        { label: 'まとめて合成', cls: 'btn-yellow', disabled: !S.fusibleList().length, onClick: () => { const made = S.fuseAll(); if (made.length) showFused(made); } },
      ],
    });
    const bind = () => $$('.fuse-row .btn', m.el).forEach((b) => b.addEventListener('click', () => {
      const nk = S.fuse(b.dataset.key);
      if (!nk) return;
      m.close();
      showFused([nk]);
    }));
    bind();
  }
  function showFused(keys) {
    const counts = {};
    keys.forEach((k) => { counts[k] = (counts[k] || 0) + 1; });
    const best = keys.map(S.parseKey).sort((a, b) => b.lv - a.lv)[0];
    modal({
      title: '合成成功！',
      cls: best.lv >= 3 ? 'modal-fz3' : '',
      body: `<div class="fused">${Object.keys(counts).map((k) => {
        const p = S.parseKey(k);
        return `<div class="fused-item">${card(p)}<b>${esc(fullName(p))}</b>${U.rarityLabel(p.rarity)}${counts[k] > 1 ? `<small>×${counts[k]}</small>` : ''}</div>`;
      }).join('')}</div>`,
      buttons: [{ label: 'OK', cls: 'btn-yellow' }],
    });
  }

  /* ---------- キャラ（見た目とスキルは別々に選べる） ---------- */
  function openChars(startTab) {
    let tab = startTab === 'skill' ? 'skill' : 'look';
    let sel = (tab === 'look' ? S.data.look : S.data.char) || '';
    const m = modal({ title: 'キャラ', cls: 'modal-wide', body: '<div id="char-body"></div>', buttons: [{ label: 'とじる', cls: 'btn-gray' }] });
    const nameOf = (k) => (k ? C.CHARACTERS[k].name : '初期キャラ');
    const draw = () => {
      const list = S.charList();
      const info = sel ? S.charInfo(sel) : null;
      const owned = !sel || (S.data.chars[sel] || 0) > 0;
      const cur = (tab === 'look' ? S.data.look : S.data.char) || '';
      const isCur = cur === sel;
      let action;
      if (tab === 'look') {
        action = isCur ? '<button class="btn btn-gray btn-small" disabled>この見た目にしています</button>'
          : '<button class="btn btn-green btn-small" id="char-set">この見た目にする</button>';
      } else {
        action = isCur ? '<button class="btn btn-gray btn-small" disabled>このキャラを使っています</button>'
          : owned ? '<button class="btn btn-green btn-small" id="char-set">このキャラのスキルを使う</button>'
            : '<button class="btn btn-gray btn-small" disabled>未所持（キャラガチャで入手）</button>';
      }
      const skillCh = S.charInfo(S.data.char);
      $('#char-body', m.el).innerHTML = `
        <div class="char-now">
          <span><small>見た目</small><b>${esc(nameOf(S.data.look))}</b></span>
          <span><small>スキル・強さ</small><b>${skillCh ? `${esc(skillCh.name)}（ATK・HP×${skillCh.mult}）` : 'なし（×1）'}</b></span>
        </div>
        <div class="seg char-tabs">
          <button class="seg-btn ${tab === 'look' ? 'active' : ''}" data-t="look">見た目</button>
          <button class="seg-btn ${tab === 'skill' ? 'active' : ''}" data-t="skill">スキル・強さ</button>
        </div>
        <p class="note dark center char-hint">${tab === 'look'
          ? '見た目はどのキャラにも、いつでも変えられます（持っていなくてもOK）'
          : '持っているキャラのスキルと ATK・HP の倍率を使えます。見た目とは別に選べます'}</p>
        <div class="char-pick">
          <div class="char-big">${U.charCard(sel, { dim: tab === 'skill' && !owned })}</div>
          <div class="char-info">
            ${info ? `<div class="detail-tags">${U.rarityLabel(info.rarity)}${tab === 'skill' && !owned ? '<span class="slot-tag">未所持</span>' : ''}</div><b class="char-name">${esc(info.name)}</b>
              ${tab === 'skill' ? `<span class="char-mult">ATK・HP <b>×${info.mult}</b></span>
              ${info.skill ? `<span class="char-skill"><em>${info.skill.passive ? '常時発動' : `特殊スキル（${info.skill.cd}秒ごと）`}</em><b>${esc(info.skill.name)}</b>${esc(info.skill.desc)}</span>` : '<small class="char-noskill">特殊スキルはレア以上のキャラから</small>'}` : ''}
              <small>${esc(info.desc)}</small>`
            : `<b class="char-name">初期キャラ</b>${tab === 'skill' ? '<span class="char-mult">倍率なし・スキルなし</span>' : ''}`}
            ${action}
          </div>
        </div>
        <div class="char-grid">
          <button class="char-cell ${!sel ? 'sel' : ''}" data-k="">${U.charCard('', { cls: 'mini', equipped: !cur })}<small>初期</small></button>
          ${list.map((c) => `<button class="char-cell ${sel === c.key ? 'sel' : ''}" data-k="${c.key}">
            ${U.charCard(c.key, { cls: 'mini', count: tab === 'skill' ? c.count : 0, equipped: cur === c.key, dim: tab === 'skill' && !c.count })}<small>${esc(c.name)}</small></button>`).join('')}
        </div>`;
      $$('.char-tabs .seg-btn', m.el).forEach((b) => b.addEventListener('click', () => {
        tab = b.dataset.t; sel = (tab === 'look' ? S.data.look : S.data.char) || ''; draw();
      }));
      $$('.char-cell', m.el).forEach((b) => b.addEventListener('click', () => { sel = b.dataset.k; draw(); }));
      const setBtn = $('#char-set', m.el);
      if (setBtn) setBtn.addEventListener('click', () => {
        if (tab === 'look') { S.setLook(sel || null); toast(`見た目を ${nameOf(sel)} にしました`, 'good'); }
        else { S.setChar(sel || null); toast(sel ? `${nameOf(sel)} のスキルを使います` : 'キャラのスキルを外しました', 'good'); }
        if (DS.sound) DS.sound.play('equip');
        draw();
      });
    };
    draw();
  }

  DS.equip = { render, update, openChars };
})();
