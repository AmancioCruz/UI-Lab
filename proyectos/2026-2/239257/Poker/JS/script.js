// --- SINTETIZADOR DE AUDIO RETRO (Web Audio API) ---
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function initAudio() {
  if (!audioCtx) audioCtx = new AudioCtx();
}

function playSound(type) {
  if (!audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const now = audioCtx.currentTime;

  if (type === 'card') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
    osc.start(now);
    osc.stop(now + 0.08);
  } else if (type === 'coin') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now);
    osc.frequency.setValueAtTime(1318.51, now + 0.08);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
    osc.start(now);
    osc.stop(now + 0.25);
  } else if (type === 'win') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);
    osc.frequency.setValueAtTime(1046.50, now + 0.3);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'lose') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(120, now + 0.4);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.4);
    osc.start(now);
    osc.stop(now + 0.4);
  } else if (type === 'select') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, now);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
    osc.start(now);
    osc.stop(now + 0.05);
  }
}

// --- CONFIGURACIÓN DE SIMBOLOS DE MARIO ---
const SYMBOLS = [
  { id: 6, name: 'Estrella', icon: '⭐', bg: 'from-amber-400 to-yellow-600', text: 'text-yellow-100' },
  { id: 5, name: 'Champiñón', icon: '🍄', bg: 'from-red-500 to-red-700', text: 'text-white' },
  { id: 4, name: 'Flor', icon: '🔥', bg: 'from-orange-400 to-amber-600', text: 'text-white' },
  { id: 3, name: 'Luigi', icon: '👨🏻‍🌾', bg: 'from-green-600 to-emerald-800', text: 'text-white' },
  { id: 2, name: 'Mario', icon: '👨🏻', bg: 'from-blue-600 to-indigo-800', text: 'text-white' },
  { id: 1, name: 'Nube', icon: '☁️', bg: 'from-sky-300 to-blue-400', text: 'text-gray-900' }
];

const HAND_RANKS = {
  FIVE_OF_A_KIND: { rank: 7, name: 'Cinco Iguales', mult: 16 },
  FOUR_OF_A_KIND: { rank: 6, name: 'Póker', mult: 8 },
  FULL_HOUSE:     { rank: 5, name: 'Full House', mult: 6 },
  THREE_OF_A_KIND:{ rank: 4, name: 'Trío', mult: 4 },
  TWO_PAIR:       { rank: 3, name: 'Doble Pareja', mult: 3 },
  ONE_PAIR:       { rank: 2, name: 'Pareja', mult: 2 },
  HIGH_CARD:      { rank: 1, name: 'Carta Alta', mult: 0 }
};

// --- ESTADO DEL JUEGO ---
let state = {
  coins: 30,
  currentBet: 1,
  winStreak: 0,
  phase: 'BETTING', // BETTING, DRAWING, REVEAL
  playerHand: [],
  luigiHand: [],
  playerHolds: [false, false, false, false, false],
};

// --- ELEMENTOS DOM ---
const elLuigiCards = document.getElementById('luigi-cards');
const elPlayerCards = document.getElementById('player-cards');
const elCoins = document.getElementById('coins-display');
const elBet = document.getElementById('bet-display');
const elBtnAction = document.getElementById('btn-action');
const elBtnAddBet = document.getElementById('btn-add-bet');
const elBtnSubBet = document.getElementById('btn-sub-bet');
const elLuigiDialog = document.getElementById('luigi-dialog');
const elPlayerHandTitle = document.getElementById('player-hand-title');
const elLuigiHandTitle = document.getElementById('luigi-hand-title');

// --- EXPRESIONES DE LUIGI ---
function setLuigiExpression(expr, dialogText) {
  if (dialogText) elLuigiDialog.textContent = dialogText;

  const eyebrowL = document.getElementById('eyebrow-left');
  const eyebrowR = document.getElementById('eyebrow-right');
  const mouth = document.getElementById('luigi-mouth');
  const pupilL = document.getElementById('pupil-left');
  const pupilR = document.getElementById('pupil-right');

  if (expr === 'happy') {
    eyebrowL.setAttribute('d', 'M 70,90 Q 80,85 90,95');
    eyebrowR.setAttribute('d', 'M 110,95 Q 120,85 130,90');
    mouth.setAttribute('d', 'M 85,145 Q 100,165 115,145 Z');
    pupilL.setAttribute('cy', '108'); pupilR.setAttribute('cy', '108');
  } else if (expr === 'sad') {
    eyebrowL.setAttribute('d', 'M 70,95 Q 80,102 90,95');
    eyebrowR.setAttribute('d', 'M 110,95 Q 120,102 130,95');
    mouth.setAttribute('d', 'M 90,155 Q 100,145 110,155');
    pupilL.setAttribute('cy', '112'); pupilR.setAttribute('cy', '112');
  } else if (expr === 'surprised') {
    eyebrowL.setAttribute('d', 'M 70,88 Q 80,80 90,88');
    eyebrowR.setAttribute('d', 'M 110,88 Q 120,80 130,88');
    mouth.setAttribute('d', 'M 92,148 A 8,8 0 1 0 108,148 A 8,8 0 1 0 92,148');
    pupilL.setAttribute('cy', '110'); pupilR.setAttribute('cy', '110');
  } else { // normal
    eyebrowL.setAttribute('d', 'M 70,95 Q 80,90 90,95');
    eyebrowR.setAttribute('d', 'M 110,95 Q 120,90 130,95');
    mouth.setAttribute('d', 'M 90,148 Q 100,158 110,148');
    pupilL.setAttribute('cy', '110'); pupilR.setAttribute('cy', '110');
  }
}

