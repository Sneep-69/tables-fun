// TablesFun v3 - full features
const menu = document.getElementById('menu');
const game = document.getElementById('game');
const result = document.getElementById('result');
const scoreEl = document.getElementById('score');
const qnumEl = document.getElementById('qnum');
const questionEl = document.getElementById('question');
const choicesEl = document.getElementById('choices');
const feedbackEl = document.getElementById('feedback');
const startLevelSel = document.getElementById('startLevel');

const playerNameInput = document.getElementById('playerName');
const saveNameBtn = document.getElementById('saveName');
const musicToggleBtn = document.getElementById('musicToggle');
const soundToggle = document.getElementById('soundToggle');

const menuBtns = document.querySelectorAll('.bigBtn');
const menuBtn = document.getElementById('menuBtn');
const retryBtn = document.getElementById('retryBtn');
const quitBtn = document.getElementById('quitBtn');

const tabs = document.querySelectorAll('.tab');
const scoresArea = document.getElementById('scoresArea');
const clearScoresBtn = document.getElementById('clearScores');

let mode = 'add';
let score = 0;
let qnum = 0;
let currentAnswer = null;
let startingMax = 10;
let currentMax = 10;
let correctStreak = 0;

const ROUND_LENGTH = 10;

// localStorage keys
const STORAGE_PLAYER = 'tf_player';
const STORAGE_SCORES = 'tf_scores_v3'; // { add: [...], mul: [...], mix: [...] }

let scoresDB = { add: [], mul: [], mix: [] };

// --- Player name handling
function loadPlayer(){
  const n = localStorage.getItem(STORAGE_PLAYER) || '';
  playerNameInput.value = n;
}
function savePlayer(){
  const n = (playerNameInput.value || '').trim();
  if (n) localStorage.setItem(STORAGE_PLAYER, n);
  loadPlayer();
}
saveNameBtn.addEventListener('click', savePlayer);
loadPlayer();

// --- Scores DB
function loadScores(){
  try {
    const raw = localStorage.getItem(STORAGE_SCORES);
    if (raw) scoresDB = JSON.parse(raw);
  } catch(e){ scoresDB = { add: [], mul: [], mix: [] }; }
}
function saveScores(){
  localStorage.setItem(STORAGE_SCORES, JSON.stringify(scoresDB));
}
function addScore(modeKey, name, scoreVal){
  const entry = { name: name, score: scoreVal, date: new Date().toISOString() };
  scoresDB[modeKey] = scoresDB[modeKey] || [];
  scoresDB[modeKey].push(entry);
  // sort: best -> worst, then recent
  scoresDB[modeKey].sort((a,b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.date) - new Date(a.date);
  });
  // keep top 50
  if (scoresDB[modeKey].length > 50) scoresDB[modeKey].length = 50;
  saveScores();
}

// render leaderboard for given tab
function renderScores(modeKey){
  scoresArea.innerHTML = '';
  const list = scoresDB[modeKey] || [];
  if (list.length === 0) {
    scoresArea.innerHTML = '<div style="text-align:center;opacity:0.8">Aucun score enregistré</div>';
    return;
  }
  list.forEach((e, idx) => {
    const row = document.createElement('div');
    row.className = 'scoreRow';
    const left = document.createElement('div'); left.className = 'scoreLeft';
    const medal = document.createElement('div'); medal.className = 'medal';
    if (idx === 0) medal.textContent = '🥇';
    else if (idx === 1) medal.textContent = '🥈';
    else if (idx === 2) medal.textContent = '🥉';
    else medal.textContent = '⚪';
    const name = document.createElement('div'); name.textContent = e.name;
    const scoreDiv = document.createElement('div'); scoreDiv.textContent = `${e.score} / ${ROUND_LENGTH}`;
    const dateDiv = document.createElement('div'); dateDiv.style.opacity = '0.7'; dateDiv.style.fontSize='0.85rem';
    dateDiv.textContent = new Date(e.date).toLocaleString();
    left.appendChild(medal); left.appendChild(name);
    row.appendChild(left);
    const right = document.createElement('div');
    right.appendChild(scoreDiv); right.appendChild(dateDiv);
    row.appendChild(right);
    scoresArea.appendChild(row);
  });
}

// Tab handling
tabs.forEach(t => t.addEventListener('click', () => {
  tabs.forEach(x => x.classList.remove('active'));
  t.classList.add('active');
  renderScores(t.getAttribute('data-tab'));
}));

clearScoresBtn.addEventListener('click', () => {
  if (!confirm('Effacer tous les scores ?')) return;
  scoresDB = { add: [], mul: [], mix: [] };
  saveScores();
  renderScores(document.querySelector('.tab.active').getAttribute('data-tab'));
});

// --- Game logic (similar to previous)
menuBtns.forEach(b => b.addEventListener('click', () => {
  mode = b.getAttribute('data-mode');
  startRound();
}));

function startRound(){
  const player = (localStorage.getItem(STORAGE_PLAYER) || '').trim();
  if (!player){
    alert('Merci d\\'entrer le nom du joueur avant de commencer.');
    return;
  }
  score = 0; qnum = 0; correctStreak = 0;
  scoreEl.textContent = score;
  qnumEl.textContent = qnum;
  const lvl = startLevelSel.value;
  startingMax = lvl === 'easy' ? 5 : (lvl === 'medium' ? 10 : 20);
  currentMax = startingMax;
  showScreen(game);
  feedbackEl.textContent = '';
  nouvelleQuestion();
}

function nouvelleQuestion(){
  if (qnum >= ROUND_LENGTH){
    endRound(); return;
  }
  qnum++; qnumEl.textContent = qnum;
  const a = Math.floor(Math.random() * (currentMax + 1));
  const b = Math.floor(Math.random() * (currentMax + 1));
  let answer, text;
  if (mode === 'add'){
    answer = a + b; text = `${a} + ${b} = ?`;
  } else if (mode === 'mul'){
    answer = a * b; text = `${a} × ${b} = ?`;
  } else {
    if (Math.random() < 0.5){ answer = a + b; text = `${a} + ${b} = ?`; }
    else { answer = a * b; text = `${a} × ${b} = ?`; }
  }
  currentAnswer = answer;
  questionEl.textContent = text;
  questionEl.classList.remove('pop'); void questionEl.offsetWidth; questionEl.classList.add('pop');

  // build choices
  const choices = [answer];
  while (choices.length < 3){
    const delta = Math.max(1, Math.round(Math.random() * Math.max(2, Math.round(currentMax/2))));
    const sign = Math.random()>0.5?1:-1;
    const cand = Math.max(0, answer + sign * delta);
    if (!choices.includes(cand)) choices.push(cand);
  }
  choices.sort(() => Math.random() - 0.5);
  renderChoices(choices);
}

def renderChoices(choices):
    pass
# (Placeholder to avoid syntax errors in text cell)
