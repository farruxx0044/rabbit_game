document.addEventListener("DOMContentLoaded", () => {

  /* ========= SAFE QUERY ========= */
  const $ = id => document.getElementById(id);

  const board = $("game-board");
  const startBtn = $("startBtn");
  const wheelBtn = $("wheelBtn");
  const diceBtn = $("dice-btn");
  const info = $("info");
  const diceDisplay = $("dice-display");

  const wheelOverlay = $("wheel-overlay");
  const wheelRotator = $("wheel-rotator");
  const slicesGroup = $("slices");

  const spinSound = $("spinSound");
  const landSound = $("landSound");

  if (!board || !startBtn || !wheelBtn || !diceBtn || !info) {
    console.error("❌ Required DOM elements missing");
    return;
  }

  /* ========= GAME STATE ========= */
  const size = 8;
  const finishIndex = size * size - 1;

  let rabbitIndex = 0;
  let diceTurnsLeft = 0;
  let isMoving = false;
  let gameStarted = false;

  /* ========= WHEEL DATA ========= */
  const wheelItems = ["1","5","6","8","10","Omadsiz","2x","4x"];
  const colors = ["#fde68a","#fdba74","#fca5a5","#93c5fd","#86efac","#fecaca","#d8b4fe","#a5f3fc"];

  /* ========= BOARD ========= */
  function createBoard() {
    board.innerHTML = "";
    for (let i = 0; i < size * size; i++) {
      const c = document.createElement("div");
      c.className = "cell";
      if (i === finishIndex) c.classList.add("finish");
      board.appendChild(c);
    }
    drawRabbit();
  }

  function drawRabbit(final = false) {
    const cells = document.querySelectorAll(".cell");
    cells.forEach(c => c.textContent = "");
    const cell = cells[rabbitIndex];
    cell.textContent = final ? "🐰🏁" : "🐰";
    cell.classList.remove("rabbit-hop","rabbit-final");
    void cell.offsetWidth;
    cell.classList.add(final ? "rabbit-final" : "rabbit-hop");
    if (final) sparkle(cell);
  }

  function sparkle(cell) {
    const s = document.createElement("div");
    s.className = "sparkle";
    s.textContent = "✨";
    cell.appendChild(s);
    setTimeout(() => s.remove(), 600);
  }

  /* ========= MOVE ========= */
  function moveStep() {
    if (isMoving || diceTurnsLeft <= 0) return;
    isMoving = true;
    rabbitIndex = Math.min(rabbitIndex + 1, finishIndex);
    diceTurnsLeft--;
    drawRabbit(rabbitIndex === finishIndex);
    landSound?.play().catch(()=>{});
    isMoving = false;
    updateUI();
  }

  function updateUI() {
    diceDisplay.textContent = diceTurnsLeft;
    if (rabbitIndex === finishIndex) {
      info.textContent = "🎉 G‘alaba!";
      diceBtn.classList.add("dice-disabled");
      wheelBtn.disabled = true;
    } else if (diceTurnsLeft > 0) {
      info.textContent = "🎲 Kubikni bosing";
      diceBtn.classList.remove("dice-disabled");
    } else {
      info.textContent = "🎡 Barabanni aylantiring";
      diceBtn.classList.add("dice-disabled");
      wheelBtn.disabled = false;
    }
  }

  /* ========= WHEEL ========= */
  function drawWheel() {
    if (!slicesGroup) return;
    slicesGroup.innerHTML = "";
    const cx = 150, cy = 150, r = 140;
    const slice = 360 / wheelItems.length;

    wheelItems.forEach((text, i) => {
      const start = slice * i;
      const end = start + slice;

      const x1 = cx + r * Math.cos(Math.PI * start / 180);
      const y1 = cy + r * Math.sin(Math.PI * start / 180);
      const x2 = cx + r * Math.cos(Math.PI * end / 180);
      const y2 = cy + r * Math.sin(Math.PI * end / 180);

      const path = document.createElementNS("http://www.w3.org/2000/svg","path");
      path.setAttribute("d",`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`);
      path.setAttribute("fill", colors[i]);
      slicesGroup.appendChild(path);

      const labelAngle = start + slice / 2;
      const tx = cx + 90 * Math.cos(Math.PI * labelAngle / 180);
      const ty = cy + 90 * Math.sin(Math.PI * labelAngle / 180);

      const t = document.createElementNS("http://www.w3.org/2000/svg","text");
      t.setAttribute("x", tx);
      t.setAttribute("y", ty);
      t.setAttribute("text-anchor","middle");
      t.setAttribute("font-size","14");
      t.textContent = text;
      slicesGroup.appendChild(t);
    });
  }

  /* ========= EVENTS ========= */
  startBtn.onclick = () => {
    rabbitIndex = 0;
    diceTurnsLeft = 0;
    gameStarted = true;
    createBoard();
    updateUI();
  };

  diceBtn.onclick = moveStep;

  wheelBtn.onclick = () => {
    if (!gameStarted) return;
    wheelBtn.disabled = true;
    wheelOverlay.classList.remove("hidden");
    spinSound?.play().catch(()=>{});

    const sliceDeg = 360 / wheelItems.length;
    const spins = 5 + Math.floor(Math.random() * 3);
    const finalDeg = spins * 360 + Math.random() * 360;

    wheelRotator.style.transition = "none";
    wheelRotator.style.transform = "rotate(0deg)";
    wheelRotator.getBoundingClientRect();

    wheelRotator.style.transition = "transform 7s cubic-bezier(.17,.67,.38,1)";
    wheelRotator.style.transform = `rotate(${finalDeg}deg)`;

    setTimeout(() => {
      spinSound.pause();
      wheelOverlay.classList.add("hidden");
      const index = Math.floor(((finalDeg % 360) + 90) / sliceDeg) % wheelItems.length;
      const val = wheelItems[index];

      if (!isNaN(val)) diceTurnsLeft += +val;
      else if (val === "2x") diceTurnsLeft = Math.max(1, diceTurnsLeft) * 2;
      else if (val === "4x") diceTurnsLeft = Math.max(1, diceTurnsLeft) * 4;
      else diceTurnsLeft = 0;

      updateUI();
    }, 7000);
  };

  drawWheel();
  createBoard();
});