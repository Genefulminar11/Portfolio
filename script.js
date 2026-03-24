console.log("Portfolio loaded successfully!");

const sidebar = document.getElementById('sidebar');
const menuToggle = document.getElementById('menuToggle');
const profilePic = document.getElementById('profilePic');
const menuButtons = document.querySelectorAll('.menu-btn');

// fragment cache by URL
const fragmentCache = {};

function toggleMenu() {
  sidebar.classList.toggle('menu-collapsed');
}
function closeMenu() {
  if (window.innerWidth < 992) sidebar.classList.add('menu-collapsed');
}

if (menuToggle) menuToggle.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggleMenu(); });
if (profilePic) profilePic.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); if (window.innerWidth < 992) toggleMenu(); });

// Generic loader: fetch fragment (html file) and inject into targetId element
async function loadFragment(url, targetId) {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = '<div class="py-5 text-center text-muted">Loading...</div>';
  try {
    if (fragmentCache[url]) {
      target.innerHTML = fragmentCache[url];
      initAfterLoad(targetId);
      return;
    }
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) throw new Error('Failed to load ' + url);
    const html = await resp.text();
    fragmentCache[url] = html;
    target.innerHTML = html;
    initAfterLoad(targetId);
  } catch (err) {
    console.error(err);
    target.innerHTML = '<div class="py-5 text-center text-danger">Unable to load content.</div>';
  }
}

function initAfterLoad(targetId) {
  // Attach handlers that depend on dynamically loaded content
  if (targetId === 'resume') initResumeHandlers();
  if (targetId === 'contact') initContactHandlers();
  if (targetId === 'others') initMediaPlayer();
}

function initResumeHandlers() {
  const downloadBtn = document.querySelector('.resume-container .btn-dark');
  const resumeElement = document.querySelector('.resume-wrapper');

  if (downloadBtn && resumeElement && typeof html2pdf === 'function') {
    downloadBtn.addEventListener('click', function(e) {
      e.preventDefault();

      // Clone to avoid changing original DOM
      const clonedElement = resumeElement.cloneNode(true);
      clonedElement.style.padding = '10px';
      clonedElement.style.margin = '0';

      const opt = {
        margin: [8, 8, 8, 8],
        filename: 'Gene_Ryan_Fulminar_Resume.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4', compress: true },
        pagebreak: { avoid: ['tr', '.job-item', '.resume-section'] }
      };

      html2pdf().set(opt).from(clonedElement).save();
    });
  }
}

function initContactHandlers() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const name = document.getElementById('name').value || '';
    const email = document.getElementById('email').value || '';
    const subject = document.getElementById('subject').value || '';
    const message = document.getElementById('message').value || '';

    const mailtoLink = `mailto:g.fulminar1199@aol.com?subject=${encodeURIComponent(subject)}&body=From: ${encodeURIComponent(name)} (${encodeURIComponent(email)})%0A%0A${encodeURIComponent(message)}`;
    window.location.href = mailtoLink;
    contactForm.reset();
  });
}

// Menu click handler
menuButtons.forEach(btn => {
  btn.addEventListener('click', async function(e) {
    e.preventDefault();
    const section = this.getAttribute('data-section');

    // hide all sections
    document.querySelectorAll('.section-content').forEach(el => el.classList.add('d-none'));

    if (section === 'about') {
      await loadFragment('about.html', 'about');
      document.getElementById('about').classList.remove('d-none');
    } else if (section === 'blog') {
      await loadFragment('blog.html', 'blog');
      document.getElementById('blog').classList.remove('d-none');
    } else if (section === 'projects') {
      await loadFragment('projects.html', 'projects');
      document.getElementById('projects').classList.remove('d-none');
    } else if (section === 'services') {
      await loadFragment('services.html', 'services');
      document.getElementById('services').classList.remove('d-none');
    } else if (section === 'resume') {
      await loadFragment('resume.html', 'resume');
      document.getElementById('resume').classList.remove('d-none');
    } else if (section === 'contact') {
      await loadFragment('contact.html', 'contact');
      document.getElementById('contact').classList.remove('d-none');
    } else if (section === 'others') {
      await loadFragment('others.html', 'others');
      document.getElementById('others').classList.remove('d-none');
    } else {
      const el = document.getElementById(section);
      if (el) el.classList.remove('d-none');
    }

    closeMenu();
  });
});

// close menu when clicking outside on mobile
document.addEventListener('click', function(event) {
  if (window.innerWidth < 992) {
    const isInside = sidebar && sidebar.contains(event.target);
    if (!isInside && !sidebar.classList.contains('menu-collapsed')) closeMenu();
  }
});

