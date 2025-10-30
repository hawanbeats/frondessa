(function () {
  function norm(s) {
    return (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }
  function scoreItem(item, term) {
    const t = norm(item.title), s = norm(item.snippet), q = norm(term);
    if (!q) return 0;
    let score = 0;
    if (t.includes(q)) score += 5;
    if (s.includes(q)) score += 2;
    if (t.startsWith(q)) score += 3;
    return score;
  }
  function renderResults(list) {
    const box = ensureResultsContainer();
    if (!box) return;
    if (!list.length) {
      box.innerHTML = '<div class="p-3 text-muted">No result(s) found. </div>';
      return;
    }
    box.innerHTML = list.map(it => `
      <a class="list-group-item list-group-item-action d-flex align-items-center" href="${it.url}">
        ${it.image ? `<img src="${it.image}" class="me-3" style="width:56px;height:56px;object-fit:cover;">` : ""}
        <div>
          <div class="fw-semibold">${it.title}</div>
          ${it.snippet ? `<small class="text-muted">${it.snippet}</small>` : ""}
        </div>
      </a>
    `).join("");
  }
  function doSearch(q) {
    const data = (window.SEARCH_INDEX || [])
      .map(it => ({ ...it, _score: scoreItem(it, q) }))
      .filter(it => it._score > 0)
      .sort((a,b) => b._score - a._score)
      .slice(0, 20);
    renderResults(data);
  }

  // Eğer temanın modali (#templatemo_search) varsa onu kullan
  function ensureResultsContainer() {
    let container = null;
    let modalEl = document.getElementById("templatemo_search");
    if (modalEl) {
      // Temanın modal yapısı değişken olabilir; modal-body yoksa modalEl'i kullan
      const body = modalEl.querySelector(".modal-body") || modalEl;
      container = body.querySelector("#siteSearchResults");
      if (!container) {
        container = document.createElement("div");
        container.id = "siteSearchResults";
        container.className = "list-group mt-3";
        body.appendChild(container);
      }
      return container;
    }
    // Tema modalı yoksa bizim modalı oluştur
    modalEl = document.getElementById("searchModal");
    if (!modalEl) {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
<div class="modal fade" id="searchModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog modal-lg modal-dialog-centered">
    <div class="modal-content bg-white">
      <div class="modal-header">
        <h5 class="modal-title">Site Search</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <form id="siteSearchForm" class="input-group mb-3" onsubmit="return false;">
          <input type="text" id="siteSearchInput" class="form-control" placeholder="Search for products, pages or content...">
          <button class="btn btn-dark" type="submit">Search</button>
        </form>
        <div id="siteSearchResults" class="list-group"></div>
      </div>
    </div>
  </div>
</div>`;
      document.body.appendChild(wrap.firstElementChild);
    }
    return document.getElementById("siteSearchResults");
  }

  function getSearchInput() {
    // Önce temanın modalındaki inputu bulmaya çalış
    const themeModal = document.getElementById("templatemo_search");
    if (themeModal) {
      // Temada genelde bir input var; yoksa biz ekleyelim
      let input = themeModal.querySelector("#siteSearchInput");
      if (!input) {
        input = themeModal.querySelector("input[type='text'], input[type='search']");
        if (input) input.id = "siteSearchInput";
      }
      return input;
    }
    // Bizim modal için
    return document.getElementById("siteSearchInput");
  }

  function openModalIfNeeded(prefill) {
    const themeModal = document.getElementById("templatemo_search");
    if (themeModal) {
      // Temanın kendi triggerı var; sadece inputu doldur, sonuçları render et
      const input = getSearchInput();
      if (input) {
        input.value = prefill || input.value;
        doSearch(input.value.trim());
        input.focus();
      }
      return;
    }
    // Tema modalı yoksa bizimkini göster
    const modalEl = document.getElementById("searchModal");
    const input = getSearchInput();
    if (modalEl) {
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
      setTimeout(() => { if (prefill && input) input.value = prefill; input && input.focus(); }, 200);
    }
  }

  function wireUI() {
    // Form submit: hem tema modalında hem bizim modalda aynı kimliği kullanıyoruz
    document.addEventListener("submit", function(e){
      const form = e.target.closest("#siteSearchForm");
      if (!form) return;
      e.preventDefault();
      const input = getSearchInput();
      if (input) doSearch(input.value.trim());
    });

    // Mobil arama alanında Enter ile aç
    const mobileInput = document.getElementById("inputMobileSearch");
    if (mobileInput) {
      mobileInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
          e.preventDefault();
          openModalIfNeeded(mobileInput.value);
        }
      });
    }

    // ÖNEMLİ: Artık .fa-search gibi ikonlara ekstra click handler eklemiyoruz.
    // Tema kendi modalını açsın; biz sadece içeride sonuç kutusunu ve submit davranışını yönetiyoruz.

    // Tema modalı açılsa bile sonuç kutusu yoksa ekleyelim
    ensureResultsContainer();

    // Tema modalındaki inputu 'siteSearchInput' kimliğine bağla ki submit yakalansın
    const input = getSearchInput();
    if (input) {
      // Temada ayrı bir form varsa id verelim
      let form = input.closest("form");
      if (form) form.id = "siteSearchForm";
    }
  }

  document.addEventListener("DOMContentLoaded", wireUI);
})();
