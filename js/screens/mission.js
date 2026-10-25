/* =========================================================
 *  screens/mission.js  ― ミッション
 *   ・ステージを1つクリアするたびに 3,000 コイン
 *   ・敵を100体倒すごとに 300 コイン
 * ========================================================= */
(function () {
  const C = DS.config, S = DS.state, A = DS.art, U = DS.ui;
  const { $, $$, esc, fmt, toast, modal } = U;

  function body() {
    const st = S.missionStatus();
    const MC = DS.gameConfig.MISSIONS;
    const claimBtn = (k, n, coins) => n
      ? `<button class="btn btn-green ms-claim" data-k="${k}">受け取る<small>${A.coin()}+${fmt(coins)}</small></button>`
      : '<button class="btn btn-gray ms-claim" disabled>未達成</button>';
    return `
      <div class="ms-list">
        <div class="ms-card ${st.clearN ? 'ready' : ''}">
          <span class="ms-ic">${A.navIcon('lobby')}</span>
          <div class="ms-body">
            <b>ステージをクリアする</b>
            <small>1回ごとに ${A.coin()}${fmt(MC.stageClearReward)}</small>
            <span class="ms-prog-text">クリア ${fmt(st.clears)}回</span>
          </div>
          ${claimBtn('clear', st.clearN, st.clearCoins)}
        </div>
        <div class="ms-card ${st.killN ? 'ready' : ''}">
          <span class="ms-ic foe">${A.enemyIcon('zombie')}</span>
          <div class="ms-body">
            <b>敵を${MC.killStep}体倒す</b>
            <small>${MC.killStep}体ごとに ${A.coin()}${fmt(MC.killReward)}</small>
            <span class="ms-bar"><i style="width:${st.killProgress / st.killStep * 100}%"></i><em>${st.killProgress} / ${st.killStep}</em></span>
            <span class="ms-prog-text">累計 ${fmt(st.kills)}体</span>
          </div>
          ${claimBtn('kill', st.killN, st.killCoins)}
        </div>
      </div>
      <h3 class="sub-head">ステージのクリア状況</h3>
      <div class="ms-stages">${C.STAGES.map((s) => {
        const n = st.stages[s.key] || 0;
        return `<div class="ms-stage ${n ? 'done' : ''}"><span>STAGE ${s.no}</span><b>${esc(s.name)}</b><em>${n ? `クリア ${n}回` : '未クリア'}</em></div>`;
      }).join('')}</div>`;
  }

  function open() {
    const m = modal({ title: 'ミッション', cls: 'modal-wide', body: body(), buttons: [{ label: 'とじる', cls: 'btn-blue' }] });
    const bind = () => {
      $$('.ms-claim[data-k]', m.el).forEach((b) => b.addEventListener('click', () => {
        const coins = S.claimMission(b.dataset.k);
        if (coins) toast(`${fmt(coins)} コインを受け取りました`, 'good');
        m.body.innerHTML = body();
        bind();
      }));
    };
    bind();
  }

  DS.mission = { open };
})();