/* ===================== Media Player ===================== */

// List your media files here. Add entries when you drop files into assets/media/
const PROJECT_MEDIA = [
  { name: 'Skusta Clee - Since Day One (Lyrics) Ft. Flow G.mp3', url: 'assets/media/music/Skusta Clee - Since Day One (Lyrics) Ft. Flow G.mp3', type: 'audio' },
  // { name: 'My Song.mp3',   url: 'assets/media/music/My Song.mp3',   type: 'audio' },
  // { name: 'My Video.mp4',  url: 'assets/media/videos/My Video.mp4', type: 'video' },
];

function initMediaPlayer() {
  const audioPlayer = document.getElementById('audioPlayer');
  const videoPlayer = document.getElementById('videoPlayer');
  const audioContainer = document.getElementById('audioContainer');
  const videoContainer = document.getElementById('videoContainer');
  const audioControls = document.getElementById('audioControls');
  const nowPlayingTitle = document.getElementById('nowPlayingTitle');
  const nowPlayingType = document.getElementById('nowPlayingType');
  const btnPlayPause = document.getElementById('btnPlayPause');
  const playIcon = document.getElementById('playIcon');
  const btnPrev = document.getElementById('btnPrev');
  const btnNext = document.getElementById('btnNext');
  const btnShuffle = document.getElementById('btnShuffle');
  const btnRepeat = document.getElementById('btnRepeat');
  const audioProgress = document.getElementById('audioProgress');
  const currentTimeEl = document.getElementById('currentTime');
  const totalTimeEl = document.getElementById('totalTime');
  const volumeSlider = document.getElementById('volumeSlider');
  const playlistList = document.getElementById('playlistList');
  const emptyPlaylist = document.getElementById('emptyPlaylist');
  const filterBtns = document.querySelectorAll('.media-filter-btn');
  const canvas = document.getElementById('audioVisualizer');

  if (!audioPlayer || !videoPlayer) return;

  let currentIndex = -1;
  let isShuffled = false;
  let repeatMode = 0;
  let currentFilter = 'all';
  let audioContext, analyser, source, animFrameId;

  function cleanName(filename) {
    return filename.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
  }

  const playlist = PROJECT_MEDIA.map(item => ({
    name: item.name,
    displayName: cleanName(item.name),
    type: item.type,
    url: item.url
  }));

  audioPlayer.volume = 0.8;
  videoPlayer.volume = 0.8;

  function formatTime(sec) {
    if (isNaN(sec) || !isFinite(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function renderPlaylist() {
    playlistList.innerHTML = '';
    const filtered = playlist.map((item, idx) => ({ ...item, idx })).filter(item => {
      if (currentFilter === 'all') return true;
      return item.type === currentFilter;
    });

    if (filtered.length === 0) {
      emptyPlaylist.classList.remove('d-none');
      playlistList.classList.add('d-none');
      return;
    }
    emptyPlaylist.classList.add('d-none');
    playlistList.classList.remove('d-none');

    filtered.forEach(item => {
      const li = document.createElement('li');
      li.className = 'list-group-item media-playlist-item' + (item.idx === currentIndex ? ' active' : '');
      li.innerHTML = `
        <div class="media-item-icon ${item.type === 'video' ? 'video-icon' : 'audio-icon'}">
          <i class="fas ${item.type === 'video' ? 'fa-film' : 'fa-music'}"></i>
        </div>
        <div class="media-item-info">
          <div class="media-item-name">${item.displayName}</div>
          <div class="media-item-type">${item.type} &bull; ${item.name.split('.').pop().toUpperCase()}</div>
        </div>
      `;
      li.addEventListener('click', () => playTrack(item.idx));
      playlistList.appendChild(li);
    });
  }

  function stopAll() {
    audioPlayer.pause();
    audioPlayer.src = '';
    videoPlayer.pause();
    videoPlayer.src = '';
    if (animFrameId) cancelAnimationFrame(animFrameId);
  }

  function resetUI() {
    audioContainer.classList.add('d-none');
    videoContainer.classList.add('d-none');
    audioControls.classList.add('d-none');
    nowPlayingTitle.textContent = 'No media selected';
    nowPlayingType.textContent = 'Select a track from the playlist';
    playIcon.className = 'fas fa-play';
  }

  function playTrack(idx) {
    if (idx < 0 || idx >= playlist.length) return;
    stopAll();
    currentIndex = idx;
    const track = playlist[idx];

    nowPlayingTitle.textContent = track.displayName;
    nowPlayingType.textContent = track.type.charAt(0).toUpperCase() + track.type.slice(1) + ' \u2014 ' + track.name.split('.').pop().toUpperCase();

    if (track.type === 'video') {
      audioContainer.classList.add('d-none');
      audioControls.classList.add('d-none');
      videoContainer.classList.remove('d-none');
      videoPlayer.src = track.url;
      videoPlayer.play();
    } else {
      videoContainer.classList.add('d-none');
      audioContainer.classList.remove('d-none');
      audioControls.classList.remove('d-none');
      audioPlayer.src = track.url;
      audioPlayer.play();
      playIcon.className = 'fas fa-pause';
      startVisualizer();
    }
    renderPlaylist();
  }

  btnPlayPause.addEventListener('click', function() {
    if (currentIndex === -1) return;
    if (playlist[currentIndex].type === 'audio') {
      if (audioPlayer.paused) { audioPlayer.play(); playIcon.className = 'fas fa-pause'; }
      else { audioPlayer.pause(); playIcon.className = 'fas fa-play'; }
    }
  });

  btnPrev.addEventListener('click', function() {
    if (playlist.length === 0) return;
    let idx = currentIndex - 1;
    if (idx < 0) idx = playlist.length - 1;
    playTrack(idx);
  });

  btnNext.addEventListener('click', function() { playNext(); });

  function playNext() {
    if (playlist.length === 0) return;
    if (isShuffled) {
      let idx = Math.floor(Math.random() * playlist.length);
      if (playlist.length > 1) while (idx === currentIndex) idx = Math.floor(Math.random() * playlist.length);
      playTrack(idx);
    } else {
      let idx = currentIndex + 1;
      if (idx >= playlist.length) idx = 0;
      playTrack(idx);
    }
  }

  btnShuffle.addEventListener('click', function() {
    isShuffled = !isShuffled;
    btnShuffle.classList.toggle('active', isShuffled);
  });

  btnRepeat.addEventListener('click', function() {
    repeatMode = (repeatMode + 1) % 3;
    btnRepeat.classList.toggle('active', repeatMode > 0);
    btnRepeat.innerHTML = repeatMode === 2
      ? '<i class="fas fa-redo"></i><small style="font-size:0.5rem;position:absolute;bottom:2px;">1</small>'
      : '<i class="fas fa-redo"></i>';
  });

  audioPlayer.addEventListener('timeupdate', function() {
    if (audioPlayer.duration) {
      audioProgress.value = (audioPlayer.currentTime / audioPlayer.duration) * 100;
      currentTimeEl.textContent = formatTime(audioPlayer.currentTime);
      totalTimeEl.textContent = formatTime(audioPlayer.duration);
    }
  });

  audioProgress.addEventListener('input', function() {
    if (audioPlayer.duration) audioPlayer.currentTime = (audioProgress.value / 100) * audioPlayer.duration;
  });

  volumeSlider.addEventListener('input', function() {
    const vol = volumeSlider.value / 100;
    audioPlayer.volume = vol;
    videoPlayer.volume = vol;
  });

  audioPlayer.addEventListener('ended', handleTrackEnd);
  videoPlayer.addEventListener('ended', handleTrackEnd);

  function handleTrackEnd() {
    if (repeatMode === 2) playTrack(currentIndex);
    else if (repeatMode === 1 || currentIndex < playlist.length - 1) playNext();
    else playIcon.className = 'fas fa-play';
  }

  videoPlayer.addEventListener('play', () => playIcon.className = 'fas fa-pause');
  videoPlayer.addEventListener('pause', () => playIcon.className = 'fas fa-play');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilter = this.getAttribute('data-filter');
      renderPlaylist();
    });
  });

  function startVisualizer() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    try {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        source = audioContext.createMediaElementSource(audioPlayer);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 128;
        source.connect(analyser);
        analyser.connect(audioContext.destination);
      }
      if (audioContext.state === 'suspended') audioContext.resume();
    } catch (e) { return; }

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameId = requestAnimationFrame(draw);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barW = (canvas.width / bufferLength) * 1.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barH = (dataArray[i] / 255) * canvas.height * 0.8;
        ctx.fillStyle = `rgba(${13 + i * 3},${110 - i * 1.5},253,0.7)`;
        ctx.fillRect(x, canvas.height - barH, barW - 1, barH);
        x += barW;
      }
    }
    draw();
  }

  // Auto-render playlist on load
  renderPlaylist();
}
