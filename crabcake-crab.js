/* ══════════════════════════════════════════════════════════════════════════
   CRABCAKE CRAB MASCOT v2
   Shared crab guide system for all Crabcake Kids games.
   Usage: <script src="/crabcake-crab.js?v=2" defer></script>
   API:
     CrabCrab.show(text, hint)    — slide crab in with speech bubble
     CrabCrab.hide(cb)            — slide crab out, optional callback
     CrabCrab.setExpr(expr)       — 'idle','happy','sad','wave','help'
     CrabCrab.speak(text, cb)     — speak text aloud via Web Speech API
     CrabCrab.replay()            — replay last spoken text
     CrabCrab.welcome(title, text, cb) — show welcome/end overlay
     CrabCrab.dismissWelcome()    — hide welcome overlay
     CrabCrab.showIGotYou(text)   — show "I got you!" overlay
     CrabCrab.hideIGotYou()       — hide "I got you!" overlay
     CrabCrab.soundOn             — get/set sound toggle
   ══════════════════════════════════════════════════════════════════════════ */
(function(){
'use strict';

var ASSET_PATH='/assets/crab-mascot/';

/* ── Inject CSS ── */
var css=`
/* ═══ CRAB MASCOT ═══ */
#crabWrap{position:fixed;z-index:40;display:none;pointer-events:none}
#crabWrap.active{display:block}
#crabWrap.pos-left{top:8%;left:-200px}
#crabWrap.pos-right{top:8%;right:-200px}
#crabWrap.pos-bottom-left{bottom:-200px;left:5%}
#crabWrap.pos-bottom-right{bottom:-200px;right:5%}
#crabWrap.enter-left{animation:crabSlideL .6s cubic-bezier(.34,1.56,.64,1) forwards}
#crabWrap.enter-right{animation:crabSlideR .6s cubic-bezier(.34,1.56,.64,1) forwards}
#crabWrap.enter-bottom-left{animation:crabSlideUpL .6s cubic-bezier(.34,1.56,.64,1) forwards}
#crabWrap.enter-bottom-right{animation:crabSlideUpR .6s cubic-bezier(.34,1.56,.64,1) forwards}
#crabWrap.exit-left{animation:crabExitL .4s ease-in forwards}
#crabWrap.exit-right{animation:crabExitR .4s ease-in forwards}
#crabWrap.exit-bottom-left{animation:crabExitDownL .4s ease-in forwards}
#crabWrap.exit-bottom-right{animation:crabExitDownR .4s ease-in forwards}
@keyframes crabSlideL{to{left:3%}}
@keyframes crabSlideR{to{right:3%}}
@keyframes crabSlideUpL{to{bottom:8%}}
@keyframes crabSlideUpR{to{bottom:8%}}
@keyframes crabExitL{to{left:-200px}}
@keyframes crabExitR{to{right:-200px}}
@keyframes crabExitDownL{to{bottom:-200px}}
@keyframes crabExitDownR{to{bottom:-200px}}

.crab-char{display:flex;align-items:flex-start;gap:.2rem;pointer-events:auto}
.crab-char.from-right{flex-direction:row-reverse}

.crab-sprite-lg{width:110px;height:110px;flex-shrink:0;background-size:300% 300%;background-position:0 0;image-rendering:auto;filter:drop-shadow(0 4px 12px rgba(0,0,0,.3))}
.crab-sprite-lg.idle{background-image:url('${ASSET_PATH}crab-animate-idle.png');animation:crabSpritePlay 1.5s steps(1) infinite}
.crab-sprite-lg.happy{background-image:url('${ASSET_PATH}crab-animate-happy.png');animation:crabSpritePlay 1.2s steps(1) infinite}
.crab-sprite-lg.sad{background-image:url('${ASSET_PATH}crab-animate-sad.png');animation:crabSpritePlay 2s steps(1) 1}
.crab-sprite-lg.wave{background-image:url('${ASSET_PATH}crab-animate-wave.png');animation:crabSpritePlay 1.5s steps(1) infinite}
.crab-sprite-lg.help{background-image:url('${ASSET_PATH}crab-animate-help.png');animation:crabSpritePlay 2.7s steps(1) 1}
@keyframes crabSpritePlay{
  0%{background-position:0 0}
  11.11%{background-position:-100% 0}
  22.22%{background-position:-200% 0}
  33.33%{background-position:0 -100%}
  44.44%{background-position:-100% -100%}
  55.55%{background-position:-200% -100%}
  66.66%{background-position:0 -200%}
  77.77%{background-position:-100% -200%}
  88.88%{background-position:-200% -200%}
  100%{background-position:-200% -200%}
}

.crab-bubble{position:relative;background:#fff;border-radius:18px;padding:.8rem 1rem;max-width:280px;min-width:160px;box-shadow:0 4px 20px rgba(0,0,0,.3);border:3px solid #FFD93D}
.crab-bubble.tail-left::before{content:'';position:absolute;left:-16px;top:28px;width:0;height:0;border-top:10px solid transparent;border-bottom:10px solid transparent;border-right:16px solid #FFD93D}
.crab-bubble.tail-left::after{content:'';position:absolute;left:-11px;top:30px;width:0;height:0;border-top:8px solid transparent;border-bottom:8px solid transparent;border-right:14px solid #fff}
.crab-bubble.tail-right::before{content:'';position:absolute;right:-16px;top:28px;width:0;height:0;border-top:10px solid transparent;border-bottom:10px solid transparent;border-left:16px solid #FFD93D}
.crab-bubble.tail-right::after{content:'';position:absolute;right:-11px;top:30px;width:0;height:0;border-top:8px solid transparent;border-bottom:8px solid transparent;border-left:14px solid #fff}
.crab-bubble.tail-down::before{content:'';position:absolute;bottom:-16px;left:30px;width:0;height:0;border-left:10px solid transparent;border-right:10px solid transparent;border-top:16px solid #FFD93D}
.crab-bubble.tail-down::after{content:'';position:absolute;bottom:-11px;left:32px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:14px solid #fff}

.crab-bubble-text{font-family:'Boogaloo',cursive;font-size:1.1rem;color:#1a2a44;line-height:1.35}
.crab-bubble-hint{font-size:.8rem;color:#d4730f;font-weight:700;margin-top:.4rem;opacity:0;transition:opacity .3s;padding:.3rem .5rem;background:rgba(255,217,61,.15);border-radius:8px}
.crab-bubble-hint.show{opacity:1}
.crab-bubble-tries{font-size:.7rem;color:rgba(0,0,0,.35);margin-top:.2rem}
.crab-bubble-footer{display:flex;align-items:center;justify-content:space-between;margin-top:.4rem}
.crab-audio-btn{background:none;border:2px solid rgba(255,217,61,.5);border-radius:50%;width:34px;height:34px;font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;color:#d4730f;pointer-events:auto}
.crab-audio-btn:hover{background:rgba(255,217,61,.2);border-color:#FFD93D}
.crab-audio-btn.speaking{animation:crabAudioPulse .8s ease-in-out infinite}
@keyframes crabAudioPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.15)}}

.crab-igot{position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);z-index:45;display:none;text-align:center}
.crab-igot.show{display:block}
.crab-igot-inner{background:rgba(15,37,64,.95);border:3px solid #FFD93D;border-radius:20px;padding:1.2rem 1.5rem;display:flex;align-items:center;gap:1rem;animation:crabCelebPop .5s cubic-bezier(.34,1.56,.64,1) both}
.crab-igot-sprite{width:80px;height:80px;flex-shrink:0;background:url('${ASSET_PATH}crab-animate-sad.png');background-size:300% 300%;animation:crabSpritePlay 2s steps(1) 1}
.crab-igot-text{font-family:'Boogaloo',cursive;font-size:1.2rem;color:#FFD93D;text-align:left}
@keyframes crabCelebPop{0%{transform:scale(.3) translateY(40px);opacity:0}60%{transform:scale(1.08) translateY(-4px);opacity:1}100%{transform:scale(1) translateY(0)}}

#crabWelcomeOverlay{position:fixed;inset:0;z-index:55;display:none;align-items:center;justify-content:center;background:rgba(10,22,40,.6);backdrop-filter:blur(4px)}
#crabWelcomeOverlay.show{display:flex}
.crab-welcome-inner{background:rgba(15,37,64,.95);border:3px solid #FFD93D;border-radius:24px;padding:1.5rem 2rem;text-align:center;max-width:360px;width:88%;animation:crabCelebPop .5s cubic-bezier(.34,1.56,.64,1) both}
.crab-welcome-sprite{width:120px;height:120px;margin:0 auto .5rem;background:url('${ASSET_PATH}crab-animate-wave.png');background-size:300% 300%;animation:crabSpritePlay 1.5s steps(1) infinite}
.crab-welcome-title{font-family:'Boogaloo',cursive;font-size:1.6rem;color:#FFD93D;margin-bottom:.3rem}
.crab-welcome-text{font-size:.9rem;color:rgba(255,255,255,.7);line-height:1.4}

@media(max-width:400px){.crab-sprite-lg{width:80px;height:80px}.crab-bubble{max-width:220px;padding:.6rem .8rem}.crab-bubble-text{font-size:.95rem}.crab-welcome-sprite{width:90px;height:90px}.crab-audio-btn{width:28px;height:28px;font-size:.85rem}}
`;

var styleEl=document.createElement('style');
styleEl.textContent=css;
document.head.appendChild(styleEl);

/* ── Inject HTML ── */
var html=`
<div id="crabWrap">
  <div class="crab-char" id="crabChar">
    <div class="crab-sprite-lg idle" id="crabSprite"></div>
    <div class="crab-bubble tail-left" id="crabBubbleBox">
      <div class="crab-bubble-text" id="crabBubbleTx"></div>
      <div class="crab-bubble-hint" id="crabBubbleHint"></div>
      <div class="crab-bubble-footer">
        <div class="crab-bubble-tries" id="crabBubbleTries"></div>
        <button class="crab-audio-btn" id="crabAudioBtn" title="Hear again">\u{1F50A}</button>
      </div>
    </div>
  </div>
</div>
<div class="crab-igot" id="crabIgot">
  <div class="crab-igot-inner">
    <div class="crab-igot-sprite"></div>
    <div class="crab-igot-text" id="crabIgotTx">I got you!</div>
  </div>
</div>
<div id="crabWelcomeOverlay">
  <div class="crab-welcome-inner">
    <div class="crab-welcome-sprite" id="crabWelcomeSprite"></div>
    <div class="crab-welcome-title" id="crabWelcomeTitle"></div>
    <div class="crab-welcome-text" id="crabWelcomeText"></div>
  </div>
</div>
`;

var container=document.createElement('div');
container.innerHTML=html;
while(container.firstChild)document.body.appendChild(container.firstChild);

/* ── State ── */
var _currentText='';
var _pos=null;
var _positions=['left','right','bottom-left','bottom-right'];
var _posIdx=0;
var _soundOn=true;

function $(id){return document.getElementById(id)}

/* ── Expressions ── */
function setExpr(expr){
  var spr=$('crabSprite');if(!spr)return;
  spr.className='crab-sprite-lg '+expr;
}

/* ── Show / Hide ── */
function show(text,hint){
  var wrap=$('crabWrap');
  var charEl=$('crabChar');
  var bubble=$('crabBubbleBox');

  _pos=_positions[_posIdx%_positions.length];
  _posIdx++;

  wrap.className='';

  var isRight=(_pos==='right'||_pos==='bottom-right');
  var isBottom=(_pos==='bottom-left'||_pos==='bottom-right');

  charEl.className='crab-char'+(isRight?' from-right':'');

  if(isBottom)bubble.className='crab-bubble tail-down';
  else if(isRight)bubble.className='crab-bubble tail-right';
  else bubble.className='crab-bubble tail-left';

  $('crabBubbleTx').textContent=text;
  $('crabBubbleHint').textContent=hint||'';
  $('crabBubbleHint').classList.remove('show');

  wrap.classList.add('pos-'+_pos);
  wrap.classList.add('active');
  wrap.offsetHeight;
  wrap.classList.add('enter-'+_pos);
}

function hide(cb){
  var wrap=$('crabWrap');
  if(!wrap||!wrap.classList.contains('active')){if(cb)cb();return}

  wrap.classList.remove('enter-'+_pos);
  wrap.classList.add('exit-'+_pos);

  setTimeout(function(){
    wrap.className='';
    if(cb)cb();
  },450);
}

/* ── Speech ── */
function speak(text,cb){
  _currentText=text;
  if(!_soundOn){if(cb)cb();return}
  try{
    window.speechSynthesis.cancel();
    var u=new SpeechSynthesisUtterance(text);
    u.rate=1.05;u.pitch=1.4;u.volume=0.8;
    var voices=window.speechSynthesis.getVoices();
    var pref=voices.filter(function(v){return v.lang.startsWith('en')&&/female|samantha|karen|victoria/i.test(v.name)});
    if(pref.length)u.voice=pref[0];
    else{
      var en=voices.filter(function(v){return v.lang.startsWith('en')});
      if(en.length)u.voice=en[0];
    }
    var btn=$('crabAudioBtn');
    if(btn)btn.classList.add('speaking');
    u.onend=function(){if(btn)btn.classList.remove('speaking');if(cb)cb()};
    u.onerror=function(){if(btn)btn.classList.remove('speaking');if(cb)cb()};
    window.speechSynthesis.speak(u);
  }catch(e){if(cb)cb()}
}

function replay(){
  if(_currentText)speak(_currentText);
}

function stopSpeech(){
  try{window.speechSynthesis.cancel()}catch(e){}
}

/* ── Welcome / End overlay ── */
function welcome(title,text,cb){
  $('crabWelcomeTitle').textContent=title;
  $('crabWelcomeText').textContent=text;
  $('crabWelcomeOverlay').classList.add('show');
  speak(text);
  /* Default to wave sprite */
  var spr=$('crabWelcomeSprite');
  if(spr)spr.style.backgroundImage="url('"+ASSET_PATH+"crab-animate-wave.png')";
}

function dismissWelcome(){
  $('crabWelcomeOverlay').classList.remove('show');
}

function setWelcomeExpr(expr){
  var spr=$('crabWelcomeSprite');
  if(spr)spr.style.backgroundImage="url('"+ASSET_PATH+"crab-animate-"+expr+".png')";
}

/* ── "I got you!" overlay ── */
function showIGotYou(text){
  $('crabIgotTx').textContent=text;
  $('crabIgot').classList.add('show');
}

function hideIGotYou(){
  $('crabIgot').classList.remove('show');
}

/* ── DOM accessors for game code ── */
function getBubbleTx(){return $('crabBubbleTx')}
function getBubbleHint(){return $('crabBubbleHint')}
function getBubbleTries(){return $('crabBubbleTries')}

/* ── Audio button handler ── */
var abtn=$('crabAudioBtn');
if(abtn)abtn.addEventListener('click',function(e){e.stopPropagation();replay()});

/* Preload voices */
if(window.speechSynthesis){
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged=function(){window.speechSynthesis.getVoices()};
}

/* ── Public API ── */
window.CrabCrab={
  show:show,
  hide:hide,
  setExpr:setExpr,
  speak:speak,
  replay:replay,
  stopSpeech:stopSpeech,
  welcome:welcome,
  dismissWelcome:dismissWelcome,
  setWelcomeExpr:setWelcomeExpr,
  showIGotYou:showIGotYou,
  hideIGotYou:hideIGotYou,
  getBubbleTx:getBubbleTx,
  getBubbleHint:getBubbleHint,
  getBubbleTries:getBubbleTries,
  get soundOn(){return _soundOn},
  set soundOn(v){_soundOn=!!v}
};

})();
