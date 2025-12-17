 // MENÙ MOBILE
const burger = document.querySelector('.burger');
const mainNav = document.querySelector('.main-nav');

if (burger && mainNav) {
  burger.addEventListener('click', () => {
    mainNav.classList.toggle('open');
burger.classList.toggle("is-open");
  });
}

// STORYLINE / TIMELINE
const timelineEl = document.querySelector('[data-timeline]');
if (timelineEl) {
  const steps = Array.from(timelineEl.querySelectorAll('.timeline-step'));
  const activeLine = timelineEl.querySelector('.timeline-line-active');

  function updateActiveLine(index) {
    if (!activeLine || steps.length <= 1) return;
    const ratio = index / (steps.length - 1 || 1);
    // la linea va da 10% a 90% in base allo step
    const percent = 10 + ratio * 80;
    activeLine.style.height = percent + '%';
  }

  // Attiva il primo step subito
  if (steps.length > 0) {
    steps[0].classList.add('is-active');
    updateActiveLine(0);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const step = entry.target;
          if (entry.isIntersecting) {
            steps.forEach((s) => s.classList.remove('is-active'));
            step.classList.add('is-active');

            const index = steps.indexOf(step);
            if (index >= 0) {
              updateActiveLine(index);
            }
          }
        });
      },
      {
        root: null,
        threshold: 0.5,
      }
    );

    steps.forEach((step) => observer.observe(step));
  } else {
    // Browser vecchi: mostra tutto e linea piena
    steps.forEach((s) => s.classList.add('is-active'));
    updateActiveLine(steps.length - 1);
  }
}

