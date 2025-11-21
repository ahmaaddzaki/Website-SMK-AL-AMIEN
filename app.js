// app.js - vanilla JS
document.addEventListener('DOMContentLoaded', () => {
  // DATA: contoh produk (ubah/expand sesuai kebutuhan)
  const products = [
    {
      id: 'p001',
      name: 'Desktop Gaming Intel Gen 12 Core i5',
      category: 'Desktop',
      price: 8200000,
      img: './gambar/pc3.png', // ganti dengan gambar riil
      specs: {
        CPU: 'Intel Gen 12 Core I5',
        GPU: 'NVIDIA GTX 1660 Super',
        RAM: '16GB DDR4',
        Storage: '512GB NVMe SSD',
        PSU: '550W Bronze',
        OS: 'Windows 11 Pro'
      }
    },
    {
      id: 'p002',
      name: 'Lenovo Laptop LOQ 15IAX9I',
      category: 'Laptop',
      price: 11999900,
      img: './gambar/la2.png',
      specs: {
        CPU: 'Intel Core i5 12450HX',
        GPU: 'NVIDIA RTX3050',
        RAM: '12GB DDR5',
        Storage: '512GB SSD',
        Display: '15.6" 144Hz',
        OS: 'Windows 11 Home'
      }
    },
    {
      id: 'p003',
      name: 'Desktop Gaming Intel Core i5 12400F',
      category: 'Desktop',
      price: 10600000,
      img: './gambar/pc2.png',
      specs: {
        CPU: 'Intel Core i5 12400F',
        GPU: 'RTX 3060 12GB',
        RAM: '16GB DDR4',
        Storage: '1TB - 120GB + HDD 1TB',
        PSU: '550W Bronze',
        OS: 'Windows 11 Pro'
      }
    },
    {
      id: 'p004',
      name: 'Desktop Intel Core i5-GEN 6',
      category: 'Desktop',
      price: 5000000,
      img: './gambar/pc1.png',
      specs: {
        CPU: 'Intel Core I5-GEN 6',
        GPU: 'Integrated Vega',
        RAM: '32GB DDR4',
        Storage: '1TB NVMe',
        Form: 'Mini-ITX'
      }
    },
    {
      id: 'p005',
      name: 'Monitor OLED Asus PG27AQDM',
      category: 'Aksesoris',
      price: 16500000,
      img: './gambar/ac6.png',
      specs: {
        Size: '26.5 inch',
        Type: 'OLED',
        Resolution: '2560x1440',
        Refresh: '240Hz'
      }
    },
    {
      id: 'p006',
      name: 'Keyboard Gaming ASUS Azoth',
      category: 'Aksesoris',
      price: 5200000,
      img: './gambar/ac0.png',
      specs: {
        Dimension: '326 x 136 x 40 mm',
        Connect: 'USB 2.0 | Bluetooth 5.1 | RF 2.4GHz',
        OS: 'macOS® 10.11 or later | Windows® 11',
        Weight: '1186g PBT keycaps without cable'
      }
    },
    {
      id: 'p007',
      name: 'Lenovo Laptop Gaming 3-15ARH7-JHID',
      category: 'Laptop',
      price: 13299000,
      img: './gambar/la1.png',
      specs: {
        CPU: 'A AMD Ryzen™ 5 7535HS',
        GPU: 'NVIDIA RTX2050',
        RAM: '8GB',
        Storage: '512GB',
        Form: 'Mini-ITX'
      }
    },
    {
      id: 'p008',
      name: 'LOGITECH G603 Wireless Mouse',
      category: 'Aksesoris',
      price: 945000,
      img: './gambar/ac3.png',
      specs: {
        Width: '68 mm',
        Height: '124 mm',
        Processor: '32-bit ARM',
        Lightspeed: 'Windows® 7 atau versi terbaru | macOS® 10.11 atau versi terbaru | Android™ 3.2 atau versi terbaru'
      }
    }
  ];

  // Config WhatsApp: isi nomor penjual (format: tanpa '+' dan tanpa spasi, contoh '6281234567890')
  const WHATSAPP_NUMBER = '6285855225009'; // ganti dengan nomor Anda

  // Helper: format rupiah
  const fmt = (n) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
  };

  // State
  let state = {
    products,
    filtered: products.slice(),
    currentCategory: 'All',
    search: '',
    sort: 'default'
  };

  // DOM refs
  const categoriesDom = document.getElementById('categories');
  const productGrid = document.getElementById('productGrid');
  const modal = document.getElementById('modal');
  const modalBody = document.getElementById('modalBody');
  const modalClose = document.getElementById('modalClose');
  const sortSelect = document.getElementById('sortSelect');
  const searchInput = document.getElementById('searchInput');
  document.getElementById('year').textContent = new Date().getFullYear();

  // Build categories (unique)
  function buildCategories(){
    const cats = ['All', ...new Set(products.map(p => p.category))];
    categoriesDom.innerHTML = '';
    cats.forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'cat-btn' + (cat === state.currentCategory ? ' active' : '');
      btn.textContent = cat;
      btn.addEventListener('click', () => {
        state.currentCategory = cat;
        document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        applyFilters();
      });
      categoriesDom.appendChild(btn);
    });
  }

  // Render products
  function renderProducts(list){
    productGrid.innerHTML = '';
    if(list.length === 0){
      productGrid.innerHTML = `<div style="grid-column:1/-1;padding:36px;text-align:center;color:var(--muted)">Tidak ditemukan produk</div>`;
      return;
    }
    list.forEach(p => {
      const card = document.createElement('article');
      card.className = 'card';
      card.innerHTML = `
        <div class="thumb"><img src="${p.img}" alt="${p.name}"></div>
        <h3>${p.name}</h3>
        <div class="meta">${p.category} • <span class="price">${fmt(p.price)}</span></div>
        <div class="row">
          <button class="btn btn-ghost" data-id="${p.id}" data-action="spec">Lihat Spesifikasi</button>
          <button class="btn btn-primary" data-id="${p.id}" data-action="buy">Beli via WhatsApp</button>
          
        </div>
      `;
      productGrid.appendChild(card);
    });
  }

  // Apply filters (category, search, sort)
  function applyFilters(){
    let list = products.slice();

    // category
    if(state.currentCategory !== 'All'){
      list = list.filter(p => p.category === state.currentCategory);
    }

    // search
    if(state.search && state.search.trim() !== ''){
      const q = state.search.toLowerCase();
      list = list.filter(p => (p.name + ' ' + (p.category||'') + ' ' + Object.values(p.specs||{}).join(' ')).toLowerCase().includes(q));
    }

    // sort
    if(state.sort === 'price-asc'){
      list.sort((a,b) => a.price - b.price);
    } else if(state.sort === 'price-desc'){
      list.sort((a,b) => b.price - a.price);
    } else if(state.sort === 'name-asc'){
      list.sort((a,b) => a.name.localeCompare(b.name));
    }

    state.filtered = list;
    renderProducts(list);
  }

  // Modal show specs
  function showSpecs(product){
    modalBody.innerHTML = `
      <div style="display:flex;gap:16px;align-items:center">
        <div style="width:140px;height:100px;border-radius:10px;overflow:hidden;background:#0d0b10;display:flex;align-items:center;justify-content:center">
          <img src="${product.img}" alt="${product.name}" style="max-width:100%;max-height:100%;object-fit:contain">
        </div>
        <div style="flex:1">
          <h2 style="margin:0 0 6px 0">${product.name}</h2>
          <div style="color:var(--muted);font-weight:700">${product.category} • <span style="color:var(--accent)">${fmt(product.price)}</span></div>
          <p style="margin-top:8px;color:var(--muted)">${Object.keys(product.specs).length} spesifikasi utama</p>
        </div>
      </div>

      <div class="specs">
        ${Object.entries(product.specs).map(([k,v]) => `
          <div class="k">${k}</div><div class="v">${v}</div>
        `).join('')}
      </div>

      <div style="margin-top:16px;display:flex;gap:10px;">
        <button id="buyFromModal" class="btn btn-primary">Beli via WhatsApp</button>
        <button id="closeModalBtn" class="btn btn-ghost">Tutup</button>
      </div>
    `;
    // attach buy handler
    document.getElementById('buyFromModal').addEventListener('click', () => openWhatsApp(product));
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    openModal();
  }

  // Modal open/close
  function openModal(){
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeModal(){
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // WhatsApp link builder and open
  function openWhatsApp(product){
    // encode pesan: nama, harga, id, and optional quantity
    const message = `Halo! Saya hendak membeli *${product.name}* (ID: ${product.id}) seharga ${fmt(product.price)}. apakah masih ada? Terima kasih.`;
    // wa.me link (international format without +). If user uses WA API, use web.whatsapp.com or wa.me
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  // Delegated click handler for product buttons
  productGrid.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    const action = btn.dataset.action;
    const id = btn.dataset.id;
    const product = products.find(p => p.id === id);
    if(!product) return;
    if(action === 'spec') {
      showSpecs(product);
    } else if(action === 'buy') {
      openWhatsApp(product);
    }
  });

  // Modal close button
  modalClose.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => {
    if(e.target === modal) closeModal();
  });

  // Search input
  searchInput.addEventListener('input', (e) => {
    state.search = e.target.value;
    applyFilters();
  });

  // Sorting
  sortSelect.addEventListener('change', (e) => {
    state.sort = e.target.value;
    applyFilters();
  });

  // Keyboard: esc to close modal
  document.addEventListener('keydown', (e) => {
    if(e.key === 'Escape' && modal.classList.contains('show')) closeModal();
  });

  // Init
  buildCategories();
  applyFilters();

