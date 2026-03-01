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

  // ── Full v11 hair SVGs — accepts gradId for skin gradient reference ──
  const HAIR_SVG = {
    g1: (gradId) => `
      <ellipse cx="44" cy="22" rx="22" ry="11" fill="#7b4a1e"/>
      <rect x="22" y="19" width="44" height="17" rx="5" fill="#7b4a1e"/>
      <rect x="18" y="25" width="8" height="20" rx="4" fill="#7b4a1e"/>
      <rect x="62" y="25" width="8" height="14" rx="4" fill="#7b4a1e"/>
      <path d="M 64 30 Q 78 34 82 50 Q 86 66 80 78 Q 77 85 73 81 Q 78 68 74 54 Q 70 40 62 34 Z" fill="#7b4a1e"/>
      <ellipse cx="44" cy="23" rx="20" ry="8.5" fill="#7b4a1e"/>
      <path d="M 24 27 Q 30 35 36 28" fill="#7b4a1e"/>
      <path d="M 52 27 Q 56 33 62 28" fill="#7b4a1e"/>
      <ellipse cx="66" cy="32" rx="3.5" ry="4.5" fill="#e74c3c"/>`,
    g2: (gradId) => `
      <ellipse cx="44" cy="22" rx="22" ry="10" fill="#2a1a08"/>
      <rect x="22" y="19" width="44" height="16" rx="5" fill="#2a1a08"/>
      <ellipse cx="16" cy="37" rx="5.5" ry="3.5" fill="#2a1a08" transform="rotate(-8 16 37)"/>
      <ellipse cx="15" cy="45" rx="5" ry="3.5" fill="#3a2810" transform="rotate(-8 15 45)"/>
      <ellipse cx="14" cy="53" rx="4.5" ry="3.5" fill="#2a1a08" transform="rotate(-6 14 53)"/>
      <ellipse cx="13.5" cy="61" rx="4" ry="3" fill="#2a1a08" transform="rotate(-4 13.5 61)"/>
      <ellipse cx="16" cy="71" rx="4" ry="2.5" fill="#e91e8c"/>
      <ellipse cx="72" cy="37" rx="5.5" ry="3.5" fill="#2a1a08" transform="rotate(8 72 37)"/>
      <ellipse cx="73" cy="45" rx="5" ry="3.5" fill="#3a2810" transform="rotate(8 73 45)"/>
      <ellipse cx="74" cy="53" rx="4.5" ry="3.5" fill="#2a1a08" transform="rotate(6 74 53)"/>
      <ellipse cx="74.5" cy="61" rx="4" ry="3" fill="#2a1a08" transform="rotate(4 74.5 61)"/>
      <ellipse cx="72" cy="71" rx="4" ry="2.5" fill="#e91e8c"/>
      <ellipse cx="44" cy="24" rx="20" ry="8" fill="#2a1a08"/>
      <rect x="20" y="30" width="6" height="15" rx="3" fill="#2a1a08"/>
      <rect x="62" y="30" width="6" height="15" rx="3" fill="#2a1a08"/>`,
    g3: (gradId) => `
      <circle cx="44" cy="14" r="14" fill="#1a0800"/>
      <circle cx="32" cy="18" r="11" fill="#1a0800"/>
      <circle cx="56" cy="18" r="11" fill="#1a0800"/>
      <circle cx="27" cy="24" r="9" fill="#1a0800"/>
      <circle cx="61" cy="24" r="9" fill="#1a0800"/>
      <circle cx="36" cy="12" r="10" fill="#1a0800"/>
      <circle cx="52" cy="12" r="10" fill="#1a0800"/>
      <circle cx="44" cy="11" r="3.5" fill="#2d1200" opacity=".45"/>
      <rect x="30" y="27" width="28" height="5" rx="2.5" fill="#1a0800"/>
      <ellipse cx="44" cy="29" rx="6" ry="2.5" fill="#c0392b"/>
      <rect x="20" y="31" width="6" height="14" rx="3" fill="#1a0800"/>
      <rect x="62" y="31" width="6" height="14" rx="3" fill="#1a0800"/>`,
    b1: (gradId) => `
      <ellipse cx="44" cy="22" rx="22" ry="12" fill="#f0c040"/>
      <rect x="22" y="22" width="44" height="18" rx="5" fill="#f0c040"/>
      <rect x="20" y="26" width="8" height="16" rx="4" fill="#f0c040"/>
      <rect x="60" y="26" width="8" height="16" rx="4" fill="#f0c040"/>
      <path d="M 24 24 Q 30 16 36 24 Q 40 30 46 22 Q 52 14 58 22 Q 64 30 70 24" stroke="#f0c040" stroke-width="8" fill="none" stroke-linecap="round"/>
      <ellipse cx="44" cy="18" rx="12" ry="5" fill="#fdd060" opacity=".55"/>`,
    b2: (gradId) => `
      <circle cx="44" cy="18" r="16" fill="#1a0800"/>
      <circle cx="30" cy="22" r="13" fill="#1a0800"/>
      <circle cx="58" cy="22" r="13" fill="#1a0800"/>
      <circle cx="24" cy="30" r="11" fill="#1a0800"/>
      <circle cx="64" cy="30" r="11" fill="#1a0800"/>
      <circle cx="36" cy="14" r="12" fill="#1a0800"/>
      <circle cx="52" cy="14" r="12" fill="#1a0800"/>
      <circle cx="44" cy="12" r="11" fill="#1a0800"/>
      <ellipse cx="40" cy="8" rx="8" ry="4" fill="#3d2000" opacity=".45"/>
      <rect x="20" y="30" width="7" height="14" rx="3.5" fill="#1a0800"/>
      <rect x="61" y="30" width="7" height="14" rx="3.5" fill="#1a0800"/>`,
    b3: (gradId) => `
      <ellipse cx="44" cy="21" rx="22" ry="12" fill="#c0392b"/>
      <rect x="22" y="21" width="44" height="18" rx="5" fill="#c0392b"/>
      <rect x="20" y="25" width="8" height="14" rx="4" fill="#c0392b"/>
      <rect x="60" y="25" width="8" height="14" rx="4" fill="#c0392b"/>
      <path d="M 28 19 Q 32 11 38 18" fill="#c0392b"/>
      <path d="M 36 15 Q 42 7 48 15" fill="#c0392b"/>
      <path d="M 48 17 Q 54 10 60 17" fill="#c0392b"/>
      <ellipse cx="42" cy="16" rx="10" ry="4" fill="#e05050" opacity=".5"/>
      <path d="M 20 28 Q 18 36 22 42" stroke="#c0392b" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M 68 28 Q 70 36 66 42" stroke="#c0392b" stroke-width="4" fill="none" stroke-linecap="round"/>`,
  }

  // ── Full pet SVGs (match avatar.html exactly) ──
  const PET_SVG = {
    none: '',
    golden: `
      <defs><radialGradient id="petG_h" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#e8b060"/><stop offset="100%" stop-color="#c88030"/></radialGradient></defs>
      <ellipse cx="26" cy="58" rx="18" ry="30" fill="#a06020" transform="rotate(-12 26 58)"/>
      <ellipse cx="104" cy="58" rx="18" ry="30" fill="#a06020" transform="rotate(12 104 58)"/>
      <ellipse cx="65" cy="55" rx="40" ry="38" fill="url(#petG_h)"/>
      <ellipse cx="65" cy="72" rx="22" ry="16" fill="#f0d090"/>
      <ellipse cx="65" cy="65" rx="10" ry="7" fill="#2c1810"/>
      <ellipse cx="62" cy="63" rx="3.5" ry="2.5" fill="white" opacity=".4"/>
      <path d="M 59 67 Q 65 70 71 67" stroke="#1a0a00" stroke-width="1.2" fill="none"/>
      <circle cx="46" cy="48" r="11" fill="white"/>
      <circle cx="84" cy="48" r="11" fill="white"/>
      <circle cx="46" cy="49" r="7.5" fill="#6b3a00"/>
      <circle cx="84" cy="49" r="7.5" fill="#6b3a00"/>
      <circle cx="46" cy="49" r="4.5" fill="#1a1a2e"/>
      <circle cx="84" cy="49" r="4.5" fill="#1a1a2e"/>
      <circle cx="49" cy="46" r="3" fill="white"/>
      <circle cx="87" cy="46" r="3" fill="white"/>
      <path d="M 36 40 Q 46 34 56 39" stroke="#8a5020" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 74 39 Q 84 34 94 40" stroke="#8a5020" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M 52 78 Q 65 88 78 78" stroke="#8a3010" stroke-width="2" fill="none" stroke-linecap="round"/>
      <ellipse cx="65" cy="86" rx="10" ry="8" fill="#ff6b8a"/>
      <line x1="65" y1="80" x2="65" y2="92" stroke="#e05070" stroke-width="1.5"/>
      <path d="M 28 85 Q 65 95 102 85" stroke="#e74c3c" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="65" cy="92" r="6" fill="#f1c40f"/>
      <circle cx="65" cy="92" r="3" fill="#d4a000"/>`,
    husky: `
      <defs>
        <radialGradient id="petH_h" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#5a6a7a"/><stop offset="100%" stop-color="#3a4a5a"/></radialGradient>
        <radialGradient id="petHi_h" cx="50%" cy="50%" r="60%"><stop offset="0%" stop-color="#e8e8e8"/><stop offset="100%" stop-color="#c8c8c8"/></radialGradient>
      </defs>
      <polygon points="28,38 18,8 46,28" fill="#3a4a5a"/>
      <polygon points="102,38 112,8 84,28" fill="#3a4a5a"/>
      <polygon points="30,34 22,12 44,28" fill="#ffbbcc"/>
      <polygon points="100,34 108,12 86,28" fill="#ffbbcc"/>
      <ellipse cx="65" cy="58" rx="42" ry="40" fill="url(#petH_h)"/>
      <ellipse cx="65" cy="65" rx="30" ry="32" fill="url(#petHi_h)"/>
      <ellipse cx="50" cy="42" rx="14" ry="10" fill="#3a4a5a"/>
      <ellipse cx="80" cy="42" rx="14" ry="10" fill="#3a4a5a"/>
      <ellipse cx="65" cy="74" rx="18" ry="13" fill="#d8d8d8"/>
      <ellipse cx="65" cy="67" rx="9" ry="6.5" fill="#1a1a2e"/>
      <ellipse cx="62" cy="65" rx="3" ry="2" fill="white" opacity=".4"/>
      <circle cx="46" cy="50" r="11" fill="white"/>
      <circle cx="84" cy="50" r="11" fill="white"/>
      <circle cx="46" cy="51" r="7.5" fill="#4ab8d8"/>
      <circle cx="84" cy="51" r="7.5" fill="#4ab8d8"/>
      <circle cx="46" cy="51" r="4.5" fill="#1a2a3a"/>
      <circle cx="84" cy="51" r="4.5" fill="#1a2a3a"/>
      <circle cx="49" cy="48" r="3" fill="white"/>
      <circle cx="87" cy="48" r="3" fill="white"/>
      <path d="M 54 80 Q 65 90 76 80" stroke="#888" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 26 88 Q 65 100 104 88" stroke="#1abc9c" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="65" cy="95" r="6" fill="#f1c40f"/>
      <circle cx="65" cy="95" r="3" fill="#d4a000"/>`,
    beagle: `
      <defs><radialGradient id="petB_h" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#f5deb3"/><stop offset="100%" stop-color="#deb887"/></radialGradient></defs>
      <ellipse cx="22" cy="68" rx="18" ry="36" fill="#8b4513" transform="rotate(-5 22 68)"/>
      <ellipse cx="108" cy="68" rx="18" ry="36" fill="#8b4513" transform="rotate(5 108 68)"/>
      <ellipse cx="65" cy="55" rx="38" ry="36" fill="url(#petB_h)"/>
      <ellipse cx="65" cy="36" rx="26" ry="16" fill="#8b4513"/>
      <ellipse cx="65" cy="55" rx="35" ry="32" fill="url(#petB_h)"/>
      <ellipse cx="65" cy="42" rx="8" ry="14" fill="#fffaf0"/>
      <ellipse cx="65" cy="71" rx="20" ry="14" fill="#f0e8d0"/>
      <ellipse cx="65" cy="64" rx="11" ry="8" fill="#1a1a2e"/>
      <ellipse cx="61" cy="62" rx="4" ry="2.5" fill="white" opacity=".4"/>
      <ellipse cx="44" cy="49" rx="11" ry="9" fill="white"/>
      <ellipse cx="86" cy="49" rx="11" ry="9" fill="white"/>
      <circle cx="44" cy="51" r="7" fill="#6b3a00"/>
      <circle cx="86" cy="51" r="7" fill="#6b3a00"/>
      <circle cx="44" cy="51" r="4" fill="#1a1a2e"/>
      <circle cx="86" cy="51" r="4" fill="#1a1a2e"/>
      <circle cx="47" cy="48" r="2.8" fill="white"/>
      <circle cx="89" cy="48" r="2.8" fill="white"/>
      <path d="M 52 78 Q 65 85 78 78" stroke="#8a3010" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M 30 84 Q 65 94 100 84" stroke="#27ae60" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="65" cy="91" r="6" fill="#f1c40f"/>
      <circle cx="65" cy="91" r="3" fill="#d4a000"/>`,
    tabby: `
      <defs><radialGradient id="petT_h" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#e88030"/><stop offset="100%" stop-color="#c05010"/></radialGradient></defs>
      <polygon points="28,36 14,6 48,26" fill="#c05010"/>
      <polygon points="102,36 116,6 82,26" fill="#c05010"/>
      <polygon points="30,32 18,10 46,26" fill="#ffbbcc"/>
      <polygon points="100,32 112,10 84,26" fill="#ffbbcc"/>
      <circle cx="65" cy="62" r="44" fill="url(#petT_h)"/>
      <ellipse cx="65" cy="74" rx="22" ry="16" fill="#f4d0a0"/>
      <polygon points="65,67 59,74 71,74" fill="#ffaacc"/>
      <path d="M 58 76 Q 65 82 72 76" stroke="#c0694a" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <line x1="16" y1="68" x2="44" y2="72" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>
      <line x1="16" y1="74" x2="44" y2="74" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>
      <line x1="86" y1="72" x2="114" y2="68" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>
      <line x1="86" y1="74" x2="114" y2="74" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".9"/>
      <ellipse cx="46" cy="52" rx="12" ry="11" fill="white"/>
      <ellipse cx="84" cy="52" rx="12" ry="11" fill="white"/>
      <circle cx="46" cy="53" r="8" fill="#3498db"/>
      <circle cx="84" cy="53" r="8" fill="#3498db"/>
      <ellipse cx="46" cy="53" rx="3.5" ry="7" fill="#1a1a2e"/>
      <ellipse cx="84" cy="53" rx="3.5" ry="7" fill="#1a1a2e"/>
      <circle cx="49" cy="49" r="3.5" fill="white"/>
      <circle cx="87" cy="49" r="3.5" fill="white"/>
      <path d="M 24 92 Q 65 104 106 92" stroke="#e74c3c" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="65" cy="100" r="6" fill="#f1c40f"/>
      <circle cx="65" cy="100" r="3" fill="#d4a000"/>`,
    greyfold: `
      <defs><radialGradient id="petGF_h" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#9ab0c0"/><stop offset="100%" stop-color="#708090"/></radialGradient></defs>
      <ellipse cx="36" cy="28" rx="16" ry="10" fill="#607080" transform="rotate(15 36 28)"/>
      <ellipse cx="94" cy="28" rx="16" ry="10" fill="#607080" transform="rotate(-15 94 28)"/>
      <ellipse cx="36" cy="28" rx="10" ry="6" fill="#ffbbcc" opacity=".8" transform="rotate(15 36 28)"/>
      <ellipse cx="94" cy="28" rx="10" ry="6" fill="#ffbbcc" opacity=".8" transform="rotate(-15 94 28)"/>
      <circle cx="65" cy="64" r="46" fill="url(#petGF_h)"/>
      <ellipse cx="65" cy="76" rx="20" ry="14" fill="#d0dce8"/>
      <polygon points="65,69 59,76 71,76" fill="#ffaacc"/>
      <path d="M 58 78 Q 65 84 72 78" stroke="#8090a0" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <line x1="16" y1="71" x2="46" y2="74" stroke="#c0d0e0" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="16" y1="77" x2="46" y2="76" stroke="#c0d0e0" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="84" y1="74" x2="114" y2="71" stroke="#c0d0e0" stroke-width="1.5" stroke-linecap="round"/>
      <line x1="84" y1="76" x2="114" y2="77" stroke="#c0d0e0" stroke-width="1.5" stroke-linecap="round"/>
      <ellipse cx="46" cy="54" rx="13" ry="12" fill="white"/>
      <ellipse cx="84" cy="54" rx="13" ry="12" fill="white"/>
      <circle cx="46" cy="55" r="9" fill="#4a90c8"/>
      <circle cx="84" cy="55" r="9" fill="#4a90c8"/>
      <ellipse cx="46" cy="55" rx="4" ry="8" fill="#1a1a2e"/>
      <ellipse cx="84" cy="55" rx="4" ry="8" fill="#1a1a2e"/>
      <circle cx="50" cy="50" r="4" fill="white"/>
      <circle cx="88" cy="50" r="4" fill="white"/>
      <path d="M 22 94 Q 65 106 108 94" stroke="#9b59b6" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="65" cy="102" r="6" fill="#f1c40f"/>
      <circle cx="65" cy="102" r="3" fill="#d4a000"/>`,
    blackcat: `
      <defs><radialGradient id="petBC_h" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="#2a2a3a"/><stop offset="100%" stop-color="#111120"/></radialGradient></defs>
      <polygon points="26,38 12,6 46,26" fill="#111120"/>
      <polygon points="104,38 118,6 84,26" fill="#111120"/>
      <polygon points="28,34 16,10 44,26" fill="#553366"/>
      <polygon points="102,34 114,10 86,26" fill="#553366"/>
      <circle cx="65" cy="62" r="44" fill="url(#petBC_h)"/>
      <ellipse cx="55" cy="40" rx="20" ry="10" fill="#333344" opacity=".6"/>
      <ellipse cx="65" cy="74" rx="20" ry="14" fill="#2a2a44"/>
      <polygon points="65,66 59,73 71,73" fill="#ffaacc"/>
      <path d="M 58 75 Q 65 81 72 75" stroke="#553366" stroke-width="1.8" fill="none" stroke-linecap="round"/>
      <line x1="16" y1="68" x2="46" y2="71" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
      <line x1="16" y1="74" x2="46" y2="73" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
      <line x1="84" y1="71" x2="114" y2="68" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
      <line x1="84" y1="73" x2="114" y2="74" stroke="white" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>
      <ellipse cx="46" cy="52" rx="13" ry="12" fill="#111120"/>
      <ellipse cx="84" cy="52" rx="13" ry="12" fill="#111120"/>
      <circle cx="46" cy="53" r="9" fill="#a0d000"/>
      <circle cx="84" cy="53" r="9" fill="#a0d000"/>
      <ellipse cx="46" cy="53" rx="4" ry="8.5" fill="#1a1a2e"/>
      <ellipse cx="84" cy="53" rx="4" ry="8.5" fill="#1a1a2e"/>
      <circle cx="50" cy="48" r="3.5" fill="white" opacity=".9"/>
      <circle cx="88" cy="48" r="3.5" fill="white" opacity=".9"/>
      <path d="M 24 92 Q 65 104 106 92" stroke="#8b0000" stroke-width="8" fill="none" stroke-linecap="round"/>
      <circle cx="65" cy="100" r="6" fill="#f1c40f"/>
      <circle cx="65" cy="100" r="3" fill="#d4a000"/>`,
  };

  function load() {
    try { return { avatarId:'g1', skin:0, top:'teal', bottom:'navy', hat:'none', petId:'none',
                   ...JSON.parse(localStorage.getItem(STORAGE_KEY)||'{}') }; }
    catch(e){ return { avatarId:'g1', skin:0, top:'teal', bottom:'navy', hat:'none', petId:'none' }; }
  }

  // Build a small head-only SVG for HUD using full v11 hair
  function buildHeadSVG(state, size=52) {
    const [sc,sh] = SKINS[state.skin] || SKINS[0];
    const isGirl  = !['b1','b2','b3'].includes(state.avatarId);
    const tc      = TOP_COLOURS[state.top] || '#1abc9c';
    const id      = 'hud_' + Math.random().toString(36).slice(2,6);
    const eyeCol  = state.skin >= 4 ? '#4a2c00' : '#2eaa88';
    const hairFn  = HAIR_SVG[state.avatarId] || HAIR_SVG['b1'];
    const hairHTML = hairFn(`url(#${id}_sk)`);

    const lashes = isGirl ? `
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

    return `<svg width="${size}" height="${size}" viewBox="0 0 88 88" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="${id}_sk" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stop-color="${sc}"/>
          <stop offset="100%" stop-color="${sh}"/>
        </radialGradient>
        <clipPath id="${id}_cl"><circle cx="44" cy="44" r="42"/></clipPath>
      </defs>
      <circle cx="44" cy="44" r="42" fill="rgba(0,0,0,.3)"/>
      <circle cx="44" cy="44" r="40" fill="${tc}"/>
      <g clip-path="url(#${id}_cl)" transform="translate(0,11)">
        ${hairHTML}
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

  // Build full pet SVG in a circle
  function buildPetSVG(state, size=40) {
    let svg = PET_SVG[state.petId];
    if(!svg) return '';
    // Make gradient IDs unique to avoid conflicts when rendered multiple times
    const uid = 'p' + Math.random().toString(36).slice(2,6);
    svg = svg
      .replace(/id="petG"/g,  `id="petG_${uid}"`)  .replace(/url\(#petG\)/g,  `url(#petG_${uid})`)
      .replace(/id="petH"/g,  `id="petH_${uid}"`)  .replace(/url\(#petH\)/g,  `url(#petH_${uid})`)
      .replace(/id="petHi"/g, `id="petHi_${uid}"`) .replace(/url\(#petHi\)/g, `url(#petHi_${uid})`)
      .replace(/id="petB"/g,  `id="petB_${uid}"`)  .replace(/url\(#petB\)/g,  `url(#petB_${uid})`)
      .replace(/id="petT"/g,  `id="petT_${uid}"`)  .replace(/url\(#petT\)/g,  `url(#petT_${uid})`)
      .replace(/id="petGF"/g, `id="petGF_${uid}"`) .replace(/url\(#petGF\)/g, `url(#petGF_${uid})`)
      .replace(/id="petBC"/g, `id="petBC_${uid}"`) .replace(/url\(#petBC\)/g, `url(#petBC_${uid})`);
    // Also deduplicate the _h suffix variants already in the SVG
    svg = svg
      .replace(/id="petG_h"/g,  `id="petG_${uid}"`)  .replace(/url\(#petG_h\)/g,  `url(#petG_${uid})`)
      .replace(/id="petH_h"/g,  `id="petH_${uid}"`)  .replace(/url\(#petH_h\)/g,  `url(#petH_${uid})`)
      .replace(/id="petHi_h"/g, `id="petHi_${uid}"`) .replace(/url\(#petHi_h\)/g, `url(#petHi_${uid})`)
      .replace(/id="petB_h"/g,  `id="petB_${uid}"`)  .replace(/url\(#petB_h\)/g,  `url(#petB_${uid})`)
      .replace(/id="petT_h"/g,  `id="petT_${uid}"`)  .replace(/url\(#petT_h\)/g,  `url(#petT_${uid})`)
      .replace(/id="petGF_h"/g, `id="petGF_${uid}"`) .replace(/url\(#petGF_h\)/g, `url(#petGF_${uid})`)
      .replace(/id="petBC_h"/g, `id="petBC_${uid}"`) .replace(/url\(#petBC_h\)/g, `url(#petBC_${uid})`);
    return `<svg width="${size}" height="${size}" viewBox="0 0 130 130"
      style="border-radius:50%;border:2px solid rgba(255,255,255,.3);box-shadow:0 2px 8px rgba(0,0,0,.4);"
      xmlns="http://www.w3.org/2000/svg">${svg}</svg>`;
  }

  // Inject a HUD portrait into a target element
  function injectHUD(targetEl, options) {
    if(!targetEl) return;
    options = options || {};
    const state = load();
    const size    = options.size || 52;
    const petSize = Math.round(size * .75);

    const headHTML = buildHeadSVG(state, size);
    const petHTML  = (options.showPet !== false && state.petId && state.petId !== 'none')
                     ? buildPetSVG(state, petSize) : '';

    targetEl.innerHTML = `
      <a href="avatar.html" title="Customise your avatar" style="display:inline-flex;align-items:center;gap:6px;text-decoration:none;cursor:pointer;">
        ${headHTML}
        ${petHTML}
      </a>
    `;
  }

  // Refresh all HUD elements on the page (call after save)
  function refreshHUD() {
    const huds = document.querySelectorAll('[id$="-avatar-hud"]');
    huds.forEach(el => {
      if(el.style.display !== 'none') injectHUD(el, {size: parseInt(el.dataset.hudSize)||52, showPet:true});
    });
  }

  return { load, buildHeadSVG, buildPetSVG, injectHUD, refreshHUD };

})();
