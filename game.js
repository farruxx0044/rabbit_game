// ===== ELEMENTS =====
const board = document.getElementById("game-board");
const startBtn = document.getElementById("startBtn");
const wheelBtn = document.getElementById("wheelBtn");
const diceBtn = document.getElementById("dice-btn");
const info = document.getElementById("info");
const diceDisplay = document.getElementById("dice-display");

const wheelOverlay = document.getElementById("wheel-overlay");
const wheelRotator = document.getElementById("wheel-rotator");
const slicesGroup = document.getElementById("slices");

// ===== SOUNDS =====
const spinSound = new Audio("spin.mp3");
spinSound.loop = true;

const landSound = new Audio("land.mp3");
landSound.volume = 0.6;

// ===== GAME STATE =====
const size = 8;
const finishIndex = size * size - 1;

let rabbitIndex = 0;
let gameStarted = false;
let isMoving = false;
let diceTurnsLeft = 0;

// ===== WHEEL DATA =====
const wheelItems = ["1","5","6","8","10","Omadsiz","2x","4x"];
const colors = ["#ffd966","#f4b183","#ff9999","#9ad0f5","#b6d7a8","#f4cccc","#d9b3ff","#a2c4c9"];

// ===== BOARD =====
function createBoard() {
  board.innerHTML = "";
  for (let i = 0; i < size * size; i++) {
    const c = document.createElement("div");
    c.className = "cell";
    board.appendChild(c);
  }
}

// ===== RABBIT DRAW =====
function drawRabbit(isFinal = false) {
  const cells = document.querySelectorAll(".cell");
  cells.forEach(c => c.textContent = "");

  const cell = cells[rabbitIndex];
  cell.textContent = isFinal ? "🐰👍" : "🐰";

  cell.classList.remove("rabbit-hop", "rabbit-final");
  void cell.offsetWidth;

  if (isFinal) {
    cell.classList.add("rabbit-final");
    showSparkle(cell);
    landSound.currentTime = 0;
    landSound.play();
  } else {
    cell.classList.add("rabbit-hop");
  }
}

// ===== MOVE STEP BY STEP =====
function moveStepByStep(steps) {
  isMoving = true;
  let moved = 0;

  const interval = setInterval(() => {
    const isLastStep = moved === steps - 1;

    if (rabbitIndex < finishIndex) {
      rabbitIndex++;
    }

    if (isLastStep) {
      drawRabbit(true);
      clearInterval(interval);
      isMoving = false;
      checkFinish();
      return;
    }

    drawRabbit(false);
    moved++;
  }, 350);
}

// ===== FINISH =====
function checkFinish() {
  if (rabbitIndex === finishIndex) {
    info.textContent = "🎉 Tabriklaymiz! Quyoncha qishga tayyor!";
    diceBtn.classList.add("dice-disabled");
    wheelBtn.disabled = true;
    return;
  }

  diceBtn.classList.remove("dice-disabled");
  wheelBtn.disabled = false;
}

// ===== START =====
startBtn.addEventListener("click", () => {
  createBoard();
  rabbitIndex = 0;
  diceTurnsLeft = 0;
  drawRabbit();

  gameStarted = true;
  diceBtn.classList.add("dice-disabled");
  wheelBtn.disabled = false;
  info.textContent = "🎡 Avval barabanni aylantiring";
});

// ===== DICE (DOIRA) =====
diceBtn.addEventListener("click", () => {
  if (!gameStarted || isMoving) return;
  if (diceTurnsLeft <= 0) return;

  diceTurnsLeft--;
  const d = Math.floor(Math.random() * 6) + 1;
  diceDisplay.textContent = d;

  info.textContent = `🎲 Qolgan kubik: ${diceTurnsLeft}`;
  moveStepByStep(d);

  if (diceTurnsLeft === 0) {
    diceBtn.classList.add("dice-disabled");
    wheelBtn.disabled = false;
    info.textContent = "🎡 Yana barabanni aylantiring";
  }
});

// ===== DRAW WHEEL =====
function drawWheel() {
  slicesGroup.innerHTML = "";
  const cx = 150, cy = 150, r = 140;
  const angle = 360 / wheelItems.length;

  wheelItems.forEach((text, i) => {
    const start = angle * i;
    const end = start + angle;

    const x1 = cx + r * Math.cos(Math.PI * start / 180);
    const y1 = cy + r * Math.sin(Math.PI * start / 180);
    const x2 = cx + r * Math.cos(Math.PI * end / 180);
    const y2 = cy + r * Math.sin(Math.PI * end / 180);

    const path = document.createElementNS("http://www.w3.org/2000/svg","path");
    path.setAttribute(
      "d",
      `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`
    );
    path.setAttribute("fill", colors[i]);
    slicesGroup.appendChild(path);

    const labelAngle = start + angle / 2;
    const tx = cx + 85 * Math.cos(Math.PI * labelAngle / 180);
    const ty = cy + 85 * Math.sin(Math.PI * labelAngle / 180);

    const t = document.createElementNS("http://www.w3.org/2000/svg","text");
    t.setAttribute("x", tx);
    t.setAttribute("y", ty);
    t.setAttribute("text-anchor", "middle");
    t.setAttribute("font-size", "14");
    t.textContent = text;
    slicesGroup.appendChild(t);
  });
}
drawWheel();

// ===== WHEEL SPIN =====
wheelBtn.addEventListener("click", () => {
  if (!gameStarted || isMoving) return;

  wheelBtn.disabled = true;
  diceBtn.classList.add("dice-disabled");

  wheelOverlay.classList.remove("hidden");
  spinSound.currentTime = 0;
  spinSound.play();

  const sliceDeg = 360 / wheelItems.length;
  const spins = 5 + Math.floor(Math.random() * 3);
  const randomOffset = Math.random() * 360;
  const finalDeg = spins * 360 + randomOffset;

  wheelRotator.style.transition = "none";
  wheelRotator.style.transform = "rotate(0deg)";
  wheelRotator.getBoundingClientRect();

  wheelRotator.style.transition = "transform 9s cubic-bezier(.17,.67,.38,1)";
  wheelRotator.style.transform = `rotate(${finalDeg}deg)`;

  setTimeout(() => {
    spinSound.pause();
    wheelOverlay.classList.add("hidden");

    const rotation = finalDeg % 360;
    const corrected = (rotation + 90) % 360;
    const index = Math.floor((360 - corrected) / sliceDeg) % wheelItems.length;
    const value = wheelItems[index];

    if (!isNaN(value)) {
      diceTurnsLeft += parseInt(value);
      info.textContent = `🎡 ${value} ta kubik berildi`;
    } else if (value === "2x" || value === "4x") {
      const m = value === "2x" ? 2 : 4;
      diceTurnsLeft *= m;
      info.textContent = `✖️ ${m} barobar! Kubiklar: ${diceTurnsLeft}`;
    } else {
      info.textContent = "😅 Omadsiz aylanish";
    }

    if (diceTurnsLeft > 0) {
      diceBtn.classList.remove("dice-disabled");
    }

  }, 9000);
});

// ===== SPARKLE =====
function showSparkle(cell) {
  const s = document.createElement("div");
  s.className = "sparkle";
  s.textContent = "✨";
  s.style.top = "4px";
  s.style.right = "4px";
  cell.style.position = "relative";
  cell.appendChild(s);
  setTimeout(() => s.remove(), 600);
}