// ===== Chatbot Cerdas (Rule+NLP heuristics) =====
(function smartChatWidget(){
  const chatToggle = document.getElementById('chatToggle');
  const chatBox = document.getElementById('chatBox');
  const chatClose = document.getElementById('chatClose');
  const chatMessages = document.getElementById('chatMessages');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatSuggestions = document.getElementById('chatSuggestions');
  const escalateWA = document.getElementById('escalateWA');

  // state
  let chatOpen = chatBox?.classList.contains('open') || false;
  let transcript = []; // {from:'user'|'bot', text}
  const TRANSCRIPT_LIMIT = 200; // safety cap
  if(typeof window.selectedProductInChat === 'undefined') window.selectedProductInChat = null;
  let welcomed = transcript.length > 0; // avoid repeated welcome

  // helper: safe push to transcript and cap
  function pushTranscript(msg){
    transcript.push(msg);
    if(transcript.length > TRANSCRIPT_LIMIT) transcript.shift();
  }

  // helper: add message (dedup prevention optional)
  function addMessage(from, text){
    // simple dedup: avoid pushing identical consecutive messages from same sender
    const last = transcript[transcript.length - 1];
    if(last && last.from === from && last.text === text) {
      // scroll to bottom but do not duplicate
      chatMessages.scrollTop = chatMessages.scrollHeight;
      return;
    }

    pushTranscript({from, text});
    const div = document.createElement('div');
    div.className = 'msg ' + (from === 'user' ? 'user' : 'bot');
    // support simple HTML for emphasis
    div.innerHTML = text.replace(/\n/g, '<br>');
    chatMessages.appendChild(div);
    // keep scroll at bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  // basic normalization
  function normalize(text){
    return text.trim().toLowerCase();
  }

  // parse numeric currency like "5jt", "5 juta", "rp 5.000.000", "5000000"
  function parseCurrency(text){
    const t = text.toLowerCase().replace(/\./g,'').replace(/,/g,'');
    let m;
    m = t.match(/(\d+)\s*(jt|juta|j)\b/);
    if(m) return parseInt(m[1],10) * 1000000;
    m = t.match(/(\d+)\s*(k|rb|ribu)\b/);
    if(m) return parseInt(m[1],10) * 1000;
    m = t.match(/(\d{4,})/); // 1000+
    if(m) return parseInt(m[1],10);
    return null;
  }

  // fuzzy product match by name / id / category
  function findProductCandidates(text){
    const t = normalize(text);
    if(!Array.isArray(products)) return [];
    const results = products.map(p => {
      const scoreName = stringSimilarity(t, (p.name + ' ' + (p.id||'') + ' ' + (p.category||'')).toLowerCase());
      return {product: p, score: scoreName};
    }).filter(r => r.score > 0.25) // threshold
      .sort((a,b) => b.score - a.score);
    return results;
  }

  // small string similarity (token overlap + trigram fallback)
  function stringSimilarity(a,b){
    if(!a || !b) return 0;
    const atoks = Array.from(new Set(a.split(/\s+/).filter(Boolean)));
    const btoks = Array.from(new Set(b.split(/\s+/).filter(Boolean)));
    const inter = atoks.filter(x => btoks.includes(x)).length;
    const union = Math.max(atoks.length, btoks.length) || 1;
    const tokenScore = inter / union;
    const aTri = ngrams(a,3), bTri = ngrams(b,3);
    const interTri = aTri.filter(x => bTri.includes(x)).length;
    const unionTri = new Set([...aTri, ...bTri]).size || 1;
    const triScore = interTri / unionTri;
    return Math.max(tokenScore, triScore);
  }
  function ngrams(s,n){
    const out=[];
    for(let i=0;i<=s.length-n;i++) out.push(s.slice(i,i+n));
    return out;
  }

  // intent detection: returns {intent, score, entities}
  function detectIntent(text){
    const t = normalize(text);
    const intents = [
      {name:'buy', keys:['beli','pesan','order','mau beli','checkout','saya mau']},
      {name:'spec', keys:['spesifikasi','spec','detail','fitur','ram','cpu','gpu','storage']},
      {name:'stok', keys:['stok','tersedia','ada stok','ketersediaan']},
      {name:'price', keys:['harga','berapa','murah','harga berapa','price']},
      {name:'shipping', keys:['ongkir','ongkos','kirim','pengiriman','biaya kirim']},
      {name:'warranty', keys:['garansi','garansi berapa','jaminan']},
      {name:'nego', keys:['nego','bisa nego','tawar']},
      {name:'greeting', keys:['halo','hi','selamat','pagi','siang','salam']},
      {name:'thanks', keys:['terima kasih','thanks','makasih']}
    ];

    const scores = {};
    for(const item of intents){
      scores[item.name] = 0;
      for(const k of item.keys){
        if(t.includes(k)) scores[item.name] += 1;
      }
    }

    const currency = parseCurrency(text);
    const prodCandidates = findProductCandidates(text);

    // fallback heuristics
    if(/\?$/.test(text.trim()) && /harga|berapa/.test(t)) {
      scores.price = (scores.price || 0) + 0.8;
    }

    const entities = {};
    if(currency) entities.budget = currency;
    if(prodCandidates.length) {
      entities.product = prodCandidates[0].product;
      entities.productMatchScore = prodCandidates[0].score;
    }
    const qtyMatch = text.match(/(\d+)\s*(pcs|pc|unit|buah|x|qty)?/i);
    if(qtyMatch) entities.qty = parseInt(qtyMatch[1],10);
    const cityMatch = text.match(/ke\s+([A-Za-z\u00C0-\u017F\s\-]+)/i);
    if(cityMatch && cityMatch[1].length < 40) entities.city = cityMatch[1].trim();

    const sorted = Object.entries(scores).sort((a,b)=>b[1]-a[1]);
    let intent = sorted.length ? sorted[0][0] : 'greeting';
    let confidence = sorted.length ? (sorted[0][1] / (sorted[0][1] + 1)) : 0.2;

    if(scores.buy >= 1 && entities.product) intent = 'buy';
    if(scores.spec >= 1 && entities.product) intent = 'spec';
    if(sorted[0] && sorted[0][1] < 1 && entities.product) {
      intent = 'spec';
      confidence = Math.max(confidence, 0.6);
    }

    return { intent, confidence: Math.min(1, confidence + 0.1*(sorted[0] ? sorted[0][1] : 0)), entities, rawScores: scores };
  }

  // prepare helpful replies based on intent & entities
  function replyFor(parsed){
    const { intent, confidence, entities } = parsed;
    const p = entities.product || window.selectedProductInChat || null;

    if(intent === 'greeting') return "Halo! Saya asisten toko. Sebutkan produk yang Anda minati atau ketik pertanyaan (stok, harga, ongkir, garansi).";
    if(intent === 'thanks') return "Sama-sama! Kalau masih ada pertanyaan, tinggal ketik saja.";
    if(intent === 'spec' && p){
      const specsHtml = Object.entries(p.specs || {}).map(([k,v])=>`<strong>${k}:</strong> ${v}`).join('<br>');
      return `Spesifikasi ${p.name}:<br>${specsHtml}<br><br>Harga: <strong>${fmt(p.price)}</strong><br>
        <button class="btn btn-primary" data-action="buy-now" data-id="${p.id}">Beli Sekarang</button>
        <button class="btn btn-ghost" data-action="more-questions" style="margin-left:8px">Tanyakan lagi</button>`;
    }
    if(intent === 'stok' && p){
      return `Baik, saya cek ketersediaan *${p.name}* (ID: ${p.id}). Sebutkan kota tujuan untuk estimasi pengiriman atau tekan "Kirim ke Market (WhatsApp)".`;
    }
    if(intent === 'price' && p){
      return `Harga ${p.name} adalah ${fmt(p.price)}. Mau saya kirimkan link order via WhatsApp?`;
    }
    if(intent === 'shipping'){
      if(entities.city){
        return `Estimasi ongkir ke *${entities.city}* bergantung pada kurir. Umumnya berkisar antara Rp20.000 — Rp150.000. Mau saya kirim detail ke WhatsApp?`;
      } else if(p){
        return `Untuk menghitung ongkir, sebutkan kota tujuan (cth: "ke Jakarta Selatan").`;
      } else {
        return `Bisa sebutkan produk & kota tujuan agar saya hitung estimasi ongkir?`;
      }
    }
    if(intent === 'warranty'){
      return `Garansi standar pabrikan 1 tahun. Untuk perpanjangan atau service plan, dapat dinegosiasikan. Mau saya teruskan ke tim penjualan?`;
    }
    if(intent === 'nego'){
      return `Untuk negosiasi, sebutkan berapa penawaran harga Anda (contoh: "Saya tawar 12.500.000"). Saya akan bantu sampaikan ke penjual.`;
    }
    if(intent === 'buy'){
      if(p){
        const qty = entities.qty || 1;
        return `Siap. Anda ingin membeli *${p.name}* (Qty: ${qty}) seharga ${fmt(p.price)} tiap unit. Apakah alamat/kota pengiriman sudah diketahui? (sebutkan kota tujuan atau tekan "Kirim ke Market (WhatsApp)")`;
      } else {
        return `Produk mana yang ingin Anda beli? Sebutkan nama produk atau klik produk di daftar.`;
      }
    }

    if(confidence < 0.35){
      return `Maaf, saya kurang paham. Mau saya teruskan percakapan ini ke tim penjualan (WhatsApp)? Tekan "Kirim ke Market (WhatsApp)" atau coba ketik ulang dengan menyebut produk/masalah spesifik.`;
    }

    return 'Terima kasih. Mohon jelaskan lebih spesifik (cth: "stok laptop RTX 4060", "harga monitor 27").';
  }

  // render suggestions (smart)
  function renderSuggestions(){
    chatSuggestions.innerHTML = '';
    const base = ['Apakah stok tersedia?', 'Berapa harga?', 'Minta spesifikasi lengkap', 'Saya mau beli'];
    base.forEach(s => {
      const b = document.createElement('button');
      b.className = 'sugg-btn';
      b.textContent = s;
      b.addEventListener('click', () => {
        addMessage('user', s);
        handleUserMessage(s);
      });
      chatSuggestions.appendChild(b);
    });

    if(window.selectedProductInChat){
      const p = window.selectedProductInChat;
      const q1 = document.createElement('button');
      q1.className = 'sugg-btn';
      q1.textContent = `Stok ${p.name}`;
      q1.addEventListener('click', () => {
        addMessage('user', `Apakah ${p.name} tersedia?`);
        handleUserMessage(`Apakah ${p.name} tersedia?`);
      });
      chatSuggestions.appendChild(q1);

      const q2 = document.createElement('button');
      q2.className = 'sugg-btn';
      q2.textContent = `Beli ${p.name}`;
      q2.addEventListener('click', () => {
        addMessage('user', `Saya mau beli ${p.name}`);
        handleUserMessage(`Saya mau beli ${p.name}`);
      });
      chatSuggestions.appendChild(q2);
    }
  }

  // main handler for user messages
  function handleUserMessage(text){
    text = (text||'').trim();
    if(!text) return;
    recordQuery(text.slice(0,80));
    const parsed = detectIntent(text);

    // confirmation for low-match product
    if(parsed.entities && parsed.entities.product && parsed.entities.productMatchScore < 0.35){
      addMessage('bot', `Saya menemukan produk yang mungkin Anda maksud: *${parsed.entities.product.name}*. Apakah ini yang Anda maksud? (ya / bukan)`);
      window._pendingConfirmation = { type: 'confirmProduct', product: parsed.entities.product };
      return;
    }

    // user answers confirmation
    if(window._pendingConfirmation && /^(ya|iya|betul|yes|yep|correct)$/i.test(text.trim())){
      if(window._pendingConfirmation.type === 'confirmProduct'){
        window.selectedProductInChat = window._pendingConfirmation.product;
        addMessage('bot', `Oke, terima kasih. Saya pakai konteks produk: *${window.selectedProductInChat.name}*. Apa yang ingin Anda tanyakan (stok, harga, ongkir, spesifikasi, beli)?`);
        window._pendingConfirmation = null;
        return;
      }
    } else if(window._pendingConfirmation && /^(bukan|tidak|no)$/i.test(text.trim())){
      addMessage('bot', `Baik, mohon sebutkan ulang nama produk atau klik produk pada daftar.`);
      window._pendingConfirmation = null;
      return;
    }

    // record user message & show short processing
    addMessage('user', text);
    addMessage('bot', 'Memproses...');

    setTimeout(() => {
      const parsed2 = detectIntent(text);
      if(!parsed2.entities.product && window.selectedProductInChat){
        parsed2.entities.product = window.selectedProductInChat;
        parsed2.entities.productMatchScore = 0.9;
      }
      const answer = replyFor(parsed2);

      // remove last "Memproses..." bot msg
      for(let i = transcript.length -1; i>=0; i--){
        if(transcript[i].from === 'bot' && transcript[i].text === 'Memproses...'){
          transcript.splice(i,1);
          const doms = chatMessages.querySelectorAll('.msg.bot');
          if(doms.length) doms[doms.length-1].remove();
          break;
        }
      }

      addMessage('bot', answer);
      attachDynamicActionHandlers();
    }, 300 + Math.random()*400);
  }

  // attach handlers for dynamic buttons in bot replies (like buy-now)
  function attachDynamicActionHandlers(){
    Array.from(chatMessages.querySelectorAll('button[data-action="buy-now"]')).forEach(btn => {
      if(btn._attached) return;
      btn._attached = true;
      btn.addEventListener('click', (e) => {
        const id = btn.dataset.id;
        const p = products.find(x => x.id === id);
        if(p){
          // avoid spamming same user message repeatedly
          const lastUser = transcript.filter(t => t.from === 'user').slice(-1)[0];
          const userText = `Saya setuju membeli ${p.name}`;
          if(!lastUser || lastUser.text !== userText){
            window.selectedProductInChat = p;
            addMessage('user', userText);
            addMessage('bot', `Baik, saya siapkan ringkasan order. Tekan "Kirim ke Market (WhatsApp)" untuk melanjutkan.`);
          }
        }
      });
    });

    Array.from(chatMessages.querySelectorAll('button[data-action="more-questions"]')).forEach(btn => {
      if(btn._attached) return;
      btn._attached = true;
      btn.addEventListener('click', () => {
        addMessage('bot', 'Silakan ketik pertanyaan Anda atau pilih suggestion di bawah.');
      });
    });
  }

  // open/close using class (no display toggling) — smoother & non-shifting UI
  function openChat(){
    if(!chatBox) return;
    if(chatBox.classList.contains('open')) return;
    chatBox.classList.add('open');
    chatToggle.setAttribute('aria-expanded', 'true');
    chatOpen = true;
    // only welcome once
    if(!welcomed){
      addMessage('bot', 'Halo! Saya asisten pintar. Sebutkan produk atau masalah (stok, harga, ongkir, garansi).');
      welcomed = true;
      renderSuggestions();
    }
    // focus input after CSS animation (match CSS transition duration ~260ms)
    setTimeout(()=> chatInput?.focus(), 260);
  }
  function closeChat(){
    if(!chatBox) return;
    chatBox.classList.remove('open');
    chatToggle.setAttribute('aria-expanded', 'false');
    chatOpen = false;
    // keep transcript (do not clear), but do not re-add welcome on reopen
  }

  // wire events (debounce toggle clicks slightly)
  let toggleCooldown = false;
  chatToggle.addEventListener('click', () => {
    if(toggleCooldown) return;
    toggleCooldown = true;
    setTimeout(()=> toggleCooldown = false, 350);
    if(chatBox.classList.contains('open')) closeChat();
    else openChat();
  });
  chatClose.addEventListener('click', closeChat);

  chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = (chatInput.value || '').trim();
    if(!text) return;
    chatInput.value = '';
    handleUserMessage(text);
  });

  // escalate to WhatsApp: include structured transcript & selected product
  escalateWA.addEventListener('click', () => {
    let header = 'Halo, saya ingin melanjutkan percakapan dari website Toko Komputer.%0A';
    if(window.selectedProductInChat){
      const p = window.selectedProductInChat;
      header += `%0A*Produk:* ${p.name}%0A*ID:* ${p.id}%0A*Harga:* ${fmt(p.price)}%0A`;
    }
    header += '%0A*Percakapan:*%0A';
    transcript.forEach(m => {
      const who = m.from === 'user' ? 'Pembeli' : 'Asisten';
      header += `${who}: ${m.text}%0A`;
    });
    header += '%0AMohon bantuannya. Terima kasih.';
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(decodeURIComponent(header))}`;
    window.open(waUrl, '_blank');
  });

  // if user clicks buy/spec in product grid, set context in chat
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if(!btn) return;
    if(btn.dataset && (btn.dataset.action === 'buy' || btn.dataset.action === 'spec' || btn.dataset.action === 'buy-now')){
      const id = btn.dataset.id;
      if(id){
        const p = (Array.isArray(products) ? products : (window.state?.products || [])).find(x => x.id === id);
        if(p){
          window.selectedProductInChat = p;
          if(!chatBox.classList.contains('open')) openChat();
          // avoid duplicate identical user message if recently added
          const lastUser = transcript.filter(t => t.from === 'user').slice(-1)[0];
          const userText = `Saya tertarik ${p.name} (ID ${p.id}) — mau tanya stok & ongkir.`;
          if(!lastUser || lastUser.text !== userText){
            addMessage('user', userText);
            handleUserMessage(`Apakah ${p.name} tersedia?`);
          }
        }
      }
    }
  });

  // expose for debugging / extension
  window.smartChat = {
    addMessage, handleUserMessage, detectIntent
  };

  // small analytics: count popular queries (persist top queries to localStorage)
  function recordQuery(q){
    try{
      const key = 'tk_query_counts_v1';
      const obj = JSON.parse(localStorage.getItem(key) || '{}');
      obj[q] = (obj[q] || 0) + 1;
      localStorage.setItem(key, JSON.stringify(obj));
    }catch(e){}
  }

  // init: ensure chatBox starts hidden (CSS-based)
  if(chatBox && !chatBox.classList.contains('open')){
    chatBox.classList.remove('open'); // ensure closed state
    chatBox.setAttribute('aria-hidden', 'true');
  } else if(chatBox && chatBox.classList.contains('open')){
    chatBox.setAttribute('aria-hidden', 'false');
    chatOpen = true;
  }

  renderSuggestions();
})();

});

