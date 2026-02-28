/**
 * avatar-hud.js — Crabcake.kids
 * Drop-in HUD portrait for any game page.
 *
 * Usage: <script src="avatar-hud.js"></script>
 * Then call: CrabcakeHUD.inject('#hud-target')  (or it auto-injects)
 *
 * localStorage key: crabcake_avatar
 * Shape: { skin, hairStyle, hairColor, eyeColor, top, bottom, shoe, pet }
 */

(function(global) {
  'use strict';

  /* ── Colour helpers ── */
  function h2r(h){const r=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);return r?[parseInt(r[1],16),parseInt(r[2],16),parseInt(r[3],16)]:[80,80,80];}
  function r2h(r,g,b){return '#'+[r,g,b].map(x=>Math.max(0,Math.min(255,Math.round(x))).toString(16).padStart(2,'0')).join('');}
  function dk(h,p){const[r,g,b]=h2r(h),f=1-p/100;return r2h(r*f,g*f,b*f);}
  function lt(h,p){const[r,g,b]=h2r(h),f=p/100;return r2h(r+(255-r)*f,g+(255-g)*f,b+(255-b)*f);}

  /* ── Data tables ── */
  const SKINS = [
    {id:'s1',l:'#fde0c0',m:'#f0c090',i:'#f0a090'},
    {id:'s2',l:'#fde8d0',m:'#f0c898',i:'#f0a080'},
    {id:'s3',l:'#f4c07a',m:'#d4984a',i:'#c08050'},
    {id:'s4',l:'#c8905a',m:'#a06030',i:'#8a4820'},
    {id:'s5',l:'#9a6845',m:'#7a4828',i:'#7a3820'},
  ];
  const HAIR_COLS = {
    hc1:'#f0c040',hc2:'#c0392b',hc3:'#8b4513',hc4:'#6b3a00',
    hc5:'#1a1a1a',hc6:'#e0e0e0',hc7:'#9b59b6',hc8:'#1abc9c',
  };
  const EYE_COLS = {
    ec1:'#2980b9',ec2:'#27ae60',ec3:'#7b5500',
    ec4:'#1a1a2e',ec5:'#2eaa88',ec6:'#8e44ad',
  };
  const SHOE_COLS = {
    sh1:'#2a2a2a',sh2:'#f0f0f0',sh3:'#e74c3c',
    sh4:'#2471a3',sh5:'#c8a060',sh6:'#27ae60',
  };
  const TOP_FILLS = {tp1:'#e74c3c',tp2:'#f8b4c8',tp3:'#9b59b6',tp4:'#f1c40f',tp5:'white',tp6:'#1abc9c'};

  /* ── Mini avatar SVG (viewBox 0 0 88 192, rendered small) ── */
  function miniAvatar(s) {
    const skin  = SKINS.find(x=>x.id===s.skin)||SKINS[1];
    const hc    = HAIR_COLS[s.hairColor]||'#1a1a1a';
    const ec    = EYE_COLS[s.eyeColor]||'#2980b9';
    const sc    = SHOE_COLS[s.shoe]||'#2a2a2a';
    const tc    = TOP_FILLS[s.top]||'#e74c3c';
    const sid   = s.skin;
    const SK    = `url(#hsg${sid})`;

    // Bottom colour
    const bcs   = {bt1:'#2c4a6e',bt2:'#6b7c2e',bt3:'#2c3e50',bt4:'#252525'};
    const bc    = bcs[s.bottom]||'#2c4a6e';

    // Hair colour helpers
    const hi = lt(hc,28);

    const hairBacks = {
      hs1:`<ellipse cx="44" cy="16" rx="25" ry="13" fill="${hc}"/><rect x="19" y="16" width="50" height="18" rx="5" fill="${hc}"/><rect x="17" y="20" width="9" height="14" rx="4" fill="${hc}"/><rect x="62" y="20" width="9" height="14" rx="4" fill="${hc}"/>`,
      hs2:`<ellipse cx="44" cy="19" rx="26" ry="13" fill="${hc}"/><ellipse cx="18" cy="38" rx="10" ry="22" fill="${hc}"/><ellipse cx="70" cy="38" rx="10" ry="22" fill="${hc}"/><path d="M 13 48 Q 17 56 13 64 Q 17 72 13 78" stroke="${hc}" stroke-width="9" fill="none" stroke-linecap="round"/><path d="M 75 48 Q 71 56 75 64 Q 71 72 75 78" stroke="${hc}" stroke-width="9" fill="none" stroke-linecap="round"/>`,
      hs3:`<ellipse cx="44" cy="17" rx="26" ry="13" fill="${hc}"/><rect x="13" y="17" width="13" height="70" rx="6" fill="${hc}"/><rect x="62" y="17" width="13" height="70" rx="6" fill="${hc}"/>`,
      hs4:`<ellipse cx="44" cy="19" rx="26" ry="13" fill="${hc}"/><rect x="18" y="15" width="52" height="16" rx="5" fill="${hc}"/><circle cx="44" cy="10" r="11" fill="${hc}"/><ellipse cx="44" cy="21" rx="9" ry="3.5" fill="#e91e8c"/>`,
      hs5:`<circle cx="44" cy="14" r="28" fill="${hc}"/><circle cx="27" cy="14" r="18" fill="${hc}"/><circle cx="61" cy="14" r="18" fill="${hc}"/>`,
      hs6:`<ellipse cx="44" cy="19" rx="26" ry="12" fill="${hc}"/><path d="M 20 26 Q 6 32 8 52 Q 10 62 18 64" stroke="${hc}" stroke-width="13" fill="none" stroke-linecap="round"/><circle cx="17" cy="66" r="8" fill="${hc}"/><path d="M 68 26 Q 82 32 80 52 Q 78 62 70 64" stroke="${hc}" stroke-width="13" fill="none" stroke-linecap="round"/><circle cx="71" cy="66" r="8" fill="${hc}"/>`,
    };
    const hairFronts = {
      hs1:`<path d="M 30 14 Q 34 7 40 13" fill="${hc}"/><path d="M 38 10 Q 44 3 50 10" fill="${hc}"/><path d="M 50 12 Q 56 6 62 13" fill="${hc}"/>`,
      hs2:`<ellipse cx="44" cy="16" rx="22" ry="9" fill="${hc}"/><path d="M 23 19 Q 27 29 32 23" fill="${hc}"/>`,
      hs3:`<ellipse cx="44" cy="15" rx="22" ry="8" fill="${hc}"/>`,
      hs4:`<rect x="21" y="17" width="46" height="12" rx="5" fill="${hc}"/><rect x="18" y="22" width="8" height="14" rx="4" fill="${hc}"/><rect x="62" y="22" width="8" height="14" rx="4" fill="${hc}"/>`,
      hs5:`<path d="M 24 28 Q 20 35 24 43" stroke="${hc}" stroke-width="5" fill="none" stroke-linecap="round"/><path d="M 64 28 Q 68 35 64 43" stroke="${hc}" stroke-width="5" fill="none" stroke-linecap="round"/>`,
      hs6:`<ellipse cx="44" cy="13" rx="24" ry="9" fill="${hc}"/><circle cx="20" cy="26" r="5" fill="#e91e8c"/><circle cx="68" cy="26" r="5" fill="#e91e8c"/>`,
    };

    const hb = hairBacks[s.hairStyle]||hairBacks.hs1;
    const hf = hairFronts[s.hairStyle]||hairFronts.hs1;

    return `<defs>
      <radialGradient id="hsg${sid}" cx="50%" cy="35%" r="65%">
        <stop offset="0%" stop-color="${skin.l}"/>
        <stop offset="100%" stop-color="${skin.m}"/>
      </radialGradient>
    </defs>
    <ellipse cx="44" cy="190" rx="20" ry="3.5" fill="rgba(0,0,0,.2)"/>
    <!-- Shoes -->
    <ellipse cx="33" cy="183" rx="12" ry="5.5" fill="${sc}"/>
    <ellipse cx="55" cy="183" rx="12" ry="5.5" fill="${sc}"/>
    <!-- Legs -->
    <path d="M 27 116 L 25 177 Q 33 186 40 177 L 38 116 Z" fill="${bc}"/>
    <path d="M 50 116 L 48 177 Q 56 186 62 177 L 60 116 Z" fill="${bc}"/>
    <!-- Top -->
    <path d="M 24 68 L 22 116 Q 33 122 44 122 Q 55 122 66 116 L 64 68 Q 56 62 44 60 Q 32 62 24 68 Z" fill="${tc}"/>
    <!-- Arms -->
    <path d="M 64 74 Q 76 66 80 52 Q 83 41 76 35" stroke="${SK}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <circle cx="76" cy="33" r="6.5" fill="${SK}"/>
    <path d="M 24 74 Q 13 82 14 96" stroke="${SK}" stroke-width="10" fill="none" stroke-linecap="round"/>
    <circle cx="14" cy="98" r="6.5" fill="${SK}"/>
    <!-- Neck -->
    <rect x="38" y="60" width="12" height="12" rx="5" fill="${SK}"/>
    <!-- Head -->
    <circle cx="44" cy="40" r="25" fill="${SK}"/>
    ${hb}
    <circle cx="44" cy="40" r="22" fill="${SK}"/>
    ${hf}
    <!-- Ears -->
    <circle cx="19" cy="42" r="6.5" fill="${SK}"/>
    <circle cx="69" cy="42" r="6.5" fill="${SK}"/>
    <!-- Eyes -->
    <ellipse cx="36" cy="40" rx="6" ry="6.5" fill="white"/>
    <ellipse cx="52" cy="40" rx="6" ry="6.5" fill="white"/>
    <circle cx="36" cy="41" r="4.2" fill="${ec}"/>
    <circle cx="52" cy="41" r="4.2" fill="${ec}"/>
    <circle cx="36" cy="41" r="2.4" fill="#1a1a2e"/>
    <circle cx="52" cy="41" r="2.4" fill="#1a1a2e"/>
    <circle cx="37.5" cy="39.5" r="1.5" fill="white"/>
    <circle cx="53.5" cy="39.5" r="1.5" fill="white"/>
    <!-- Nose + mouth -->
    <path d="M 41.5 51 Q 44 54 46.5 51" stroke="${dk(skin.m,22)}" stroke-width="1.4" fill="none" stroke-linecap="round"/>
    <path d="M 38 57 Q 44 63 50 57" stroke="${dk(skin.m,30)}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }

  /* ── Mini pet SVG ── */
  function miniPet(id) {
    const simple = {
      pt0:`<text x="65" y="75" font-size="40" text-anchor="middle">🚫</text>`,
      pt1:`<ellipse cx="65" cy="54" rx="38" ry="36" fill="#c88030"/>
           <ellipse cx="65" cy="68" rx="20" ry="14" fill="#e0b060"/>
           <ellipse cx="65" cy="61" rx="9" ry="6" fill="#2c1810"/>
           <circle cx="46" cy="46" r="10" fill="white"/><circle cx="84" cy="46" r="10" fill="white"/>
           <circle cx="46" cy="47" r="6.5" fill="#6b3a00"/><circle cx="84" cy="47" r="6.5" fill="#6b3a00"/>
           <circle cx="46" cy="47" r="4" fill="#1a1a2e"/><circle cx="84" cy="47" r="4" fill="#1a1a2e"/>
           <circle cx="49" cy="44" r="2.5" fill="white"/><circle cx="87" cy="44" r="2.5" fill="white"/>
           <path d="M 27 86 Q 65 97 103 86" stroke="#e74c3c" stroke-width="8" fill="none" stroke-linecap="round"/>
           <circle cx="65" cy="94" r="5.5" fill="#f1c40f"/><circle cx="65" cy="94" r="2.5" fill="#d4a000"/>`,
      pt2:`<ellipse cx="65" cy="54" rx="38" ry="36" fill="#7a4820"/>
           <ellipse cx="65" cy="68" rx="20" ry="14" fill="#a07050"/>
           <ellipse cx="65" cy="61" rx="9" ry="6" fill="#2c1810"/>
           <circle cx="46" cy="46" r="10" fill="white"/><circle cx="84" cy="46" r="10" fill="white"/>
           <circle cx="46" cy="47" r="6.5" fill="#6b3a00"/><circle cx="84" cy="47" r="6.5" fill="#6b3a00"/>
           <circle cx="46" cy="47" r="4" fill="#1a1a2e"/><circle cx="84" cy="47" r="4" fill="#1a1a2e"/>
           <circle cx="49" cy="44" r="2.5" fill="white"/><circle cx="87" cy="44" r="2.5" fill="white"/>
           <path d="M 27 86 Q 65 97 103 86" stroke="#2980b9" stroke-width="8" fill="none" stroke-linecap="round"/>
           <circle cx="65" cy="94" r="5.5" fill="#f1c40f"/><circle cx="65" cy="94" r="2.5" fill="#d4a000"/>`,
      pt3:`<ellipse cx="65" cy="56" rx="40" ry="38" fill="#7090a0"/>
           <ellipse cx="65" cy="66" rx="28" ry="30" fill="#d8d8d8"/>
           <circle cx="46" cy="50" r="10" fill="white"/><circle cx="84" cy="50" r="10" fill="white"/>
           <circle cx="46" cy="51" r="6.5" fill="#4ab8d8"/><circle cx="84" cy="51" r="6.5" fill="#4ab8d8"/>
           <circle cx="46" cy="51" r="4" fill="#1a2a3a"/><circle cx="84" cy="51" r="4" fill="#1a2a3a"/>
           <circle cx="49" cy="47" r="2.5" fill="white"/><circle cx="87" cy="47" r="2.5" fill="white"/>
           <path d="M 26 90 Q 65 102 104 90" stroke="#1abc9c" stroke-width="8" fill="none" stroke-linecap="round"/>
           <circle cx="65" cy="98" r="5.5" fill="#f1c40f"/><circle cx="65" cy="98" r="2.5" fill="#d4a000"/>`,
      pt4:`<circle cx="65" cy="62" r="42" fill="#8090a0"/>
           <ellipse cx="65" cy="74" rx="20" ry="14" fill="#b8c8d0"/>
           <ellipse cx="46" cy="53" rx="12" ry="11" fill="white"/><ellipse cx="84" cy="53" rx="12" ry="11" fill="white"/>
           <circle cx="46" cy="54" r="8" fill="#4a90c8"/><circle cx="84" cy="54" r="8" fill="#4a90c8"/>
           <ellipse cx="46" cy="54" rx="4" ry="8" fill="#1a1a2e"/><ellipse cx="84" cy="54" rx="4" ry="8" fill="#1a1a2e"/>
           <circle cx="50" cy="49" r="3.5" fill="white"/><circle cx="88" cy="49" r="3.5" fill="white"/>
           <polygon points="65,68 59,74 71,74" fill="#ffaacc"/>
           <path d="M 22 94 Q 65 106 108 94" stroke="#9b59b6" stroke-width="8" fill="none" stroke-linecap="round"/>
           <circle cx="65" cy="102" r="5.5" fill="#f1c40f"/><circle cx="65" cy="102" r="2.5" fill="#d4a000"/>`,
      pt5:`<circle cx="65" cy="62" r="42" fill="#d07020"/>
           <ellipse cx="65" cy="74" rx="21" ry="15" fill="#f0c080"/>
           <ellipse cx="46" cy="52" rx="12" ry="11" fill="white"/><ellipse cx="84" cy="52" rx="12" ry="11" fill="white"/>
           <circle cx="46" cy="53" r="8" fill="#3498db"/><circle cx="84" cy="53" r="8" fill="#3498db"/>
           <ellipse cx="46" cy="53" rx="3.5" ry="7" fill="#1a1a2e"/><ellipse cx="84" cy="53" rx="3.5" ry="7" fill="#1a1a2e"/>
           <circle cx="49" cy="48" r="3.5" fill="white"/><circle cx="87" cy="48" r="3.5" fill="white"/>
           <polygon points="65,67 59,73 71,73" fill="#ffaacc"/>
           <path d="M 24 92 Q 65 104 106 92" stroke="#e74c3c" stroke-width="8" fill="none" stroke-linecap="round"/>
           <circle cx="65" cy="100" r="5.5" fill="#f1c40f"/><circle cx="65" cy="100" r="2.5" fill="#d4a000"/>`,
      pt6:`<circle cx="65" cy="62" r="42" fill="#1a1a2a"/>
           <ellipse cx="65" cy="74" rx="20" ry="13" fill="#2a2a44"/>
           <ellipse cx="46" cy="52" rx="12" ry="11" fill="#111120"/><ellipse cx="84" cy="52" rx="12" ry="11" fill="#111120"/>
           <circle cx="46" cy="53" r="9" fill="#a0d000"/><circle cx="84" cy="53" r="9" fill="#a0d000"/>
           <ellipse cx="46" cy="53" rx="4" ry="8.5" fill="#1a1a2e"/><ellipse cx="84" cy="53" rx="4" ry="8.5" fill="#1a1a2e"/>
           <circle cx="50" cy="48" r="3.5" fill="white" opacity=".9"/><circle cx="88" cy="48" r="3.5" fill="white" opacity=".9"/>
           <polygon points="65,67 59,73 71,73" fill="#ffaacc"/>
           <path d="M 24 92 Q 65 104 106 92" stroke="#8b0000" stroke-width="8" fill="none" stroke-linecap="round"/>
           <circle cx="65" cy="100" r="5.5" fill="#f1c40f"/><circle cx="65" cy="100" r="2.5" fill="#d4a000"/>`,
    };
    return simple[id]||simple.pt1;
  }

  /* ── Build HUD HTML ── */
  function buildHUD(avatarState) {
    const avSVG = miniAvatar(avatarState);
    const ptSVG = miniPet(avatarState.pet);
    return `<div style="display:inline-flex;align-items:center;gap:8px;
                background:rgba(0,0,0,.55);border:2px solid rgba(255,215,0,.45);
                border-radius:13px;padding:5px 12px 5px 5px;
                font-family:'Fredoka One',cursive;">
      <div style="width:46px;height:54px;background:rgba(255,255,255,.06);border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
        <svg width="40" height="50" viewBox="0 0 88 192">${avSVG}</svg>
      </div>
      <div style="width:40px;height:40px;background:rgba(255,255,255,.06);border-radius:8px;overflow:hidden;display:flex;align-items:center;justify-content:center;">
        <svg width="34" height="34" viewBox="10 10 110 110">${ptSVG}</svg>
      </div>
      <div>
        <div style="font-size:.78rem;color:#ffd700;line-height:1.1;">Your Crew</div>
        <div style="font-size:.58rem;color:#8899cc;">playing now 🎮</div>
      </div>
    </div>`;
  }

  /* ── Inject into a container ── */
  function inject(selector) {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    let state = {skin:'s2',hairStyle:'hs1',hairColor:'hc5',eyeColor:'ec1',top:'tp1',bottom:'bt1',shoe:'sh1',pet:'pt1'};
    try {
      const saved = localStorage.getItem('crabcake_avatar');
      if (saved) Object.assign(state, JSON.parse(saved));
    } catch(e) {}
    el.innerHTML = buildHUD(state);
  }

  /* ── Auto-inject if a [data-hud] element exists ── */
  function autoInject() {
    const targets = document.querySelectorAll('[data-avatar-hud]');
    targets.forEach(t => inject(t));
  }

  /* ── Public API ── */
  global.CrabcakeHUD = { inject, autoInject, buildHUD, miniAvatar, miniPet };

  /* Auto-run after DOM ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInject);
  } else {
    autoInject();
  }

})(window);
