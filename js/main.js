/* ==========================================================
   Super Stationery - main.js
   Uses: jQuery (filter, fade-in), the Constraint Validation API
   and localStorage (JavaScript APIs) and fetch() (a web API).
   ========================================================== */
"use strict";

/* ---------- 1. Cookie notice (JavaScript API: localStorage) ---------- */
function storageGet(k){ try { return localStorage.getItem(k); } catch(e){ return null; } }
function storageSet(k,v){ try { localStorage.setItem(k,v); } catch(e){} }

function showCookieBanner(){
  if (storageGet("cookieChoice") || document.getElementById("cookie-banner")) return;
  var banner = document.createElement("div");
  banner.id = "cookie-banner";
  banner.setAttribute("role","region");
  banner.setAttribute("aria-label","Cookie notice");
  banner.innerHTML = '<div class="container d-flex flex-wrap align-items-center gap-3">' +
    '<p class="mb-0 flex-grow-1">We only use essential storage to remember your choices. See our <a href="contact.html#cookies">cookie notice</a>.</p>' +
    '<button type="button" class="btn btn-light btn-sm" id="cookie-ok">Accept</button></div>';
  document.body.appendChild(banner);
  document.getElementById("cookie-ok").addEventListener("click", function(){
    storageSet("cookieChoice","accepted"); banner.remove();
  });
}

/* ---------- 2. Form validation (Constraint Validation API) ---------- */
function validate(form){
  var ok = form.checkValidity();
  form.classList.add("was-validated");
  // Radio groups: mark the fieldset so its message shows
  form.querySelectorAll("fieldset").forEach(function(fs){
    var bad = fs.querySelector("input:invalid") !== null;
    fs.classList.toggle("was-invalid", bad);
  });
  if (!ok){
    var first = form.querySelector(":invalid");
    if (first) first.focus();          // helps keyboard and screen-reader users
  }
  return ok;
}
function escapeHtml(s){ var d=document.createElement("div"); d.textContent=s; return d.innerHTML; }

function setupBooking(){
  var form = document.getElementById("booking-form");
  if (!form) return;
  form.addEventListener("submit", function(e){
    e.preventDefault();
    if (!validate(form)) return;
    var d = new FormData(form);
    var booking = { name:d.get("name"), email:d.get("email"), event:d.get("event"), tickets:d.get("tickets") };
    storageSet("lastBooking", JSON.stringify(booking));   // saved on this device only
    var box = document.getElementById("booking-confirmation");
    box.innerHTML = "<strong>Thank you, " + escapeHtml(booking.name) + "!</strong> You have requested " +
      escapeHtml(booking.tickets) + " place(s) for <em>" + escapeHtml(booking.event) +
      "</em>. A confirmation will be sent to " + escapeHtml(booking.email) + ".";
    box.hidden = false; box.focus();
    form.reset(); form.classList.remove("was-validated");
    form.querySelectorAll("fieldset").forEach(function(f){ f.classList.remove("was-invalid"); });
  });
}

function setupContact(){
  var form = document.getElementById("contact-form");
  if (!form) return;
  form.addEventListener("submit", function(e){
    e.preventDefault();
    if (!validate(form)) return;
    var box = document.getElementById("contact-confirmation");
    box.textContent = "Thanks " + form.name.value + ", your message has been received. We will reply by email.";
    box.hidden = false; box.focus();
    form.reset(); form.classList.remove("was-validated");
  });
}

/* ---------- 3. Web API: live Manchester weather (Open-Meteo, no key needed) ---------- */
function loadWeather(){
  var el = document.getElementById("weather");
  if (!el || !window.fetch) return;
  fetch("https://api.open-meteo.com/v1/forecast?latitude=53.4839&longitude=-2.2446&current=temperature_2m,wind_speed_10m")
    .then(function(r){ if(!r.ok) throw new Error("bad response"); return r.json(); })
    .then(function(j){
      el.textContent = Math.round(j.current.temperature_2m) + "\u00B0C, wind " + Math.round(j.current.wind_speed_10m) + " km/h. Dress for your visit!";
    })
    .catch(function(){ el.textContent = "Weather is unavailable right now."; });
}

/* ---------- 4. jQuery: fade-in cards and product filter ---------- */
$(function(){
  showCookieBanner();
  setupBooking(); setupContact(); loadWeather();

  $("#reset-cookies").on("click", function(){
    try { localStorage.removeItem("cookieChoice"); } catch(e){}
    showCookieBanner();
  });

  // Fade product cards in (skipped for users who prefer reduced motion)
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce) $(".product").hide().each(function(i){ $(this).delay(80*i).fadeIn(400); });

  // Category filter
  $("[data-filter]").on("click", function(){
    var f = $(this).data("filter");
    $("[data-filter]").removeClass("active").attr("aria-pressed","false");
    $(this).addClass("active").attr("aria-pressed","true");
    $(".product").each(function(){
      var show = f === "all" || $(this).data("category") === f;
      $(this).toggleClass("hidden-by-filter", !show);
    });
    $("#filter-status").text($(".product:not(.hidden-by-filter)").length + " products shown");
  });
});