// SMOOTH SCROLL PER I LINK CON #
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href').substring(1);
    if (!targetId) return;

    const target = document.getElementById(targetId);
    if (target) {
      e.preventDefault();
      const offset = 72; // per non coprire con l'header
      const top = target.getBoundingClientRect().top + window.scrollY - offset;

      window.scrollTo({
        top,
        behavior: 'smooth',
      });
    }
  });
});
// FAQ INTERATTIVE (ACCORDION)
document.addEventListener('DOMContentLoaded', () => {
  const faqItems = document.querySelectorAll('[data-faq-item]');

  if (!faqItems.length) return;

  faqItems.forEach((item) => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!btn || !answer) return;

    // stato iniziale
    answer.style.maxHeight = '0px';
    btn.setAttribute('aria-expanded', 'false');

    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('is-open');

      // chiudi tutte
      faqItems.forEach((other) => {
        const otherBtn = other.querySelector('.faq-question');
        const otherAnswer = other.querySelector('.faq-answer');
        if (!otherBtn || !otherAnswer) return;
        other.classList.remove('is-open');
        otherBtn.setAttribute('aria-expanded', 'false');
        otherAnswer.style.maxHeight = '0px';
      });

      // se prima era chiusa, apri questa
      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
});
// SEZIONE "LEONARDO È DIVERSO" - card attive in base allo scroll
/* ==========================================
   LEONARDO È DIVERSO – STACK MOBILE
   Card che sale, quella sopra va dietro
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);

  const cards = gsap.utils.toArray('[data-different-card]');
  if (!cards.length) return;

  const mm = gsap.matchMedia();
  let diffTriggers = [];

  const clearTriggers = () => {
    diffTriggers.forEach(t => t.kill());
    diffTriggers = [];
  };

  // --- GESTIONE STATI (ATTIVA + DIETRO) ---
  const setStates = (activeIndex) => {
    cards.forEach((c, i) => {
      c.classList.remove('is-active', 'is-behind');

      if (i === activeIndex) {
        // nuova card che entra → sopra
        c.classList.add('is-active');
      } else if (i === activeIndex - 1) {
        // card precedente va dietro e si rimpicciolisce
        c.classList.add('is-behind');
      }
    });
  };

  // --- DESKTOP ---
  mm.add("(min-width: 901px)", () => {
    clearTriggers();
    setStates(0);

    cards.forEach((card, index) => {
      const trig = ScrollTrigger.create({
        trigger: card,
        start: "top center",
        end: "bottom center",
        onEnter: () => setStates(index),
        onEnterBack: () => setStates(index)
      });
      diffTriggers.push(trig);

      // Hover mantiene l’effetto
      card.addEventListener('mouseenter', () => setStates(index));
    });

    return () => clearTriggers();
  });

  // --- MOBILE ---
  mm.add("(max-width: 900px)", () => {
    clearTriggers();
    setStates(0);

    cards.forEach((card, index) => {
      const trig = ScrollTrigger.create({
        trigger: card,
        start: "top top+=300",
        end: "bottom top+=200",
        onEnter: () => setStates(index),
        onEnterBack: () => setStates(index)
      });

      diffTriggers.push(trig);
    });

    return () => clearTriggers();
  });
});
// CONSULENZA – Stepper pin + linea + step attivi
// CONSULENZA – Stepper pin (tutte le viewport, scroll della pagina)
document.addEventListener('DOMContentLoaded', () => {
  const section = document.getElementById('consulenza-stepper-section');
  if (!section) return;

  const pin = section.querySelector('.consulenza-stepper-pin');
  const stepper = section.querySelector('[data-consulenza-stepper]');
  if (!pin || !stepper) return;

  const steps = Array.from(
    stepper.querySelectorAll('.consulenza-stepper-step')
  );
  const lineActive = stepper.querySelector('.consulenza-stepper-line-active');
  if (!steps.length || !lineActive) return;

  const headerOffset = 100;

  const update = () => {
    const rect = section.getBoundingClientRect();
    const scrollY = window.scrollY || window.pageYOffset;
    const sectionTop = scrollY + rect.top;
    const sectionHeight = section.offsetHeight;
    const pinHeight = pin.offsetHeight;

    const startPin = sectionTop - headerOffset;
    const endPin = sectionTop + sectionHeight - pinHeight - headerOffset;

    // blocco pinnato
    if (scrollY >= startPin && scrollY <= endPin) {
      pin.classList.add('is-fixed');
    } else {
      pin.classList.remove('is-fixed');
    }

    // progresso 0 → 1 lungo la sezione
    let progress;
    if (scrollY <= startPin) {
      progress = 0;
    } else if (scrollY >= endPin) {
      progress = 1;
    } else {
      progress = (scrollY - startPin) / (endPin - startPin);
    }

    // linea che si riempie
    lineActive.style.width = (progress * 100) + '%';

    // step che si accendono in sequenza
    const activeIndex = Math.min(
      steps.length - 1,
      Math.floor(progress * steps.length)
    );

    steps.forEach((step, index) => {
      step.classList.toggle('active', index <= activeIndex);
    });
  };

  // stato iniziale
  steps.forEach(step => step.classList.remove('active'));
  if (steps[0]) steps[0].classList.add('active');
  lineActive.style.width = '0%';

  update(); // prima chiamata

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
});
// ========== PAGE SLIDE TRANSITIONS TRA LE PAGINE ==========

(function () {
  const TRANSITION_DURATION = 450; // deve combaciare con il CSS (0.45s)

  // All'avvio: anima l'entrata della pagina
  document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const main = document.querySelector('main');
    if (!main) return;

    // Aggiungo la classe di entrata
    body.classList.add('page-transition-in');

    // Rimuovo la classe dopo l'animazione così non rimane "appiccicata"
    main.addEventListener(
      'animationend',
      (e) => {
        if (e.animationName === 'pageSlideInRight') {
          body.classList.remove('page-transition-in');
        }
      },
      { once: true }
    );
  });

  // Helper: capisce se il link è interno al tuo sito
  function isInternalLink(anchor) {
    if (!anchor || !anchor.href) return false;

    try {
      const url = new URL(anchor.href);
      if (url.origin !== window.location.origin) return false;

      // se è solo un salto interno (#sezione) → niente transizione
      if (url.pathname === window.location.pathname) {
        return false;
      }

      return true;
    } catch (e) {
      return false;
    }
  }

  // Intercetta i click su TUTTO il body e filtra solo i link giusti
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest('a');
    if (!anchor) return;

    const href = anchor.getAttribute('href');
    if (!href) return;

    // Lascia stare:
    // - link con # (scroll interno)
    // - target _blank
    // - click con CTRL / CMD / SHIFT (nuova scheda)
    if (href.startsWith('#')) return;
    if (anchor.target === '_blank') return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    if (!isInternalLink(anchor)) return;

    // Ok, è un link interno verso un'altra pagina → transizione
    event.preventDefault();

    const body = document.body;
    const url = anchor.href;

    body.classList.add('page-transition-out');

    // Aspetto la fine dell'animazione e poi navigo
    setTimeout(() => {
      window.location.href = url;
    }, TRANSITION_DURATION - 50); // leggermente prima della fine per feeling più snappy
  });
})();
// ======================================================
// HOME MOBILE – GSAP: PARALLAX, SFONDI, ENTRATE SEZIONI
// (solo sotto i 900px, desktop invariato)
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (!document.body.classList.contains('page-home')) return;

  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  mm.add("(max-width: 900px)", () => {
    // ---------- 1) GESTIONE TEMA DI SFONDO PER SEZIONE ----------
    const setTheme = (name) => {
      const existing = Array.from(document.body.classList).filter(c =>
        c.startsWith('mobile-theme-')
      );
      existing.forEach(c => document.body.classList.remove(c));
      if (name) {
        document.body.classList.add('mobile-theme-' + name);
      }
    };

    const themedSections = document.querySelectorAll('[data-mobile-theme]');
    themedSections.forEach((section) => {
      const themeName = section.dataset.mobileTheme;
      ScrollTrigger.create({
        trigger: section,
        start: 'top 65%',
        onEnter: () => setTheme(themeName),
        onEnterBack: () => setTheme(themeName),
      });
    });

    // tema iniziale
    setTheme('hero');

    // ---------- 2) HERO PARALLAX ----------
    const hero = document.querySelector('.hero');
    if (hero) {
      const heroText = hero.querySelector('.hero-text');
      const heroMedia = hero.querySelector('.hero-media');

      if (heroMedia) {
        gsap.to(heroMedia, {
          yPercent: 10,
          ease: 'none',
          scrollTrigger: {
            trigger: hero,
            start: 'top top',
            end: 'bottom top',
            scrub: true,
          },
        });
      }

      if (heroText) {
        gsap.from(heroText, {
          y: 24,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: hero,
            start: 'top 85%',
          },
        });
      }
    }

    // ---------- 3) TIMELINE: ENTRATA STEP ----------
// ---------- 3) TIMELINE: SOLO LA CARD ATTIVA È PIENA ----------
// STORYLINE / TIMELINE – mobile slider orizzontale con card attiva
const timelineEl = document.querySelector('[data-timeline]');

if (timelineEl) {
  const steps = Array.from(timelineEl.querySelectorAll('.timeline-step'));
  const activeLine = timelineEl.querySelector('.timeline-line-active');
  const stepsContainer = timelineEl.querySelector('.timeline-steps');

  if (!steps.length || !stepsContainer) {
    console.warn('Timeline: mancano step o container');
  } else {

    // attiva una card per indice e aggiorna eventuale linea
    const activateByIndex = (index) => {
      const clamped = Math.max(0, Math.min(index, steps.length - 1));
      steps.forEach((s, i) => {
        s.classList.toggle('is-active', i === clamped);
      });

      if (activeLine && steps.length > 1) {
        const ratio = clamped / (steps.length - 1 || 1);
        const percent = 10 + ratio * 80; // 10% -> 90%
        activeLine.style.height = percent + '%';
      }
    };

    // ----- MOBILE: slider orizzontale -----
    const setupMobileSlider = () => {
      const updateActiveFromScroll = () => {
        const rect = stepsContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;

        let bestIndex = 0;
        let bestDist = Infinity;

        steps.forEach((step, index) => {
          const r = step.getBoundingClientRect();
          const stepCenter = r.left + r.width / 2;
          const dist = Math.abs(stepCenter - centerX);
          if (dist < bestDist) {
            bestDist = dist;
            bestIndex = index;
          }
        });

        activateByIndex(bestIndex);
      };

      // aggiorna su scroll orizzontale del container
      stepsContainer.addEventListener('scroll', updateActiveFromScroll, { passive: true });
      window.addEventListener('resize', updateActiveFromScroll);

      // prima chiamata
      updateActiveFromScroll();
    };

    // ----- DESKTOP: comportamento originale con IntersectionObserver -----
    const setupDesktopTimeline = () => {
      if (!('IntersectionObserver' in window)) {
        // fallback: tutte attive e linea piena
        steps.forEach((s) => s.classList.add('is-active'));
        activateByIndex(steps.length - 1);
        return;
      }

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const step = entry.target;
            const index = steps.indexOf(step);
            if (index >= 0) {
              activateByIndex(index);
            }
          });
        },
        {
          root: null,
          threshold: 0.5,
        }
      );

      steps.forEach((step) => observer.observe(step));
    };

    // switch tra mobile e desktop
    const initTimelineMode = () => {
      if (window.innerWidth <= 900) {
        setupMobileSlider();
      } else {
        setupDesktopTimeline();
      }
    };

    initTimelineMode();

    window.addEventListener('resize', () => {
      // opzionale: se cambi spesso dimensione, potresti voler re-inizializzare
      // qui si potrebbe fare un debounce, ma su mobile di solito non serve
    });
  }
}

    // ---------- 4) PROGRAMMI: SOLLEVAMENTO CARD ----------
    const planCards = gsap.utils.toArray('.plan-card');
    planCards.forEach((card) => {
      gsap.from(card, {
        opacity: 0,
        y: 40,
        duration: 0.55,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
        },
      });

      gsap.to(card, {
        y: -6,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });


    // ---------- 6) FAQ: ENTRATE MORBIDE ----------
    const faqItems = gsap.utils.toArray('.faq-item');
    faqItems.forEach((item) => {
      gsap.from(item, {
        opacity: 0,
        y: 24,
        duration: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 95%',
        },
      });
    });
  });
});
/* ================================================
   PARALLAX TOUCH REFLECTION — PREMIUM ONLY
   ================================================ */