// --- RACHA DE ESTRELLAS ---
function updateStarDisplay() {
  for (let i = 1; i <= 5; i++) {
    const starEl = document.getElementById(`star-${i}`);
    if (i <= state.winStreak) {
      starEl.classList.remove('star-off');
      starEl.classList.add('star-glow');
    } else {
      starEl.classList.add('star-off');
      starEl.classList.remove('star-glow');
    }
  }
}

// --- GENERADOR DE CARTAS ---
function getRandomCard() {
  return SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
}

function createDeck(count = 5) {
  const cards = [];
  for (let i = 0; i < count; i++) {
    cards.push(getRandomCard());
  }
  return cards;
}

// --- MOTOR DE EVALUACIÓN DE MANOS ---
function evaluateHand(cards) {
  const counts = {};
  cards.forEach(c => counts[c.id] = (counts[c.id] || 0) + 1);

  const freq = Object.entries(counts)
    .map(([id, count]) => ({ id: parseInt(id), count }))
    .sort((a, b) => b.count - a.count || b.id - a.id);

  if (freq[0].count === 5) return { type: HAND_RANKS.FIVE_OF_A_KIND, tieBreaker: [freq[0].id] };
  if (freq[0].count === 4) return { type: HAND_RANKS.FOUR_OF_A_KIND, tieBreaker: [freq[0].id, freq[1].id] };
  if (freq[0].count === 3 && freq[1].count === 2) return { type: HAND_RANKS.FULL_HOUSE, tieBreaker: [freq[0].id, freq[1].id] };
  if (freq[0].count === 3) return { type: HAND_RANKS.THREE_OF_A_KIND, tieBreaker: [freq[0].id, freq[1].id, freq[2].id] };
  if (freq[0].count === 2 && freq[1].count === 2) return { type: HAND_RANKS.TWO_PAIR, tieBreaker: [freq[0].id, freq[1].id, freq[2].id] };
  if (freq[0].count === 2) return { type: HAND_RANKS.ONE_PAIR, tieBreaker: [freq[0].id, ...freq.slice(1).map(f => f.id)] };
  
  const sorted = cards.map(c => c.id).sort((a, b) => b - a);
  return { type: HAND_RANKS.HIGH_CARD, tieBreaker: sorted };
}

function compareHands(handA, handB) {
  const evalA = evaluateHand(handA);
  const evalB = evaluateHand(handB);

  if (evalA.type.rank !== evalB.type.rank) {
    return evalA.type.rank > evalB.type.rank ? 1 : -1;
  }
  for (let i = 0; i < evalA.tieBreaker.length; i++) {
    if (evalA.tieBreaker[i] !== evalB.tieBreaker[i]) {
      return evalA.tieBreaker[i] > evalB.tieBreaker[i] ? 1 : -1;
    }
  }
  return 0; // Empate
}

// --- RENDERIZADO DE CARTAS EN PANTALLA ---
function renderCards() {
  // Luigi Cards
  elLuigiCards.innerHTML = '';
  state.luigiHand.forEach(card => {
    const cardEl = document.createElement('div');
    cardEl.className = `w-12 h-16 bg-gradient-to-b ${state.phase === 'REVEAL' ? card.bg : 'from-blue-700 to-indigo-900'} border-2 border-white/80 rounded-lg flex flex-col items-center justify-center shadow-md card-3d`;
    if (state.phase === 'REVEAL') {
      cardEl.innerHTML = `<span class="text-xl">${card.icon}</span><span class="text-[7px] ${card.text} font-bold mt-1">${card.name}</span>`;
    } else {
      cardEl.innerHTML = `<span class="text-lg text-blue-300">❓</span>`;
    }
    elLuigiCards.appendChild(cardEl);
  });

  // Player Cards
  elPlayerCards.innerHTML = '';
  state.playerHand.forEach((card, index) => {
    const cardEl = document.createElement('div');
    const isHeld = state.playerHolds[index];
    cardEl.className = `w-12 h-16 bg-gradient-to-b ${card.bg} border-2 ${isHeld ? 'border-yellow-400 card-selected' : 'border-white/80'} rounded-lg flex flex-col items-center justify-center shadow-md cursor-pointer card-3d relative`;
    
    cardEl.innerHTML = `
      ${isHeld ? '<span class="absolute -top-2 bg-yellow-400 text-gray-950 font-black text-[6px] px-1 rounded-full shadow">HOLD</span>' : ''}
      <span class="text-xl">${card.icon}</span>
      <span class="text-[7px] ${card.text} font-bold mt-1">${card.name}</span>
    `;

    cardEl.onclick = () => toggleHold(index);
    elPlayerCards.appendChild(cardEl);
  });

  // Títulos de manos
  if (state.phase === 'DRAWING') {
    const playerEval = evaluateHand(state.playerHand);
    elPlayerHandTitle.textContent = playerEval.type.name;
    elLuigiHandTitle.textContent = '???';
  } else if (state.phase === 'REVEAL') {
    const playerEval = evaluateHand(state.playerHand);
    const luigiEval = evaluateHand(state.luigiHand);
    elPlayerHandTitle.textContent = playerEval.type.name;
    elLuigiHandTitle.textContent = luigiEval.type.name;
  } else {
    elPlayerHandTitle.textContent = '---';
    elLuigiHandTitle.textContent = '---';
  }
}

