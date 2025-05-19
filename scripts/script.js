document.addEventListener("DOMContentLoaded", () => {
  fetchQuotes();
  //fetchBlogPosts();
  //setupUIEvents();
  });
  const textElement = document.getElementById('typed-text');
  const cursorElement = document.querySelector('.blinking-cursor');

  let texts = [];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  const typingSpeed = 70;
  const backspacingSpeed = 40;
  const pauseBetweenStrings = 1200;

  window.addEventListener("load", () => {
  document.getElementById("preloader").classList.add("fade-out");
  });

// =====================
// Typing Quotes Section
// =====================

// Fetch and display quotes with typing animation
function fetchQuotes() {
  const textElement = document.getElementById('typed-text');
  const cursorElement = document.querySelector('.blinking-cursor');

  // Default quotes if fetch fails
  let texts = [
    "Even the smallest flame is enough to pierce the deepest night.",
    "Hope is not naive. It is the tether of the soul.",
    "Faith is the bird that feels the light when the dawn is still dark."
  ];
  let textIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typingSpeed = 70;
  const backspacingSpeed = 40;
  const pauseBetweenStrings = 1200;

  
  // Try to fetch quotes from JSON file
  fetch("data/quotes.json")
    .then((res) => res.json())
    .then((json) => {
      if (Array.isArray(json) && json.length > 0) {
        texts = json;
      }
    })
    .catch(() => {
      console.warn("Falling back to default quotes array.");
    })
    .finally(() => {
      typeWriter();
    });
  
  // Typing effect function
  function typeWriter() {
    const currentText = texts[textIndex];

    if (isDeleting) {
      textElement.textContent = currentText.substring(0, charIndex - 1);
      charIndex--;
      if (charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        setTimeout(typeWriter, pauseBetweenStrings);
      } else {
        setTimeout(typeWriter, backspacingSpeed);
      }
    } else {
      textElement.textContent = currentText.substring(0, charIndex + 1);
      charIndex++;
      if (charIndex === currentText.length) {
        isDeleting = true;
        setTimeout(typeWriter, pauseBetweenStrings);
      } else {
        setTimeout(typeWriter, typingSpeed);
      }
    }
  }
}

// =====================
// UI Setup Section
// =====================

