document.addEventListener("DOMContentLoaded", () => {
  // 1. Envelope Opening & Light Burst Animation
  const envelopeScreen = document.getElementById("envelope-screen");
  const openSealBtn = document.getElementById("open-seal-btn");
  const mainCard = document.getElementById("main-card");

  if (openSealBtn && envelopeScreen && mainCard) {
    openSealBtn.addEventListener("click", () => {
      envelopeScreen.classList.add("opening");

      setTimeout(() => {
        envelopeScreen.classList.add("hidden");
        mainCard.classList.remove("hidden");
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 850);
    });
  }

  // 2. Live Countdown Timer (20 Dec 2026, 8:00 PM)
  const targetDate = new Date("2026-12-20T20:00:00").getTime();
  const daysEl = document.getElementById("days");
  const hoursEl = document.getElementById("hours");
  const minutesEl = document.getElementById("minutes");
  const secondsEl = document.getElementById("seconds");

  function updateCountdown() {
    const now = Date.now();
    const diff = targetDate - now;

    if (diff <= 0) {
      if (daysEl) daysEl.textContent = "00";
      if (hoursEl) hoursEl.textContent = "00";
      if (minutesEl) minutesEl.textContent = "00";
      if (secondsEl) secondsEl.textContent = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / 1000 / 60) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    if (daysEl) daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, "0");
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 3. Scratch-to-Reveal Canvas
  const canvas = document.getElementById("scratch-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#d4af37");
    gradient.addColorStop(0.5, "#f3d57a");
    gradient.addColorStop(1, "#b88924");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#5c1622";
    ctx.font = "bold 16px Georgia, serif";
    ctx.textAlign = "center";
    ctx.fillText("Scratch Here", canvas.width / 2, canvas.height / 2 + 5);

    let isDrawing = false;

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * canvas.width,
        y: ((clientY - rect.top) / rect.height) * canvas.height
      };
    }

    function scratch(e) {
      if (!isDrawing) return;
      e.preventDefault();
      const { x, y } = getPos(e);
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
    }

    canvas.addEventListener("mousedown", (e) => { isDrawing = true; scratch(e); });
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", () => { isDrawing = false; });

    canvas.addEventListener("touchstart", (e) => { isDrawing = true; scratch(e); }, { passive: false });
    canvas.addEventListener("touchmove", scratch, { passive: false });
    window.addEventListener("touchend", () => { isDrawing = false; });
  }

  // 4. Soft Melody Toggle (Web Audio)
  const soundBtn = document.getElementById("sound-toggle-btn");
  let audioCtx = null;
  let melodyTimer = null;
  let isPlaying = false;

  const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 659.25];
  let noteIndex = 0;

  function playNote() {
    if (!audioCtx) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.value = notes[noteIndex % notes.length];
    noteIndex++;

    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.06, audioCtx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 1.1);

    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.15);
  }

  if (soundBtn) {
    soundBtn.addEventListener("click", () => {
      if (!isPlaying) {
        audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
        if (audioCtx.state === "suspended") audioCtx.resume();
        playNote();
        melodyTimer = setInterval(playNote, 900);
        isPlaying = true;
        soundBtn.textContent = "Melody: On";
        soundBtn.setAttribute("aria-pressed", "true");
      } else {
        clearInterval(melodyTimer);
        isPlaying = false;
        soundBtn.textContent = "Melody: Off";
        soundBtn.setAttribute("aria-pressed", "false");
      }
    });
  }

  // 5. RSVP & Blessings Form
  const rsvpForm = document.getElementById("rsvp-form");
  const rsvpStatus = document.getElementById("rsvp-status");

  if (rsvpForm && rsvpStatus) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("guest-name").value.trim();
      rsvpStatus.textContent = `JazakAllah ${name}! Your blessing and RSVP have been recorded.`;
      rsvpForm.reset();
    });
  }
});
