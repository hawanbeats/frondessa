// assets/js/auth.js
(function () {
  // 🔧 Google Sheets (Users sekmesi) için Apps Script Web App URL'in
  const USERS_ENDPOINT = "https://script.google.com/macros/s/AKfycbzhYDC48wskMMglqKKDkGdLBr9IPbquchRNx4c3USrtLsYryiDLBMIAqdKnpz_ZfYwF/exec"; // TODO: kendi URL'inle değiştir

  const modalEl = document.getElementById('accountModal');
  const navUserBtn = document.getElementById('navUserBtn');

  // Mini state helpers
  const LS_USER_KEY = 'frondessa_user';
  function saveUser(u){ localStorage.setItem(LS_USER_KEY, JSON.stringify(u)); }
  function getUser(){ try { return JSON.parse(localStorage.getItem(LS_USER_KEY) || 'null'); } catch { return null; } }
  function clearUser(){ localStorage.removeItem(LS_USER_KEY); }

  // Google Sheets'e kullanıcı kaydı gönder (Register + Google)
  async function sendRegistration({ name, email, provider }) {
    try {
      const body = {
        name: name || "",
        email,
        provider,                 // "password" | "google"
        source: location.pathname,
        ua: navigator.userAgent || ""
      };

      // Yanıtı okumaya ihtiyacın yoksa mode:'no-cors' da kullanabilirsin.
      await fetch(WEB_APP_URL, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ type: "user", name, email, provider, source: location.pathname, ua: navigator.userAgent })
});

    } catch (err) {
      console.error("sendRegistration error:", err);
    }
  }

  // Show logged-in summary instead of forms
  function renderAccountView(){
    const user = getUser();
    const title = document.getElementById('accountModalTitle');
    const tabs = document.getElementById('authTabs');
    const signinPane = document.getElementById('signin-pane');
    const signupPane = document.getElementById('signup-pane');
    const summary = document.getElementById('accountSummary');

    if (user){
      title.textContent = 'Account';
      tabs.classList.add('d-none');
      signinPane.classList.add('d-none');
      signupPane.classList.add('d-none');
      summary.classList.remove('d-none');

      const name = user.name || (user.email ? user.email.split('@')[0] : 'User');
      const initials = name.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

      document.getElementById('accountAvatar').textContent = initials;
      document.getElementById('accountName').textContent = name;
      document.getElementById('accountEmail').textContent = user.email || '';
    } else {
      title.textContent = 'Sign in';
      tabs.classList.remove('d-none');
      signinPane.classList.remove('d-none');
      signupPane.classList.remove('d-none'); // tab-control already handles display
      summary.classList.add('d-none');
    }
  }

  // Open modal
  if (navUserBtn){
    navUserBtn.addEventListener('click', () => {
      const m = new bootstrap.Modal(modalEl);
      renderAccountView();
      m.show();
    });
  }

  // Email/password Sign in (demo)
  const signInForm = document.getElementById('signInForm');
  if (signInForm){
    signInForm.addEventListener('submit', () => {
      const email = document.getElementById('signinEmail').value.trim();
      const pass = document.getElementById('signinPassword').value;
      if (!email || pass.length < 1) return alert('Invalid credentials');

      // In real app, call backend here. For demo, accept any.
      saveUser({ email, name: email.split('@')[0] });
      renderAccountView();
    });
  }

  // Register (demo)  ➜  Google Sheets'e de yaz
  const signUpForm = document.getElementById('signUpForm');
  if (signUpForm){
    signUpForm.addEventListener('submit', async () => {
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const pass = document.getElementById('signupPassword').value;

      if (!name || !email || pass.length < 6) {
        return alert('Please fill all fields');
      }

      // In real app, call backend to create account. For demo, just store.
      saveUser({ name, email });

      // ✅ Sheets: kaydı gönder
      await sendRegistration({ name, email, provider: 'password' });

      renderAccountView();
    });
  }

  // Logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn){
    logoutBtn.addEventListener('click', () => {
      clearUser();
      renderAccountView();
    });
  }

  // GOOGLE: GIS callback (popup)
  // HTML tarafında data-callback="handleGoogleCredential" olarak çağrılır
  window.handleGoogleCredential = async function (response){
    try {
      const payload = parseJwt(response.credential);
      // payload: { email, name, picture, ... }
      const name  = payload.name || (payload.email ? payload.email.split('@')[0] : 'User');
      const email = payload.email;

      // Demo oturum
      saveUser({ email, name, picture: payload.picture });

      // ✅ Sheets: Google ile kayıt/giriş olan kullanıcıyı da kaydet
      await sendRegistration({ name, email, provider: 'google' });

      renderAccountView();
    } catch (e){
      console.error(e);
      alert('Google sign-in failed.');
    }
  };

  // Simple JWT parser (no verification; for demo)
  function parseJwt (token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  }

})();