document.addEventListener("DOMContentLoaded", () => {
  fetchQuotes(); // Start typing quotes

  // Theme Toggle
  const themeToggle = document.getElementById("theme-toggle");
  const html = document.documentElement;
  themeToggle.addEventListener("click", () => {
    const currentTheme = html.getAttribute("data-theme");
    html.setAttribute("data-theme", currentTheme === "light" ? "dark" : "light");
  });

  // Navigation Menu Toggle
  const menuToggle = document.getElementById("menu-toggle");
  const navMenu = document.getElementById("nav-menu");
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("open");
  });

  // ==========================
  // Blog Posts & Modal Section
  // ==========================

  // Modal Elements (using classes for multiple modals)
  const modal = document.getElementById("post-modal");
  const modalTitle = document.querySelector(".modal-title");
  const modalBody = document.querySelector(".modal-body");
  const closeModalBtn = document.querySelector(".close-modal");

  // Modal close logic
  closeModalBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
    modal.setAttribute("aria-hidden", "true");
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.classList.contains("hidden")) {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }
  });
  modal.addEventListener("click", (e) => {
    if (e.target.id === "post-modal") {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");
    }
  });

  // Fetch and display blog posts
  fetch('data/posts.json')
    .then(response => response.json())
    .then(posts => {
      const grid = document.getElementById("blog-grid");
      posts.forEach((post, index) => {
        const card = document.createElement("section");
        card.className = "card";
        card.innerHTML = `
          <h2 class="Intro">${post.title}</h2>
          <p class="Findings">${post.summary}</p>
          <a href="#" class="read-more" data-post="${index}">Read More</a>
        `;
        grid.appendChild(card);
      });

      // Open modal with post content
      document.querySelectorAll(".read-more").forEach(link => {
        link.addEventListener("click", e => {
          e.preventDefault();
          const i = +link.dataset.post;
          modalTitle.textContent = posts[i].title;
          modalBody.textContent = posts[i].content;
          modal.classList.remove("hidden");
          modal.setAttribute("aria-hidden", "false");
        });
      });
    })
    .catch(err => {
      console.error("Failed to load blog posts:", err);
    });

  // ==========================
  // Newsletter Popup Section
  // ==========================

  const newsletterForm = document.getElementById("newsletter-form");
  const message = document.getElementById("newsletter-message");
  const popup = document.getElementById("newsletter-popup");
  const closeBtn = document.querySelector(".close-newsletter");
  let popupTriggered = false;

  // Centralized newsletter popup logic
  function showNewsletterPopup() {
    if (!localStorage.getItem("newsletter_shown")) {
      popup.classList.add("show");
      popup.classList.remove("hidden");
      localStorage.setItem("newsletter_shown", "true");
    }
  }

  // Show popup after 5 seconds if not already shown
  if (!localStorage.getItem("newsletter_shown")) {
    setTimeout(showNewsletterPopup, 5000);
  }

  // Show popup on exit intent (mouse leaves window at top)
  document.addEventListener("mouseleave", (e) => {
    if (!popupTriggered && e.clientY < 10) {
      showNewsletterPopup();
      popupTriggered = true;
    }
  });

  // Close popup on button click
  closeBtn.addEventListener("click", () => {
    popup.classList.remove("show");
    popup.classList.add("hidden");
  });

  // Newsletter form submission
  newsletterForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = newsletterForm.name.value.trim();
    const email = newsletterForm.email.value.trim();
    const honeypot = newsletterForm.honeypot.value;

    // Spam check — if honeypot is filled, silently abort
    if (honeypot) return;

    try {
      await fetch("https://script.google.com/macros/s/AKfycbzyNihNen5cexgeCTcKv776AoBjTPuFAYhH4c02XwPV6xyH6YAsziX7RdDszBCE7jkukg/exec", {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: `email=${encodeURIComponent(email)}&name=${encodeURIComponent(name)}`
      });
      message.textContent = `✅ Thanks ${name}, you're subscribed!`;
      message.style.color = "green";
      newsletterForm.reset();
    } catch (err) {
      message.textContent = "❌ Subscription failed. Please try again.";
      message.style.color = "red";
    }
  });

  // ==========================
  // Miscellaneous UI Effects
  // ==========================

  // Smooth Scroll Utility
  window.smoothScroll = (target, duration) => {
    const targetElement = document.querySelector(target);
    const targetPosition = targetElement.getBoundingClientRect().top;
    const startPosition = window.pageYOffset;
    const startTime = performance.now();

    const animation = currentTime => {
      const timeElapsed = currentTime - startTime;
      const progress = Math.min(timeElapsed / duration, 1);
      window.scrollTo(0, startPosition + targetPosition * progress);
      if (progress < 1) requestAnimationFrame(animation);
    };

    requestAnimationFrame(animation);
  };

  // Parallax background effect on mouse move
  document.addEventListener("mousemove", (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 10;
    const y = (e.clientY / window.innerHeight - 0.5) * 10;
    document.body.style.backgroundPosition = `${50 + x}% ${50 + y}%`;
  });

  // Intersection Observer for hero quote animation
  const typedQuote = document.getElementById("typed-quote");
  if (typedQuote) {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          typedQuote.classList.add("reveal");
        }
      },
      { threshold: 0.3 }
    );
    heroObserver.observe(typedQuote);
  }

  // Fetch and display a random quote card
  fetch("data/quotes.json")
    .then((res) => res.json())
    .then((quotes) => {
      const quoteGrid = document.getElementById("quote-grid");
      quotes.sort(() => 0.5 - Math.random()); // Shuffle
      const selectedQuotes = quotes.slice(0, 1); // Only one card
      selectedQuotes.forEach((item, index) => {
        const card = document.createElement("section");
        card.className = "card";
        card.innerHTML = `
          <h2 class="Intro">${item.title}</h2>
          <p class="Findings">${item.quote}</p>
          <a href="#" class="read-more" data-post="${index}">Read More</a>
        `;
        quoteGrid.appendChild(card);
      });
    })
    .catch((err) => console.error("Failed to load quotes:", err));
});
