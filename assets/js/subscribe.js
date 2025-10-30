// BURAYA Apps Script Web App URL'İNİ YAPIŞTIR
const ENDPOINT = "https://script.google.com/macros/s/AKfycbzhYDC48wskMMglqKKDkGdLBr9IPbquchRNx4c3USrtLsYryiDLBMIAqdKnpz_ZfYwF/exec";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("subscribeForm");
  const emailInput = document.getElementById("subscribeEmail");
  const btn = document.getElementById("subscribeBtn");
  const trap = document.getElementById("subscribeTrap");

  function toast(m) { alert(m); }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();

    if (trap.value) return; // bot engelle

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return toast("Lütfen geçerli bir e-posta girin.");
    }

    btn.disabled = true;

    try {
      await fetch(WEB_APP_URL, {
  method: "POST",
  // mode: "no-cors", // CORS derdi varsa aç
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ type: "subscribe", email })
});

      emailInput.value = "";
      toast("You have successfully subscribed!");
    }
    catch (err) {
      console.error(err);
      toast("There was an error. Please try again later.");
    }
    finally {
      btn.disabled = false;
    }
  });
});