/* ================================================
   PARALLAX TOUCH REFLECTION — BASE + PREMIUM
   ================================================ */
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll("#programmi .plan-card");

  if (!cards.length) return;

  const updateReflection = (card, x, y) => {
    const rect = card.getBoundingClientRect();
    const mx = ((x - rect.left) / rect.width) * 100;
    const my = ((y - rect.top) / rect.height) * 100;
    card.style.setProperty("--mx", `${mx}%`);
    card.style.setProperty("--my", `${my}%`);
  };

  cards.forEach((card) => {
    // TOUCH MOVE
    card.addEventListener("touchmove", (e) => {
      const t = e.touches[0];
      updateReflection(card, t.clientX, t.clientY);
    });

    // MOUSE MOVE (utile per vedere l'effetto da desktop)
    card.addEventListener("mousemove", (e) => {
      updateReflection(card, e.clientX, e.clientY);
    });
  });
});


// COACHING BASE – toggle prezzo (Base vs Base + lezione)
document.addEventListener('DOMContentLoaded', () => {
  // solo nella pagina Coaching Base
  if (!document.body.classList.contains('page-program-base')) return;

  const priceCard = document.querySelector('.program-price-card');
  if (!priceCard) return;

  const buttons = priceCard.querySelectorAll('.program-price-toggle-btn');
  const panels = priceCard.querySelectorAll('.program-price-panel');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.priceTarget;
      if (!target) return;

      // aggiorna bottoni
      buttons.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      // mostra solo il pannello giusto
      panels.forEach(panel => {
        const panelName = panel.dataset.pricePanel;
        panel.classList.toggle('is-active', panelName === target);
      });
    });
  });
});