function toggleHold(index) {
  initAudio();
  if (state.phase !== 'DRAWING') return;
  state.playerHolds[index] = !state.playerHolds[index];
  playSound('select');
  renderCards();
}

// --- IA DE LUIGI ---
function luigiSmartDraw() {
  const counts = {};
  state.luigiHand.forEach(c => counts[c.id] = (counts[c.id] || 0) + 1);

  state.luigiHand = state.luigiHand.map(card => {
    if (counts[card.id] >= 2 || card.id >= 5) {
      return card; // Mantiene
    }
    return getRandomCard(); // Cambia
  });
}

// --- LÓGICA DE FASES Y JUEGO ---
function handleAction() {
  initAudio();
  if (state.phase === 'BETTING') {
    if (state.coins < state.currentBet) {
      setLuigiExpression('sad', '¡No tienes suficientes monedas para esa apuesta!');
      return;
    }

    state.coins -= state.currentBet;
    playSound('coin');
    state.playerHand = createDeck(5);
    state.luigiHand = createDeck(5);
    state.playerHolds = [false, false, false, false, false];
    state.phase = 'DRAWING';

    playSound('card');
    setLuigiExpression('normal', 'Toca las cartas que quieras MANTENER y pulsa CAMBIAR.');
    elBtnAction.textContent = 'CAMBIAR CARTAS';
    elBtnAddBet.disabled = true;
    elBtnSubBet.disabled = true;

  } else if (state.phase === 'DRAWING') {
    state.playerHand = state.playerHand.map((card, i) => state.playerHolds[i] ? card : getRandomCard());
    luigiSmartDraw();

    playSound('card');
    state.phase = 'REVEAL';
    elBtnAction.textContent = 'NUEVA RONDA';

    resolveWinner();
  } else if (state.phase === 'REVEAL') {
    if (state.coins <= 0) {
      state.coins = 10;
      state.winStreak = 0;
      updateStarDisplay();
      setLuigiExpression('happy', '¡Te has quedado sin monedas! Te regalo 10 para seguir.');
    } else {
      setLuigiExpression('normal', '¡Hagamos otra apuesta!');
    }
    state.phase = 'BETTING';
    elBtnAction.textContent = 'APOSTAR';
    elBtnAddBet.disabled = false;
    elBtnSubBet.disabled = false;
  }

  updateUI();
}

function resolveWinner() {
  const result = compareHands(state.playerHand, state.luigiHand);
  const playerEval = evaluateHand(state.playerHand);

  if (result > 0) {
    state.winStreak = Math.min(5, state.winStreak + 1);
    const winMult = playerEval.type.mult > 0 ? playerEval.type.mult : 1;
    const streakBonus = state.winStreak;
    const totalWon = (state.currentBet * winMult) + streakBonus;
    
    state.coins += totalWon;
    playSound('win');
    updateStarDisplay();
    setLuigiExpression('sad', `Oooh noooo! Ganaste! Tu ${playerEval.type.name} supera mi mano. +${totalWon} 🪙`);
  } else if (result < 0) {
    state.winStreak = 0;
    playSound('lose');
    updateStarDisplay();
    setLuigiExpression('happy', `Wahooo!! Gano yo!! Mi mano vence tu ${playerEval.type.name}. ¡Sigue intentándolo!`);
  } else {
    state.coins += state.currentBet;
    playSound('select');
    setLuigiExpression('surprised', `¡Empate! Ambos tenemos ${playerEval.type.name}. Te devuelvo tu apuesta.`);
  }
}

function updateUI() {
  elCoins.textContent = state.coins;
  elBet.textContent = state.currentBet;
  renderCards();
}

// --- CONTROLES DE APUESTA ---
elBtnAddBet.onclick = () => {
  initAudio();
  //evita que puedas apostar mas de lo que tu dinero te deja
  if (state.currentBet < Math.min(state.coins, 5)) {
    state.currentBet++;
    playSound('select');
    updateUI();
  }
};

elBtnSubBet.onclick = () => {
  initAudio();
  //evita que la apuesta sea 0
  if (state.currentBet > 1) {
    state.currentBet--;
    playSound('select');
    updateUI();
  }
};

elBtnAction.onclick = handleAction;

// --- INICIO ---
updateUI();
updateStarDisplay();
setLuigiExpression('happy', '¡Bienvenido a Luigi´s Poker Night! Haz tu apuesta para comenzar.');