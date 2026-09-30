// Louis Photography: page behavior. No dependencies.

// Where inquiries go. Change this to your real address
// (or swap the submit handler for a form service like Formspree).
const INQUIRY_EMAIL = "hello@example.com";

const header = document.querySelector(".site-header");
const nav = document.getElementById("site-nav");
const toggle = document.querySelector(".menu-toggle");

// Header: solid background once the hero is scrolled past
const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 40);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// Mobile menu
const setMenu = (open) => {
  nav.classList.toggle("is-open", open);
  header.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.querySelector(".menu-toggle__label").textContent = open ? "Close" : "Menu";
  document.body.style.overflow = open ? "hidden" : "";
};
toggle.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
nav.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); toggle.focus(); }
});

// Grease-pencil circles on the selected contact-sheet frames.
// Slightly different hand-drawn loop each time, overshooting its start like a real pencil mark.
const greasePath = (seed) => {
  const r = (n) => (Math.sin(seed * 9.73 + n * 3.1) + 1) / 2;
  const pts = [];
  const turns = 1.12;
  for (let i = 0; i <= 28; i++) {
    const t = (i / 28) * Math.PI * 2 * turns - 0.6;
    const rx = 46 + r(i) * 3;
    const ry = 42 + r(i + 7) * 4;
    pts.push([50 + Math.cos(t) * rx, 50 + Math.sin(t) * ry]);
  }
  return "M" + pts.map((p) => p.map((v) => v.toFixed(1)).join(" ")).join(" L");
};
document.querySelectorAll(".strip__frame.is-select").forEach((frame, i) => {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "grease");
  svg.setAttribute("viewBox", "0 0 100 100");
  svg.setAttribute("preserveAspectRatio", "none");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
  path.setAttribute("d", greasePath(i + 1));
  path.setAttribute("pathLength", "1");
  svg.appendChild(path);
  frame.appendChild(svg);
});

// Scroll reveals (chapters, quote) and the contact-sheet draw
const revealTargets = document.querySelectorAll("[data-reveal], [data-sheet]");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2, rootMargin: "0px 0px -8% 0px" });
  revealTargets.forEach((el) => io.observe(el));
} else {
  revealTargets.forEach((el) => el.classList.add("is-in"));
}

// The day's clock: shows which moment of the day you're reading, and how far through it you are
const day = document.getElementById("the-day");
const chapters = [...document.querySelectorAll(".chapter")];
const clock = document.querySelector(".day-clock");
const clockTime = clock.querySelector(".day-clock__time");
const clockTitle = clock.querySelector(".day-clock__title");
const clockFill = clock.querySelector(".day-clock__fill");

// Intro: split into words so each one can come into focus as you scroll
const intro = document.querySelector(".intro__text");
const wrapWords = (node) => {
  [...node.childNodes].forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const frag = document.createDocumentFragment();
      child.textContent.split(/(\s+)/).forEach((part) => {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        const span = document.createElement("span");
        span.className = "word";
        span.textContent = part;
        frag.appendChild(span);
      });
      child.replaceWith(frag);
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      wrapWords(child);
    }
  });
};
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let words = [];
if (!reduceMotion) {
  wrapWords(intro);
  words = [...intro.querySelectorAll(".word")];
  intro.classList.add("is-reading");
}

let ticking = false;
const onStoryScroll = () => {
  ticking = false;
  const vh = window.innerHeight;

  // Intro words: light up from the start of the paragraph as it rises through the screen
  if (words.length) {
    const r = intro.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
    const lit = Math.round(progress * words.length);
    words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
  }

  // Day clock
  const d = day.getBoundingClientRect();
  const inDay = d.top < vh * 0.5 && d.bottom > vh * 0.6;
  clock.classList.toggle("is-on", inDay);
  if (!inDay) return;
  let current = chapters[0];
  chapters.forEach((c) => { if (c.getBoundingClientRect().top < vh * 0.55) current = c; });
  const time = current.querySelector("time").textContent + " " + current.querySelector(".chapter__time span").textContent;
  if (clockTime.textContent !== time) {
    clockTime.textContent = time;
    clockTitle.textContent = current.querySelector(".chapter__title").textContent;
  }
  const first = chapters[0].getBoundingClientRect().top;
  const last = chapters[chapters.length - 1].getBoundingClientRect().bottom;
  const through = Math.min(1, Math.max(0, (vh * 0.55 - first) / (last - first)));
  clockFill.style.transform = `scaleX(${through})`;
};
window.addEventListener("scroll", () => {
  if (!ticking) { ticking = true; requestAnimationFrame(onStoryScroll); }
}, { passive: true });
onStoryScroll();

// Inquiry form: validate, then open the visitor's email app with everything filled in
const form = document.getElementById("inquiry-form");
const status = form.querySelector(".form__status");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const names = form.elements.names;
  const email = form.elements.email;
  let firstBad = null;

  [names, email].forEach((field) => {
    const ok = field.value.trim() !== "" && field.checkValidity();
    field.setAttribute("aria-invalid", String(!ok));
    if (!ok && !firstBad) firstBad = field;
  });

  if (firstBad) {
    status.classList.add("is-error");
    status.textContent = firstBad === names
      ? "Add your names so I know who's writing."
      : "Enter an email address I can reply to, like you@example.com.";
    firstBad.focus();
    return;
  }

  const date = form.elements.date.value || "Not set yet";
  const venue = form.elements.venue.value.trim() || "Not set yet";
  const body = [
    `Names: ${names.value.trim()}`,
    `Email: ${email.value.trim()}`,
    `Date: ${date}`,
    `Venue: ${venue}`,
    "",
    form.elements.story.value.trim(),
  ].join("\n");

  window.location.href = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent(`Wedding inquiry: ${names.value.trim()}`)}&body=${encodeURIComponent(body)}`;
  status.classList.remove("is-error");
  status.textContent = "Your email app should open with your inquiry ready to send.";
});

form.querySelectorAll("input").forEach((field) => {
  field.addEventListener("input", () => field.removeAttribute("aria-invalid"));
});

// Footer year
document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
