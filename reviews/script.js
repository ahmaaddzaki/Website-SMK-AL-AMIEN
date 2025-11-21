/**
 * script.js
 * Simple product page video manager:
 * - lazy-load iframe on play
 * - switch video via thumbnails, input, or by editing `videos` array
 * - setVideoById / setVideoByIndex helpers for dev
 */

(function(){
  // --- CONFIG: change this array to add/remove videos via code ---
  // Each item { id: 'YouTubeID', title: 'Judul singkat' }
  const videos = [
    { id: 'wWpcaJNEhQw', title: 'Demo 1 (contoh)' },
    { id: '0Qp4aSQZVbs', title: 'Demo 2' },
    { id: 'gEKflaQvswA', title: 'Demo 3' },
    { id: '_9s0Z2CQST8', title: 'Demo 4' },
    { id: 'OsDBw5A6Kng', title: 'Demo 5' },
    { id: 'tnUoaiJAjMA', title: 'Demo 6' },
    { id: 'yrhFga4CH80', title: 'Demo 7' },
    { id: 'xfGH2bfyIns', title: 'Demo 8' },
  ];
  // -----------------------------------------------------------------

  // State
  let currentVideoId = videos[0] && videos[0].id ? videos[0].id : null;
  let autoplayOnPlay = false;

  // DOM
  const posterEl = document.getElementById('videoPoster');
  const container = document.getElementById('videoContainer');
  const playBtn = document.getElementById('playBtn');
  const loadBtn = document.getElementById('loadBtn');
  const urlInput = document.getElementById('youtubeUrl');
  const thumbsWrap = document.getElementById('thumbs');
  const autoplayToggle = document.getElementById('autoplayToggle');

  // UTIL: parse many youtube URL forms -> returns 11-char ID or null
  function parseYouTubeId(url){
    if(!url) return null;
    const text = url.trim();
    if (/^[A-Za-z0-9_-]{11}$/.test(text)) return text;
    try {
      const u = new URL(text);
      if(u.hostname.includes('youtube.com')) return u.searchParams.get('v');
      if(u.hostname === 'youtu.be') return u.pathname.split('/')[1];
      if(u.pathname.includes('/embed/')) return u.pathname.split('/embed/')[1].split('/')[0];
    } catch(e){}
    const m = text.match(/(?:v=|\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  // Build poster (thumbnail) background
  function setPoster(videoId){
    if(!videoId) {
      posterEl.style.backgroundImage = '';
      posterEl.style.backgroundColor = '#111';
      return;
    }
    // try maxres, fallback to hqdefault
    const maxres = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const hq = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

    // Use hqdefault directly (maxres may 404) — for robust display we'll use hq
    posterEl.style.backgroundImage = `linear-gradient(180deg, rgba(0,0,0,0.2), rgba(0,0,0,0.4)), url('${hq}')`;
  }

  // Create iframe and inject
  function createIframe(videoId, autoplay=false){
    // remove existing iframe
    const existing = container.querySelector('iframe');
    if(existing) existing.remove();

    const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&iv_load_policy=3${autoplay ? '&autoplay=1' : ''}`;

    const iframe = document.createElement('iframe');
    iframe.className = 'video-iframe';
    iframe.src = embedUrl;
    iframe.title = 'Video produk';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    iframe.allowFullscreen = true;

    container.appendChild(iframe);
  }

  // Play handler
  function handlePlay(){
    if(!currentVideoId) return;
    createIframe(currentVideoId, autoplayOnPlay);
  }

  // Load URL from input (sets currentVideoId but doesn't autoplay)
  function handleLoadFromInput(){
    const id = parseYouTubeId(urlInput.value);
    if(!id){
      alert('URL/ID YouTube tidak valid.');
      return;
    }
    setVideoById(id, { autoplay: false, focusPoster: true });
  }

  // Render thumbnails from videos array
  function renderThumbnails(){
    thumbsWrap.innerHTML = '';
    videos.forEach((v, i) => {
      const div = document.createElement('div');
      div.className = 'thumb';
      div.dataset.index = i;
      div.title = v.title || v.id;
      const img = document.createElement('img');
      img.alt = v.title || 'Video';
      img.src = `https://img.youtube.com/vi/${v.id}/hqdefault.jpg`;
      div.appendChild(img);
      div.addEventListener('click', () => setVideoByIndex(i, { autoplay: false }));
      thumbsWrap.appendChild(div);
    });
    highlightActiveThumb();
  }

  // Highlight active thumbnail
  function highlightActiveThumb(){
    const thumbs = thumbsWrap.querySelectorAll('.thumb');
    thumbs.forEach(t => t.classList.remove('active'));
    const idx = videos.findIndex(v => v.id === currentVideoId);
    if(idx >= 0 && thumbs[idx]) thumbs[idx].classList.add('active');
  }

  // Set video by ID
  // options: { autoplay: boolean, focusPoster: boolean }
  function setVideoById(id, options = {}){
    currentVideoId = id;
    urlInput.value = `https://youtu.be/${id}`;
    // remove iframe (show poster)
    const existing = container.querySelector('iframe');
    if(existing) existing.remove();
    setPoster(id);
    highlightActiveThumb();
    if(options.autoplay) createIframe(id, true);
    if(options.focusPoster) posterEl.focus();
  }

  // Set video by index in videos[] array
  function setVideoByIndex(index, options = {}){
    if(!videos[index]) return;
    setVideoById(videos[index].id, options);
  }

  // Autoplay toggle
  function toggleAutoplay(){
    autoplayOnPlay = !autoplayOnPlay;
    autoplayToggle.setAttribute('aria-pressed', autoplayOnPlay ? 'true' : 'false');
    autoplayToggle.textContent = `Autoplay: ${autoplayOnPlay ? 'On' : 'Off'}`;
  }

  // Init
  function init(){
    // Render thumbs
    renderThumbnails();

    // initial poster
    if(currentVideoId) setPoster(currentVideoId);
    urlInput.value = currentVideoId ? `https://youtu.be/${currentVideoId}` : '';

    // events
    playBtn.addEventListener('click', handlePlay);
    posterEl.addEventListener('click', handlePlay);
    posterEl.addEventListener('keydown', (e) => { if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handlePlay(); }});
    loadBtn.addEventListener('click', handleLoadFromInput);
    autoplayToggle.addEventListener('click', toggleAutoplay);

    // Optional: Enter key on input triggers load
    urlInput.addEventListener('keydown', (e) => {
      if(e.key === 'Enter') handleLoadFromInput();
    });

    // small stubs for buy buttons
    const addCartBtn = document.getElementById('addCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    if(addCartBtn) addCartBtn.addEventListener('click', () => alert('Ditambahkan ke keranjang (demo).'));
    if(checkoutBtn) checkoutBtn.addEventListener('click', () => alert('Proses checkout (demo).'));
  }

  // expose helpers for developer console (useful to change via code)
  window.productVideoManager = {
    setVideoById,
    setVideoByIndex,
    getCurrentVideoId: () => currentVideoId,
    videos // expose current array (change this array then call renderThumbnails() to update UI)
  };

  // run init on DOM ready
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
