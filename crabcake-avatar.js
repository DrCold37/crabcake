// crabcake-avatar.js — shared avatar rendering utility
// Loads saved avatar from localStorage and builds HUD portrait SVGs

const CrabcakeAvatar = (function(){

  const STORAGE_KEY = 'crabcake_avatar_v1';
  const SKINS = [
    ['#fde8cc','#f5c8a0'],
    ['#f0c898','#e0a870'],
    ['#f0b870','#c87840'],
    ['#f5c88a','#d4935a'],
    ['#d4935a','#b07030'],
    ['#8B5E3C','#6B3A1F'],
  ];
  const TOP_COLOURS = {
    teal:'#1abc9c',red:'#e74c3c',blue:'#2980b9',purple:'#8e44ad',
    yellow:'#f1c40f',pink:'#f8b4c8',green:'#27ae60',orange:'#e67e22',
    grey:'#95a5a6',white:'#ecf0f1'
  };
  const BOTTOM_COLOURS = {
    navy:'#2c3e50',denim:'#4a7fa8',black:'#2d1b3d',olive:'#6b7c2e',
    purple:'#6c3483',red:'#922b21',teal:'#148f77',brown:'#6e2f1a'
  };

  // Hair per avatar (simplified for HUD)
  const HAIR_COLOURS = {
    g1:'#7b4a1e', g2:'#2a1a08', g3:'#1a0800',
    b1:'#f0c040', b2:'#1a0800', b3:'#c0392b'
  };
  const AVATAR_GENDER = { g1:'girl',g2:'girl',g3:'girl',b1:'boy',b2:'boy',b3:'boy' };

  // Pet colours for mini badge
  const PET_BADGE = {
    none:    null,
    golden:  { col:'#e8b060', label:'🐶' },
    husky:   { col:'#5a6a7a', label:'🐶' },
    beagle:  { col:'#deb887', label:'🐶' },
    tabby:   { col:'#e88030', label:'🐱' },
    greyfold:{ col:'#9ab0c0', label:'🐱' },
    blackcat:{ col:'#2a2a3a', label:'🐱' },
  };

  function load() {
    try { return { avatarId:'g1', skin:0, top:'teal', bottom:'navy', hat:'none', petId:'none',
                   ...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}') }; }
    catch(e){ return { avatarId:'g1', skin:0, top:'teal', bottom:'navy', hat:'none', petId:'none' }; }
  }

  // Build a small head-only SVG for HUD
  function buildHeadSVG(state, size=52) {
    const [sc,sh] = SKINS[state.skin] || SKINS[0];
    const isGirl  = AVATAR_GENDER[state.avatarId] !== 'boy';
    const hairCol = HAIR_COLOURS[state.avatarId] || '#7b4a1e';
    const tc      = TOP_COLOURS[state.top] || '#1abc9c';
    const id      = 'hud_' + Math.random().toString(36).slice(2,6);
    const eyeCol  = state.skin >= 4 ? '#4a2c00' : '#2eaa88';
    const lashes  = isGirl ? `
      <line x1="32" y1="40.5" x2="31.4" y2="39" stroke="#1a1a2e" stroke-width="1.1" stroke-linecap="round"/>
      <line x1="35" y1="40" x2="35" y2="38.5" stroke="#1a1a2e" stroke-width="1.1" stroke-linecap="round"/>
      <line x1="38" y1="40.5" x2="38.6" y2="39" stroke="#1a1a2e" stroke-width="1.1" stroke-linecap="round"/>
      <line x1="48" y1="40.5" x2="47.4" y2="39" stroke="#1a1a2e" stroke-width="1.1" stroke-linecap="round"/>
      <line x1="51" y1="40" x2="51" y2="38.5" stroke="#1a1a2e" stroke-width="1.1" stroke-linecap="round"/>
      <line x1="54" y1="40.5" x2="54.6" y2="39" stroke="#1a1a2e" stroke-width="1.1" stroke-linecap="round"/>
    ` : `
      <path d="M 31.5 36 Q 36 31.5 40.5 36" stroke="#8B6000" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <path d="M 47.5 36 Q 52 31.5 56.5 36" stroke="#8B6000" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    `;

    // Simplified hair for HUD
    let hairSVG = '';
    if(state.avatarId==='g1') hairSVG = `<ellipse cx="44" cy="22" rx="22" ry="11" fill="${hairCol}"/><rect x="22" y="19" width="44" height="17" rx="5" fill="${hairCol}"/>`;
    else if(state.avatarId==='g2') hairSVG = `<ellipse cx="44" cy="22" rx="22" ry="10" fill="${hairCol}"/><rect x="22" y="19" width="44" height="16" rx="5" fill="${hairCol}"/>`;
    else if(state.avatarId==='g3') hairSVG = `<circle cx="44" cy="14" r="14" fill="${hairCol}"/><circle cx="32" cy="18" r="11" fill="${hairCol}"/><circle cx="56" cy="18" r="11" fill="${hairCol}"/>`;
    else if(state.avatarId==='b1') hairSVG = `<ellipse cx="44" cy="22" rx="22" ry="12" fill="${hairCol}"/><rect x="22" y="22" width="44" height="18" rx="5" fill="${hairCol}"/>`;
    else if(state.avatarId==='b2') hairSVG = `<circle cx="44" cy="18" r="16" fill="${hairCol}"/><circle cx="30" cy="22" r="13" fill="${hairCol}"/><circle cx="58" cy="22" r="13" fill="${hairCol}"/>`;
    else if(state.avatarId==='b3') hairSVG = `<ellipse cx="44" cy="21" rx="22" ry="12" fill="${hairCol}"/><rect x="22" y="21" width="44" height="18" rx="5" fill="${hairCol}"/>`;

    return `<svg width="${size}" height="${size}" viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${id}_sk" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stop-color="${sc}"/>
          <stop offset="100%" stop-color="${sh}"/>
        </radialGradient>
        <clipPath id="${id}_cl"><circle cx="44" cy="44" r="42"/></clipPath>
      </defs>
      <circle cx="44" cy="44" r="42" fill="rgba(0,0,0,.3)"/>
      <circle cx="44" cy="44" r="40" fill="${tc}"/>
      <g clip-path="url(#${id}_cl)">
        <circle cx="44" cy="44" r="22" fill="url(#${id}_sk)"/>
        ${hairSVG}
        <circle cx="44" cy="44" r="20" fill="url(#${id}_sk)"/>
        <circle cx="20" cy="46" r="5.5" fill="url(#${id}_sk)"/>
        <circle cx="68" cy="46" r="5.5" fill="url(#${id}_sk)"/>
        <ellipse cx="35" cy="44" rx="4" ry="4.2" fill="white"/>
        <ellipse cx="51" cy="44" rx="4" ry="4.2" fill="white"/>
        <circle cx="35" cy="45" r="2.9" fill="${eyeCol}"/>
        <circle cx="51" cy="45" r="2.9" fill="${eyeCol}"/>
        <circle cx="35" cy="45" r="1.6" fill="#1a1a2e"/>
        <circle cx="51" cy="45" r="1.6" fill="#1a1a2e"/>
        <circle cx="36" cy="43.8" r="1" fill="white"/>
        <circle cx="52" cy="43.8" r="1" fill="white"/>
        ${lashes}
        <path d="M 39 58 Q 44 63 49 58" stroke="#c0694a" stroke-width="1.7" fill="none" stroke-linecap="round"/>
        <circle cx="26" cy="51" r="7" fill="#ff9090" opacity=".35"/>
        <circle cx="62" cy="51" r="7" fill="#ff9090" opacity=".35"/>
      </g>
    </svg>`;
  }

  // Build pet mini badge SVG (simple coloured circle with emoji-style face)
  function buildPetBadge(state, size=40) {
    const pb = PET_BADGE[state.petId];
    if(!pb) return '';
    return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${pb.col};
      display:flex;align-items:center;justify-content:center;font-size:${size*.45}px;
      border:2px solid rgba(255,255,255,.3);box-shadow:0 2px 8px rgba(0,0,0,.4);">${pb.label}</div>`;
  }

  // Inject a HUD portrait into a target element
  // Options: { size, showPet, nameText }
  function injectHUD(targetEl, options) {
    if(!targetEl) return;
    options = options || {};
    const state = load();
    const size  = options.size || 52;
    const petSize = Math.round(size * .7);

    const headHTML = buildHeadSVG(state, size);
    const petHTML  = (options.showPet !== false && state.petId !== 'none') ? buildPetBadge(state, petSize) : '';

    targetEl.innerHTML = `
      <a href="avatar.html" title="Customise your avatar" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none;cursor:pointer;">
        ${headHTML}
        ${petHTML}
      </a>
    `;
  }

  return { load, buildHeadSVG, buildPetBadge, injectHUD };

})();
