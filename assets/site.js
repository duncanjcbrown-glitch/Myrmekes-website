(function () {
  "use strict";

  // Sticky header: add a subtle border/shadow once the page is scrolled.
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) header.classList.add("is-stuck");
      else header.classList.remove("is-stuck");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Mobile nav toggle.
  var navToggle = document.querySelector(".nav-toggle");
  var siteNav = document.getElementById("site-nav");
  if (navToggle && siteNav) {
    var setNavOpen = function (open) {
      siteNav.classList.toggle("open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
      navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    navToggle.addEventListener("click", function () {
      setNavOpen(!siteNav.classList.contains("open"));
    });
    siteNav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        setNavOpen(false);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && siteNav.classList.contains("open")) {
        setNavOpen(false);
        navToggle.focus();
      }
    });
  }

  // Mark the current page in the nav.
  var here = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  document.querySelectorAll(".site-nav a").forEach(function (a) {
    var href = (a.getAttribute("href") || "").toLowerCase();
    if (href === here && !a.classList.contains("btn")) a.setAttribute("aria-current", "page");
  });

  // Scroll-reveal: fade/slide in elements with class "reveal" as they enter the
  // viewport. JS arms the hidden state first, so if this script never runs the
  // content stays visible (no blank page). A safety timer reveals anything the
  // observer hasn't caught (e.g. very tall sections, or observer never firing).
  var revealTargets = document.querySelectorAll(".reveal");
  if (revealTargets.length && "IntersectionObserver" in window) {
    var reveal = function (el) { el.classList.add("is-visible"); };
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealTargets.forEach(function (el) {
      el.classList.add("reveal-armed");
      observer.observe(el);
    });
    // Failsafe: never leave content hidden.
    window.addEventListener("load", function () {
      setTimeout(function () { revealTargets.forEach(reveal); }, 1200);
    });
  }

  // Respect reduced-motion preferences: keep the branded video poster visible
  // without forcing animation for visitors who have asked for less motion.
  var heroVideo = document.querySelector(".hero-video");
  if (heroVideo && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    heroVideo.removeAttribute("autoplay");
    heroVideo.pause();
  }

  // "/" keyboard shortcut: focus the page's search input, if it has one.
  document.addEventListener("keydown", function (e) {
    if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return;
    var active = document.activeElement;
    var tag = active && active.tagName ? active.tagName.toLowerCase() : "";
    if (tag === "input" || tag === "textarea") return;
    var searchInput = document.querySelector("[data-search-input]");
    if (searchInput) {
      e.preventDefault();
      searchInput.focus();
    }
  });

  // Contact page: prefill the mailto subject from a ?tech= URL param, if present.
  var mailtoLinks = document.querySelectorAll('a[href^="mailto:info@myrmekes.co.uk"]');
  if (mailtoLinks.length) {
    var params = new URLSearchParams(window.location.search);
    var tech = params.get("tech");
    if (tech) {
      var subject = "Support enquiry: " + tech;
      mailtoLinks.forEach(function (link) {
        link.href = "mailto:info@myrmekes.co.uk?subject=" + encodeURIComponent(subject);
      });
      var banner = document.querySelector("[data-tech-banner]");
      if (banner) {
        banner.textContent = "Asking about \"" + tech + "\" — mention it and we'll get straight into it.";
        banner.hidden = false;
      }
    }
  }

  // Call-request form: timestamp submissions for basic bot detection, preserve
  // useful page context, and display the server-confirmed result after redirect.
  var callForm = document.getElementById("call-form");
  if (callForm) {
    var formParams = new URLSearchParams(window.location.search);
    var startedInput = callForm.querySelector("[data-form-started]");
    var contextInput = callForm.querySelector("[data-form-context]");
    if (startedInput) startedInput.value = String(Date.now());
    if (contextInput) contextInput.value = (formParams.get("tech") || "").slice(0, 160);

    var formStatus = document.getElementById("form-status");
    if (formStatus && formParams.get("sent") === "1") {
      formStatus.classList.add("form-status--success");
      formStatus.textContent = "Thank you — your enquiry has been sent to Myrmekes. We'll respond as soon as we can.";
      formStatus.hidden = false;
      formStatus.focus();
    } else if (formStatus && formParams.has("error")) {
      formStatus.classList.add("form-status--error");
      formStatus.textContent = formParams.get("error") === "validation"
        ? "Please check the required fields and try again."
        : "We couldn't send that enquiry. Please email info@myrmekes.co.uk or call 07881 064209.";
      formStatus.hidden = false;
      formStatus.focus();
    }
  }
})();
