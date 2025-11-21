/* ulasan.js
   - Menangani submit form ulasan (client-side)
   - Menyimpan ulasan ke localStorage
   - Menampilkan ulasan di .ulasan-list
   - (Optional) Upload ke server jika UPLOAD_URL diisi
   - Mendukung input file <input type="file" name="foto">
*/

(function () {
  'use strict';

  const STORAGE_KEY = 'ulasanData_v1';
  const UPLOAD_URL = null; // <-- jika mau upload ke backend, isi URL endpoint di sini

  // --- helpers ---
  function escapeHtml(str = '') {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatDateISO(date) {
    const d = new Date(date);
    const options = { day: '2-digit', month: 'short', year: 'numeric' };
    return d.toLocaleDateString('id-ID', options);
  }

  function fileToDataUrl(file, maxSizeMB = 2) {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return reject(new Error('File terlalu besar. Maks ' + maxSizeMB + 'MB.'));
      }
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Gagal membaca file.'));
      reader.readAsDataURL(file);
    });
  }

  // optional upload function (POST multipart/form-data)
  async function uploadToServer(data) {
    if (!UPLOAD_URL) return { ok: true, skipped: true };
    try {
      const formData = new FormData();
      formData.append('name', data.name || '');
      formData.append('comment', data.comment || '');
      formData.append('rating', data.rating || '');
      formData.append('dateISO', data.dateISO || '');
      if (data.imageFile) formData.append('foto', data.imageFile);

      const resp = await fetch(UPLOAD_URL, { method: 'POST', body: formData });
      const json = await resp.json().catch(() => null);
      return { ok: resp.ok, response: json || null };
    } catch (err) {
      return { ok: false, error: err.message || String(err) };
    }
  }

  // --- storage ---
  function loadFromStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw);
    } catch (e) {
      console.error('Gagal membaca storage', e);
      return [];
    }
  }

  function saveToStorage(arr) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.error('Gagal menyimpan ke storage', e);
    }
  }

  // --- DOM / rendering ---
  const formSelector = '.form-ulasan';
  const listSelector = '.ulasan-list';
  const form = document.querySelector(formSelector);
  const list = document.querySelector(listSelector);

  if (!form || !list) {
    console.warn('Form ulasan atau .ulasan-list tidak ditemukan. Pastikan selector .form-ulasan dan .ulasan-list ada di halaman.');
    return;
  }

  function buildStars(rating) {
    const r = Math.max(1, Math.min(5, Number(rating) || 5));
    return '★★★★★'.slice(0, r) + (r < 5 ? '☆'.repeat(5 - r) : '');
  }

  function renderCard(data, insertAtTop = true) {
    const card = document.createElement('article');
    card.className = 'ulasan-card';
    card.setAttribute('role', 'article');

    const initials = escapeHtml((data.name || 'U').charAt(0).toUpperCase());
    const stars = escapeHtml(buildStars(data.rating));
    const comment = escapeHtml(data.comment || '');
    const name = escapeHtml(data.name || 'Anonim');
    const dateISO = escapeHtml(data.dateISO || new Date().toISOString());
    const dateText = escapeHtml(formatDateISO(dateISO));

    let imgHtml = '';
    if (data.imageDataUrl) {
      // Use a wrapper to avoid layout shift
      imgHtml = `<div style="margin-top:8px;"><img src="${escapeHtml(data.imageDataUrl)}" alt="foto ulasan" style="max-width:140px;border-radius:8px;display:block;"></div>`;
    }

    card.innerHTML = `
      <div class="profile">
        <div class="avatar" aria-hidden="true">${initials}</div>
        <div>
          <h4>${name}</h4>
          <div class="stars" aria-hidden="true">${stars}</div>
        </div>
      </div>

      <p class="comment">${comment}</p>
      <time class="date" datetime="${dateISO}">${dateText}</time>
      ${imgHtml}
    `;

    if (insertAtTop) {
      list.insertBefore(card, list.firstChild);
    } else {
      list.appendChild(card);
    }
  }

  function renderAll() {
    list.innerHTML = '';
    const items = loadFromStorage();
    // show newest first
    items.slice().reverse().forEach(item => renderCard(item, false));
  }

  // --- form submit handler ---
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    // form field names expected: nama, komentar, rating
    const name = (fd.get('nama') || fd.get('name') || '').toString().trim();
    const comment = (fd.get('komentar') || fd.get('comment') || '').toString().trim();
    const rating = (fd.get('rating') || '').toString().trim();

    // file input named 'foto' is optional
    const fileInput = form.querySelector('input[type="file"][name="foto"]');
    const fotoFile = fileInput ? (fileInput.files[0] || null) : null;

    // basic validation
    if (!name) { alert('Masukkan nama.'); return; }
    if (!comment) { alert('Tulis komentar terlebih dahulu.'); return; }
    if (!rating) { alert('Pilih rating.'); return; }

    const submitBtn = form.querySelector('button[type="submit"], button');
    const origBtnText = submitBtn ? submitBtn.innerText : null;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerText = 'Mengirim…';
    }

    try {
      let imageDataUrl = null;
      if (fotoFile) {
        imageDataUrl = await fileToDataUrl(fotoFile, 2).catch(err => { throw err; });
      }

      const nowISO = new Date().toISOString();
      const item = {
        id: 'u' + Date.now(),
        name,
        comment,
        rating,
        dateISO: nowISO,
        imageDataUrl: imageDataUrl || null
      };

      // optimistic render
      renderCard(item, true);

      // save to localStorage
      const arr = loadFromStorage();
      arr.push({
        id: item.id,
        name: item.name,
        comment: item.comment,
        rating: item.rating,
        dateISO: item.dateISO,
        imageDataUrl: item.imageDataUrl || null
      });
      saveToStorage(arr);

      // optional: upload to server
      if (UPLOAD_URL) {
        const result = await uploadToServer({
          name: item.name,
          comment: item.comment,
          rating: item.rating,
          dateISO: item.dateISO,
          imageFile: fotoFile || null
        });
        if (!result.ok) {
          console.warn('Upload server gagal', result);
          alert('Ulasan tersimpan lokal tapi gagal di-upload ke server.');
        }
      }

      // success feedback
      if (submitBtn) {
        submitBtn.innerText = 'Terkirim ✓';
        setTimeout(() => {
          if (submitBtn) submitBtn.innerText = origBtnText;
        }, 1300);
      }

      // reset form
      form.reset();

    } catch (err) {
      console.error('Gagal mengirim ulasan:', err);
      alert('Gagal mengirim ulasan: ' + (err.message || err));
      // optionally remove optimistic card if desired
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
      }
    }
  });

  // init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderAll);
  } else {
    renderAll();
  }

  // optional: expose a simple API for debugging from console
  window.__ulasan = {
    clearStorage: () => { localStorage.removeItem(STORAGE_KEY); renderAll(); },
    getAll: () => loadFromStorage()
  };

})();
