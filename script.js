document.addEventListener("DOMContentLoaded", () => {
  const envelopeScreen = document.getElementById("envelope-screen");
  const envelopeWrapper = document.getElementById("envelope-wrapper");
  const lightBurst = document.getElementById("light-burst");
  const invitationContainer = document.getElementById("invitation-container");
  const bgVideo = document.getElementById("bg-video");

  let isOpened = false;

  /* ================= 1. ENVELOPE OPENING + LIGHT BURST ================= */
  function openInvitation() {
    if (isOpened) return;
    isOpened = true;

    envelopeWrapper.classList.add("opening");

    setTimeout(() => {
      lightBurst.classList.add("active");
    }, 550);

    setTimeout(() => {
      invitationContainer.classList.remove("hidden");
      envelopeScreen.classList.add("fade-out");

      if (bgVideo) {
        bgVideo.play().catch(() => {});
      }

      initScrollAnimations();
      initHeartScratch();
    }, 1050);

    setTimeout(() => {
      lightBurst.classList.remove("active");
    }, 1750);
  }

  envelopeWrapper.addEventListener("click", openInvitation);
  envelopeWrapper.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openInvitation();
    }
  });

  /* ================= 2. SCROLL REVEAL ANIMATIONS ================= */
  function initScrollAnimations() {
    const reveals = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.14 }
    );

    reveals.forEach((el) => observer.observe(el));
  }

  /* ================= 3. HEART SCRATCH CARD + PETALS ================= */
  function initHeartScratch() {
    const canvas = document.getElementById("scratch-canvas");
    const scratchHeading = document.getElementById("scratch-heading");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    let isDrawing = false;
    let isRevealed = false;

    function drawHeartPath(context, x, y, width, height) {
      context.beginPath();
      const topCurveHeight = height * 0.3;
      context.moveTo(x, y + topCurveHeight);
      context.bezierCurveTo(x, y, x - width / 2, y, x - width / 2, y + topCurveHeight);
      context.bezierCurveTo(
        x - width / 2,
        y + (height + topCurveHeight) / 2,
        x,
        y + (height + topCurveHeight) / 1.35,
        x,
        y + height
      );
      context.bezierCurveTo(
        x,
        y + (height + topCurveHeight) / 1.35,
        x + width / 2,
        y + (height + topCurveHeight) / 2,
        x + width / 2,
        y + topCurveHeight
      );
      context.bezierCurveTo(x + width / 2, y, x, y, x, y + topCurveHeight);
      context.closePath();
    }

    ctx.save();
    drawHeartPath(ctx, w / 2, 16, 230, 220);
    ctx.clip();

    const grad = ctx.createRadialGradient(w / 2, h / 2, 20, w / 2, h / 2, 140);
    grad.addColorStop(0, "#d88a99");
    grad.addColorStop(0.55, "#9c3d4e");
    grad.addColorStop(1, "#6b1d2a");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle shimmer sparkles on heart
    for (let i = 0; i < 90; i++) {
      ctx.fillStyle = "rgba(255, 240, 220, 0.28)";
      ctx.beginPath();
      ctx.arc(Math.random() * w, Math.random() * h, Math.random() * 1.6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    ctx.globalCompositeOperation = "destination-out";

    function getCoords(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * w,
        y: ((clientY - rect.top) / rect.height) * h,
      };
    }

    function scratch(e) {
      if (!isDrawing || isRevealed) return;
      e.preventDefault();
      const { x, y } = getCoords(e);
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
      checkRevealProgress();
    }

    function checkRevealProgress() {
      const imageData = ctx.getImageData(0, 0, w, h).data;
      let transparentPixels = 0;
      for (let i = 3; i < imageData.length; i += 16) {
        if (imageData[i] === 0) transparentPixels++;
      }
      const totalSampled = imageData.length / 16;
      if (transparentPixels / totalSampled > 0.42) {
        isRevealed = true;
        canvas.classList.add("cleared");
        if (scratchHeading) {
          scratchHeading.textContent = "Our forever begins";
        }
        launchPetals();
      }
    }

    canvas.addEventListener("mousedown", (e) => {
      isDrawing = true;
      scratch(e);
    });
    canvas.addEventListener("mousemove", scratch);
    window.addEventListener("mouseup", () => (isDrawing = false));

    canvas.addEventListener("touchstart", (e) => {
      isDrawing = true;
      scratch(e);
    }, { passive: false });
    canvas.addEventListener("touchmove", scratch, { passive: false });
    window.addEventListener("touchend", () => (isDrawing = false));
  }

  function launchPetals() {
    const container = document.getElementById("confetti-container");
    if (!container) return;
    const colors = ["#7a1c28", "#c9a15b", "#d98292", "#f2d399"];

    for (let i = 0; i < 42; i++) {
      const petal = document.createElement("div");
      petal.className = "petal";
      petal.style.left = Math.random() * 100 + "vw";
      petal.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      petal.style.animationDuration = 2.4 + Math.random() * 2 + "s";
      petal.style.animationDelay = Math.random() * 0.5 + "s";
      container.appendChild(petal);

      setTimeout(() => petal.remove(), 4800);
    }
  }

  /* ================= 4. LIVE COUNTDOWN (20 DEC 2026, 8:00 PM) ================= */
  const targetDate = new Date("2026-12-20T20:00:00").getTime();

  function updateCountdown() {
    const now = Date.now();
    const diff = targetDate - now;

    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minsEl = document.getElementById("minutes");
    const secsEl = document.getElementById("seconds");
    if (!daysEl) return;

    if (diff <= 0) {
      daysEl.textContent = "00";
      hoursEl.textContent = "00";
      minsEl.textContent = "00";
      secsEl.textContent = "00";
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, "0");
    hoursEl.textContent = String(hours).padStart(2, "0");
    minsEl.textContent = String(minutes).padStart(2, "0");
    secsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  /* ================= 5. RSVP FORM ================= */
  const rsvpForm = document.getElementById("rsvp-form");
  const rsvpMessage = document.getElementById("rsvp-message");

  if (rsvpForm) {
    rsvpForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("guest-name").value.trim();
      const status = document.getElementById("guest-status").value;

      if (!name || !status) return;

      rsvpMessage.textContent =
        status === "attending"
          ? `Thank you, ${name}! We look forward to welcoming you at the Walima.`
          : `Thank you for letting us know, ${name}. You will be missed!`;

      rsvpForm.reset();
    });
  }
});
                                         
