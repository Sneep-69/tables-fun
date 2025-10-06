// TablesFun v2 - menu + 3 modes + 10-question rounds + progressive difficulty + WebAudio sounds
const menu = document.getElementById('menu');
const game = document.getElementById('game');
const result = document.getElementById('result');
const scoreEl = document.getElementById('score');
const qnumEl = document.getElementById('qnum');
const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const feedbackEl = document.getElementById('feedback');
const startLevelSel = document.getElementById('startLevel');
const soundToggle = document.getElementById('soundToggle');

const menuBtns = document.querySelectorAll('.bigBtn');
const menuBtn = document.getElementById('menuBtn');
const retryBtn = document.getElementById('retryBtn');
const quitBtn = document.getElementById('quitBtn');

let mode = 'add';
let score = 0;
let qnum = 0;
let currentAnswer = null;
let startingMax = 10;
let currentMax = 10;
let correctStreak = 0;
let audioCtx = null;

function ensureAudio(){
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
}

function playTone(freq, dur=0.18){
  if (!soundToggle.checked) return;
  try{
    ensureAudio();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.connect(g); g.connect(audioCtx.destination);
    o.frequency.value = freq;
    o.type = 'sine';
    const now = audioCtx.currentTime;
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
    o.start(now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
    o.stop(now + dur + 0.02);
  }catch(e){console.log('audio', e)}
}

function playSuccess(){
  playTone(880,0.09);
  setTimeout(()=>playTone(1100,0.09),80);
  setTimeout(()=>playTone(1320,0.1),170);
}
function playFail(){
  playTone(220,0.22);
}

function showScreen(el){
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
}

// menu actions
menuBtns.forEach(b => b.addEventListener('click', () => {
  mode = b.getAttribute('data-mode');
  startRound();
}));

function startRound(){
  // reset stats
  score = 0; qnum = 0; correctStreak = 0;
  scoreEl.textContent = score;
  qnumEl.textContent = qnum;
  // starting max from difficulty
  const lvl = startLevelSel.value;
  startingMax = lvl === 'easy' ? 5 : (lvl === 'medium' ? 10 : 20);
  currentMax = startingMax;
  showScreen(game);
  feedbackEl.textContent = '';
  nouvelleQuestion();
}

function nouvelleQuestion(){
  if (qnum >= 10){
    endRound();
    return;
  }
  qnum++;
  qnumEl.textContent = qnum;
  // generate numbers
  const a = Math.floor(Math.random() * (currentMax + 1));
  const b = Math.floor(Math.random() * (currentMax + 1));
  let answer, text;
  if (mode === 'add') {
    answer = a + b;
    text = `${a} + ${b} = ?`;
  } else if (mode === 'mul') {
    answer = a * b;
    text = `${a} × ${b} = ?`;
  } else { // mix
    if (Math.random() < 0.5){
      answer = a + b;
      text = `${a} + ${b} = ?`;
    } else {
      answer = a * b;
      text = `${a} × ${b} = ?`;
    }
  }
  currentAnswer = answer;
  questionEl.textContent = text;
  questionEl.classList.remove('pop'); void questionEl.offsetWidth; questionEl.classList.add('pop');

  // create 3 choices
  const choices = [answer];
  while (choices.length < 3){
    // generate plausible distractor
    const delta = Math.max(1, Math.round(Math.random() * Math.max(2, Math.round(currentMax/2))));
    const sign = Math.random()>0.5?1:-1;
    const cand = Math.max(0, answer + sign * delta);
    if (!choices.includes(cand)) choices.push(cand);
  }
  // shuffle
  choices.sort(() => Math.random() - 0.5);
  renderChoices(choices);
}

function renderChoices(choices){
  choicesEl.innerHTML = '';
  choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'choice';
    btn.textContent = c;
    btn.addEventListener('click', () => verifier(c, btn));
    choicesEl.appendChild(btn);
  });
}

function verifier(choice, btn){
  if (choice === currentAnswer){
    score++; correctStreak++;
    scoreEl.textContent = score;
    feedbackEl.className = 'feedback correct';
    feedbackEl.textContent = '✅ Bravo !';
    playSuccess();
    if (btn) btn.animate([{transform:'scale(1)'},{transform:'scale(1.06)'},{transform:'scale(1)'}],{duration:220});
    // progressive difficulty: every 2 correct, increase currentMax by 1 (capped)
    if (correctStreak % 2 === 0){
      currentMax = Math.min(100, currentMax + 1);
    }
  } else {
    correctStreak = 0;
    feedbackEl.className = 'feedback wrong';
    feedbackEl.textContent = `❌ Oups — la bonne réponse était ${currentAnswer}`;
    playFail();
    if (btn) btn.animate([{transform:'translateY(0)'},{transform:'translateY(6px)'},{transform:'translateY(0)'}],{duration:220});
  }
  // next after short delay
  setTimeout(() => {
    feedbackEl.textContent = '';
    nouvelleQuestion();
  }, 700);
}

function endRound(){
  // show result screen and reset
  document.getElementById('finalScore').textContent = `${score} / 10`;
  const percent = Math.round((score/10)*100);
  document.getElementById('resultMsg').textContent = percent === 100 ? 'Incroyable ! Tous justes 🎉' : (percent >= 70 ? 'Super job !' : 'On progresse, continue 😊');
  showScreen(result);
}

// buttons
menuBtn.addEventListener('click', () => { showScreen(menu); });
retryBtn.addEventListener('click', () => { showScreen(game); score=0; qnum=0; scoreEl.textContent=score; qnumEl.textContent=qnum; nouvelleQuestion(); });
quitBtn.addEventListener('click', () => { if (confirm('Retour au menu ? Ta partie sera perdue.')) showScreen(menu); });

// initial
showScreen(menu);
