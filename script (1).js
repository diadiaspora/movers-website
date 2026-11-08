"use strict";

document.addEventListener("DOMContentLoaded", () => {

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Mobile nav ---------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  const setNav = (open) => {
    mainNav.classList.toggle("open", open);
    navToggle.setAttribute("aria-expanded", String(open));
  };

  navToggle.addEventListener("click", () => {
    setNav(!mainNav.classList.contains("open"));
  });
  mainNav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => setNav(false))
  );

  /* ---------- Animated counters ---------- */
  const counters = document.querySelectorAll("[data-count]");

  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1400;
    const start = performance.now();
    const format = (n) => n.toLocaleString("en-US");

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = format(Math.round(target * eased)) + (target >= 1000 ? "+" : "");
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---------- Reveal on scroll ---------- */
  const revealTargets = document.querySelectorAll(
    ".card, .plan, .steps li, .extras, .faq details, .estimator-form, .contact-form"
  );
  revealTargets.forEach((el) => el.classList.add("reveal"));

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("visible");
          if (entry.target.hasAttribute("data-count")) runCounter(entry.target);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15 }
    );
    revealTargets.forEach((el) => observer.observe(el));
    counters.forEach((el) => observer.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("visible"));
    counters.forEach(runCounter);
  }

  /* ---------- Price estimator ---------- */
  const RATES = { 2: 120, 3: 165, 4: 210 };
  const PRICES = {
    stairs: 35,        // per flight
    boxes: 65,
    packingRate: 45,   // per packer per hour
    packers: 2,
    packingHours: 3,
    piano: 225,
    protection: 75,
  };

  const sizeEl = document.getElementById("size");
  const hoursEl = document.getElementById("hours");
  const stairsEl = document.getElementById("stairs");
  const boxesEl = document.getElementById("boxes");
  const packingEl = document.getElementById("packing");
  const pianoEl = document.getElementById("piano");
  const protectionEl = document.getElementById("protection");
  const totalEl = document.getElementById("total");
  const breakdownEl = document.getElementById("breakdown");

  const money = (n) => "$" + n.toLocaleString("en-US");

  const clamp = (value, min, max, fallback) => {
    const n = parseInt(value, 10);
    if (Number.isNaN(n)) return fallback;
    return Math.min(Math.max(n, min), max);
  };

  const updateEstimate = () => {
    const rate = RATES[sizeEl.value];
    const hours = clamp(hoursEl.value, 3, 16, 3);
    const flights = clamp(stairsEl.value, 0, 10, 0);

    const lines = [];
    lines.push([`Labor & truck (${hours} hrs x $${rate})`, rate * hours]);

    if (flights > 1) {
      lines.push([`Stairs (${flights - 1} extra flights)`, PRICES.stairs * (flights - 1)]);
    }
    if (boxesEl.checked) lines.push(["Box & tape kit", PRICES.boxes]);
    if (packingEl.checked) {
      lines.push([
        "Packing service",
        PRICES.packingRate * PRICES.packers * PRICES.packingHours,
      ]);
    }
    if (pianoEl.checked) lines.push(["Piano / specialty item", PRICES.piano]);
    if (protectionEl.checked) lines.push(["Full-value protection", PRICES.protection]);

    const total = lines.reduce((sum, [, amount]) => sum + amount, 0);
    totalEl.textContent = money(total);

    breakdownEl.innerHTML = "";
    lines.forEach(([label, amount]) => {
      const li = document.createElement("li");
      const l = document.createElement("span");
      const a = document.createElement("span");
      l.textContent = label;
      a.textContent = money(amount);
      li.append(l, a);
      breakdownEl.appendChild(li);
    });
  };

  document
    .getElementById("estimateForm")
    .querySelectorAll("input, select")
    .forEach((el) => {
      el.addEventListener("input", updateEstimate);
      el.addEventListener("change", updateEstimate);
    });

  // Keep "Choose This Crew" buttons in sync with the estimator
  document.querySelectorAll(".plan a.btn, .plan a.btn-outline-dark").forEach((btn, i) => {
    btn.addEventListener("click", () => {
      sizeEl.value = ["2", "3", "4"][i];
      updateEstimate();
    });
  });

  updateEstimate();

  /* ---------- Contact form ---------- */
  const form = document.getElementById("contactForm");
  const msg = document.getElementById("formMsg");
  const nameEl = document.getElementById("name");
  const emailEl = document.getElementById("email");
  const dateEl = document.getElementById("date");

  // No past dates
  dateEl.min = new Date().toISOString().split("T")[0];

  const showMsg = (text, type) => {
    msg.textContent = text;
    msg.className = "form-msg " + type;
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    [nameEl, emailEl].forEach((el) => el.classList.remove("invalid"));

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailEl.value.trim());

    if (!nameEl.value.trim()) {
      nameEl.classList.add("invalid");
      nameEl.focus();
      return showMsg("Please enter your name.", "error");
    }
    if (!emailOk) {
      emailEl.classList.add("invalid");
      emailEl.focus();
      return showMsg("Please enter a valid email address.", "error");
    }

    /*
      TODO: Connect this to a real backend or form service
      (Formspree, Netlify Forms, your own API, etc.).
      For now the request is only confirmed on screen.
    */
    showMsg(`Thanks, ${nameEl.value.trim().split(" ")[0]}! We'll reply within one business day.`, "ok");
    form.reset();
  });
});
