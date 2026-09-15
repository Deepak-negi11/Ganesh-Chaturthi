/**
 * Ganesh Chaturthi Music Experience
 * Inspired by saloon.wtf • Core Application Logic
 */

// ==========================================================================
// Curated Default OG Ganesh Playlist
// ==========================================================================

const DEFAULT_PLAYLIST = [
  {
    id: 'KYUURuT4W5Y',
    title: 'Deva Shree Ganesha',
    artist: 'Ajay Gogavale • Agneepath',
    duration: '5:56',
    thumb: 'https://img.youtube.com/vi/KYUURuT4W5Y/mqdefault.jpg'
  },
  {
    id: '8jff2wz3Hpk',
    title: 'Morya Re',
    artist: 'Shankar Mahadevan • Don',
    duration: '5:51',
    thumb: 'https://img.youtube.com/vi/8jff2wz3Hpk/mqdefault.jpg'
  },
  {
    id: 're88S-5fpmA',
    title: 'Shree Ganeshay Dheemahi',
    artist: 'Shankar Mahadevan • Viruddh',
    duration: '6:12',
    thumb: 'https://img.youtube.com/vi/re88S-5fpmA/mqdefault.jpg'
  },
  {
    id: 'v4yld6Dbhgc',
    title: 'Sukh Karta Dukh Harta',
    artist: 'Lata Mangeshkar • Traditional Aarti',
    duration: '4:28',
    thumb: 'https://img.youtube.com/vi/v4yld6Dbhgc/mqdefault.jpg'
  },
  {
    id: 'vVgz3Pg-EMs',
    title: 'Sindoor Lal Chadhayo',
    artist: 'Ravindra Sathe • Vaastav',
    duration: '5:47',
    thumb: 'https://img.youtube.com/vi/vVgz3Pg-EMs/mqdefault.jpg'
  },
  {
    id: 'KJF8t-BWVRM',
    title: 'Gajanana',
    artist: 'Sukhwinder Singh • Bajirao Mastani',
    duration: '3:34',
    thumb: 'https://img.youtube.com/vi/KJF8t-BWVRM/mqdefault.jpg'
  },
  {
    id: '4m5vxdOB8MM',
    title: 'Aala Re Aala Ganesha',
    artist: 'Wajid Khan • Daddy',
    duration: '4:40',
    thumb: 'https://img.youtube.com/vi/4m5vxdOB8MM/mqdefault.jpg'
  },
  {
    id: 'L-uG5-xf3Pk',
    title: 'Jai Ganesh Jai Ganesh Deva',
    artist: 'Anuradha Paudwal • Aarti',
    duration: '4:21',
    thumb: 'https://img.youtube.com/vi/L-uG5-xf3Pk/mqdefault.jpg'
  }
];

// ==========================================================================
// Application State
// ==========================================================================

class MusicAppState {
  constructor() {
    this.playlist = this.loadStoredPlaylist();
    this.currentIndex = 0;
    this.isPlaying = false;
    this.isShuffle = false;
    this.isMuted = false;
    this.volume = 85;
    this.ytPlayer = null;
    this.isPlayerReady = false;
    this.isSeeking = false;
    this.progressInterval = null;
  }

  loadStoredPlaylist() {
    try {
      const stored = localStorage.getItem('ganesh_chaturthi_playlist');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not load playlist from localStorage', e);
    }
    return [...DEFAULT_PLAYLIST];
  }

  savePlaylist() {
    try {
      localStorage.setItem('ganesh_chaturthi_playlist', JSON.stringify(this.playlist));
    } catch (e) {
      console.warn('Could not save playlist to localStorage', e);
    }
  }

  getCurrentTrack() {
    return this.playlist[this.currentIndex] || this.playlist[0];
  }
}

const state = new MusicAppState();

// ==========================================================================
// DOM Elements
// ==========================================================================

const liveClockEl = document.getElementById('liveClock');
const queueBadgeEl = document.getElementById('queueBadge');
const drawerSongCountEl = document.getElementById('drawerSongCount');

// Player Elements
const vinylDiscEl = document.getElementById('vinylDisc');
const trackArtworkEl = document.getElementById('trackArtwork');
const trackTitleEl = document.getElementById('trackTitle');
const trackArtistEl = document.getElementById('trackArtist');
const seekBarEl = document.getElementById('seekBar');
const seekProgressEl = document.getElementById('seekProgress');
const seekHandleEl = document.getElementById('seekHandle');
const currentTimeEl = document.getElementById('currentTime');
const totalDurationEl = document.getElementById('totalDuration');

// Controls
const playBtn = document.getElementById('playBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const shuffleBtn = document.getElementById('shuffleBtn');
const muteBtn = document.getElementById('muteBtn');
const volHighIcon = document.getElementById('volHighIcon');
const volMuteIcon = document.getElementById('volMuteIcon');
const volumeSlider = document.getElementById('volumeSlider');

// Drawer & Modal Elements
const playlistDrawer = document.getElementById('playlistDrawer');
const openPlaylistBtn = document.getElementById('openPlaylistBtn');
const closePlaylistBtn = document.getElementById('closePlaylistBtn');
const playlistList = document.getElementById('playlistList');
const resetPlaylistBtn = document.getElementById('resetPlaylistBtn');

const addModal = document.getElementById('addModal');
const openAddModalBtn = document.getElementById('openAddModalBtn');
const drawerAddBtn = document.getElementById('drawerAddBtn');
const closeAddModalBtn = document.getElementById('closeAddModalBtn');
const cancelAddBtn = document.getElementById('cancelAddBtn');
const addSongForm = document.getElementById('addSongForm');
const ytUrlInput = document.getElementById('ytUrlInput');
const customTitleInput = document.getElementById('customTitleInput');
const customArtistInput = document.getElementById('customArtistInput');

const toggleParticlesBtn = document.getElementById('toggleParticlesBtn');
const toggleFullscreenBtn = document.getElementById('toggleFullscreenBtn');
const toastEl = document.getElementById('toast');

// ==========================================================================
// Toast Notifications
// ==========================================================================

let toastTimer = null;
function showToast(message, duration = 2800) {
  if (toastTimer) clearTimeout(toastTimer);
  toastEl.textContent = message;
  toastEl.classList.add('show');
  toastTimer = setTimeout(() => {
    toastEl.classList.remove('show');
  }, duration);
}

function updateClock() {
  const now = new Date();
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  liveClockEl.textContent = `${hours}:${minutes}:${seconds} ${ampm}`;
}

// ==========================================================================
// YouTube IFrame API Initialization
// ==========================================================================

function initYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    onYouTubeIframeAPIReady();
    return;
  }

  const tag = document.createElement('script');
  tag.src = 'https://www.youtube.com/iframe_api';
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

window.onYouTubeIframeAPIReady = function() {
  const current = state.getCurrentTrack();
  state.ytPlayer = new YT.Player('ytPlayer', {
    height: '200',
    width: '200',
    videoId: current.id,
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      modestbranding: 1,
      rel: 0,
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin
    },
    events: {
      onReady: onPlayerReady,
      onStateChange: onPlayerStateChange,
      onError: onPlayerError
    }
  });
};

function onPlayerReady(event) {
  state.isPlayerReady = true;
  state.ytPlayer.setVolume(state.volume);
  updateUI();
}

function onPlayerStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) {
    state.isPlaying = true;
    updatePlayStateUI();
    startProgressTracker();
  } else if (event.data === YT.PlayerState.PAUSED) {
    state.isPlaying = false;
    updatePlayStateUI();
    stopProgressTracker();
  } else if (event.data === YT.PlayerState.ENDED) {
    state.isPlaying = false;
    updatePlayStateUI();
    stopProgressTracker();
    console.log('Song ended naturally. Playing next track...');
    playNextTrack();
  }
}

function onPlayerError(event) {
  console.warn('YouTube Player error code:', event.data);
  showToast('Track skipped, auto-playing next track...');
  setTimeout(() => {
    playNextTrack();
  }, 500);
}

// ==========================================================================
// Playback Logic
// ==========================================================================

function playTrackAtIndex(index, autoPlay = true) {
  if (index < 0) index = state.playlist.length - 1;
  if (index >= state.playlist.length) index = 0;
  
  state.currentIndex = index;
  const track = state.getCurrentTrack();

  updateUI();

  if (state.isPlayerReady && state.ytPlayer) {
    if (autoPlay) {
      state.isPlaying = true;
      updatePlayStateUI();
      try {
        state.ytPlayer.loadVideoById({
          videoId: track.id,
          startSeconds: 0
        });
        state.ytPlayer.playVideo();
        startProgressTracker();
      } catch (e) {
        console.warn('Error loading video', e);
      }
    } else {
      state.ytPlayer.cueVideoById(track.id);
    }
  }
}

function togglePlayPause() {
  if (!state.isPlayerReady || !state.ytPlayer) {
    showToast('Connecting audio stream...');
    return;
  }

  if (state.isPlaying) {
    state.ytPlayer.pauseVideo();
  } else {
    state.ytPlayer.playVideo();
  }
}

function playNextTrack() {
  if (state.isShuffle && state.playlist.length > 1) {
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * state.playlist.length);
    } while (nextIdx === state.currentIndex);
    playTrackAtIndex(nextIdx, true);
  } else {
    playTrackAtIndex(state.currentIndex + 1, true);
  }
}

function playPrevTrack() {
  if (state.isPlayerReady && state.ytPlayer) {
    const current = state.ytPlayer.getCurrentTime();
    // If more than 3 seconds in, restart track
    if (current > 3) {
      state.ytPlayer.seekTo(0, true);
      return;
    }
  }
  playTrackAtIndex(state.currentIndex - 1, true);
}

function toggleShuffle() {
  state.isShuffle = !state.isShuffle;
  shuffleBtn.classList.toggle('active', state.isShuffle);
  showToast(state.isShuffle ? 'Shuffle enabled' : 'Shuffle disabled');
}

function setVolume(val) {
  state.volume = val;
  volumeSlider.value = val;
  if (state.isPlayerReady && state.ytPlayer) {
    state.ytPlayer.setVolume(val);
    if (val > 0 && state.isMuted) {
      toggleMute();
    }
  }
}

function toggleMute() {
  state.isMuted = !state.isMuted;
  if (state.isPlayerReady && state.ytPlayer) {
    if (state.isMuted) {
      state.ytPlayer.mute();
      volHighIcon.style.display = 'none';
      volMuteIcon.style.display = 'block';
    } else {
      state.ytPlayer.unMute();
      volHighIcon.style.display = 'block';
      volMuteIcon.style.display = 'none';
    }
  }
}

// ==========================================================================
// Progress Tracker & Seek
// ==========================================================================

function formatTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function startProgressTracker() {
  stopProgressTracker();
  state.progressInterval = setInterval(() => {
    if (!state.isSeeking && state.isPlayerReady && state.ytPlayer) {
      const current = state.ytPlayer.getCurrentTime() || 0;
      const duration = state.ytPlayer.getDuration() || 0;
      
      currentTimeEl.textContent = formatTime(current);
      if (duration > 0) {
        totalDurationEl.textContent = formatTime(duration);
        const percent = (current / duration) * 100;
        seekProgressEl.style.width = `${percent}%`;
        seekHandleEl.style.left = `${percent}%`;
        seekBarEl.setAttribute('aria-valuenow', Math.round(percent));

        // Seamless auto-advance guarantee: if video reaches within 0.5s of end
        if (duration > 5 && current >= duration - 0.5 && !state.isAutoAdvancing) {
          state.isAutoAdvancing = true;
          stopProgressTracker();
          console.log('Reached track end threshold. Auto-playing next track...');
          playNextTrack();
          setTimeout(() => {
            state.isAutoAdvancing = false;
          }, 2000);
        }
      }
    }
  }, 250);
}

function stopProgressTracker() {
  if (state.progressInterval) {
    clearInterval(state.progressInterval);
    state.progressInterval = null;
  }
}

function handleSeekClick(e) {
  if (!state.isPlayerReady || !state.ytPlayer) return;
  const rect = seekBarEl.getBoundingClientRect();
  const clickX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
  const percent = clickX / rect.width;
  const duration = state.ytPlayer.getDuration() || 0;

  if (duration > 0) {
    const targetTime = percent * duration;
    state.ytPlayer.seekTo(targetTime, true);
    seekProgressEl.style.width = `${percent * 100}%`;
    seekHandleEl.style.left = `${percent * 100}%`;
    currentTimeEl.textContent = formatTime(targetTime);
  }
}

// ==========================================================================
// UI Updates
// ==========================================================================

function updateUI() {
  const current = state.getCurrentTrack();
  if (!current) return;

  trackTitleEl.textContent = current.title;
  trackArtistEl.textContent = current.artist;
  trackArtworkEl.src = current.thumb || `https://img.youtube.com/vi/${current.id}/mqdefault.jpg`;
  totalDurationEl.textContent = current.duration || '0:00';

  queueBadgeEl.textContent = state.playlist.length;
  drawerSongCountEl.textContent = `${state.playlist.length} tracks`;

  updatePlayStateUI();
  renderPlaylistDrawer();
}

function updatePlayStateUI() {
  if (state.isPlaying) {
    playIcon.style.display = 'none';
    pauseIcon.style.display = 'block';
    vinylDiscEl.classList.add('playing');
  } else {
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
    vinylDiscEl.classList.remove('playing');
  }
}

function renderPlaylistDrawer() {
  playlistList.innerHTML = '';

  state.playlist.forEach((song, idx) => {
    const isCurrent = idx === state.currentIndex;
    const li = document.createElement('li');
    li.className = `playlist-item ${isCurrent ? 'active' : ''}`;
    
    // Check if custom song (can be deleted)
    const isDefault = DEFAULT_PLAYLIST.some(d => d.id === song.id);

    li.innerHTML = `
      <div class="item-thumb-wrap">
        <img class="item-thumb" src="${song.thumb}" alt="${song.title}" loading="lazy" />
        ${isCurrent && state.isPlaying ? `
          <div class="item-equalizer">
            <span class="eq-bar"></span>
            <span class="eq-bar"></span>
            <span class="eq-bar"></span>
          </div>
        ` : ''}
      </div>
      <div class="item-info">
        <div class="item-title">${song.title}</div>
        <div class="item-artist">${song.artist}</div>
      </div>
      <div class="item-actions">
        ${!isDefault ? `
          <button class="item-delete-btn" data-delete-idx="${idx}" title="Remove track">✕</button>
        ` : ''}
      </div>
    `;

    li.addEventListener('click', (e) => {
      // Don't trigger play if clicked delete button
      if (e.target.closest('.item-delete-btn')) return;
      playTrackAtIndex(idx, true);
    });

    const delBtn = li.querySelector('.item-delete-btn');
    if (delBtn) {
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeTrackAtIndex(idx);
      });
    }

    playlistList.appendChild(li);
  });
}

function removeTrackAtIndex(idx) {
  if (state.playlist.length <= 1) {
    showToast('Playlist must contain at least 1 track');
    return;
  }
  const removed = state.playlist.splice(idx, 1)[0];
  state.savePlaylist();
  
  if (idx === state.currentIndex) {
    state.currentIndex = Math.min(idx, state.playlist.length - 1);
    playTrackAtIndex(state.currentIndex, state.isPlaying);
  } else if (idx < state.currentIndex) {
    state.currentIndex--;
  }

  updateUI();
  showToast(`Removed "${removed.title}"`);
}

// ==========================================================================
// Add YouTube Video / Playlist Logic
// ==========================================================================

function extractYouTubeId(urlOrId) {
  const trimmed = urlOrId.trim();
  
  // 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  // youtu.be/<id>
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];

  // youtube.com/watch?v=<id>
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];

  // youtube.com/embed/<id>
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];

  // youtube.com/shorts/<id>
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
  if (shortsMatch) return shortsMatch[1];

  return null;
}

function extractPlaylistId(url) {
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

async function handleAddSong(e) {
  e.preventDefault();
  const inputUrl = ytUrlInput.value.trim();
  if (!inputUrl) return;

  const submitBtn = document.getElementById('submitAddBtn');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<span>Adding...</span>';
  submitBtn.disabled = true;

  try {
    const videoId = extractYouTubeId(inputUrl);
    const playlistId = extractPlaylistId(inputUrl);

    if (playlistId && !videoId) {
      // Playlist added
      if (state.isPlayerReady && state.ytPlayer) {
        state.ytPlayer.loadPlaylist({
          list: playlistId,
          listType: 'playlist'
        });
        showToast('Loaded YouTube Playlist!');
        closeModal();
        return;
      }
    }

    if (!videoId) {
      showToast('Invalid YouTube URL or Video ID');
      return;
    }

    // Try fetching title via oEmbed
    let title = customTitleInput.value.trim();
    let artist = customArtistInput.value.trim();

    if (!title) {
      try {
        const res = await fetch(`https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`);
        const data = await res.json();
        if (data && data.title) {
          title = data.title;
          if (!artist && data.author_name) {
            artist = data.author_name;
          }
        }
      } catch (err) {
        console.warn('oEmbed fetch error', err);
      }
    }

    const newSong = {
      id: videoId,
      title: title || `Ganesh Song (${videoId})`,
      artist: artist || 'YouTube Track',
      duration: '4:00',
      thumb: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    };

    state.playlist.push(newSong);
    state.savePlaylist();

    updateUI();
    showToast(`Added "${newSong.title}" to playlist!`);
    
    // Play immediately
    playTrackAtIndex(state.playlist.length - 1, true);

    addSongForm.reset();
    closeModal();
  } catch (err) {
    console.error(err);
    showToast('Failed to add track');
  } finally {
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
  }
}

function openModal() {
  addModal.classList.add('open');
  ytUrlInput.focus();
}

function closeModal() {
  addModal.classList.remove('open');
  addSongForm.reset();
}

// ==========================================================================
// Subtle Festive Canvas Particles (Gulal & Petals)
// ==========================================================================

class ParticleSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.isEnabled = true;
    this.animationFrame = null;
    this.colors = [
      'rgba(255, 152, 0, 0.65)',   // Saffron
      'rgba(255, 193, 7, 0.7)',    // Golden yellow
      'rgba(233, 30, 99, 0.55)',   // Festive pink / Gulal
      'rgba(244, 67, 54, 0.6)',    // Vermilion / Sindoor
      'rgba(255, 235, 59, 0.6)'    // Bright yellow
    ];

    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.initParticles(35);
    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  initParticles(count) {
    this.particles = [];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        size: Math.random() * 5 + 2,
        speedY: Math.random() * 0.8 + 0.3,
        speedX: (Math.random() - 0.5) * 0.6,
        color: this.colors[Math.floor(Math.random() * this.colors.length)],
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.04
      });
    }
  }

  toggle() {
    this.isEnabled = !this.isEnabled;
    this.canvas.style.display = this.isEnabled ? 'block' : 'none';
    toggleParticlesBtn.classList.toggle('active', this.isEnabled);
    showToast(this.isEnabled ? 'Festive sparkles enabled' : 'Festive sparkles hidden');
  }

  animate() {
    if (this.isEnabled) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      
      for (const p of this.particles) {
        p.y += p.speedY;
        p.x += Math.sin(p.angle) * 0.5 + p.speedX;
        p.angle += p.spin;

        if (p.y > this.canvas.height + 10) {
          p.y = -10;
          p.x = Math.random() * this.canvas.width;
        }

        this.ctx.save();
        this.ctx.translate(p.x, p.y);
        this.ctx.rotate(p.angle);
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        // Draw delicate marigold petal shape
        this.ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
      }
    }
    this.animationFrame = requestAnimationFrame(() => this.animate());
  }
}

// ==========================================================================
// Event Listeners Setup
// ==========================================================================

function setupEventListeners() {
  // Playback Controls
  playBtn.addEventListener('click', togglePlayPause);
  nextBtn.addEventListener('click', playNextTrack);
  prevBtn.addEventListener('click', playPrevTrack);
  shuffleBtn.addEventListener('click', toggleShuffle);
  muteBtn.addEventListener('click', toggleMute);

  volumeSlider.addEventListener('input', (e) => {
    setVolume(Number(e.target.value));
  });

  // Seek bar
  seekBarEl.addEventListener('click', handleSeekClick);
  let isDragging = false;
  seekBarEl.addEventListener('mousedown', (e) => {
    isDragging = true;
    state.isSeeking = true;
    handleSeekClick(e);
  });
  window.addEventListener('mousemove', (e) => {
    if (isDragging) handleSeekClick(e);
  });
  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      state.isSeeking = false;
    }
  });

  // Vinyl click opens YouTube video in new tab
  document.getElementById('vinylContainer').addEventListener('click', () => {
    const track = state.getCurrentTrack();
    if (track && track.id) {
      window.open(`https://www.youtube.com/watch?v=${track.id}`, '_blank');
    }
  });

  // Drawer
  openPlaylistBtn.addEventListener('click', () => {
    playlistDrawer.classList.add('open');
  });
  closePlaylistBtn.addEventListener('click', () => {
    playlistDrawer.classList.remove('open');
  });
  drawerAddBtn.addEventListener('click', () => {
    playlistDrawer.classList.remove('open');
    openModal();
  });

  resetPlaylistBtn.addEventListener('click', () => {
    if (confirm('Reset to default 8 OG Ganesh Chaturthi tracks?')) {
      state.playlist = [...DEFAULT_PLAYLIST];
      state.savePlaylist();
      state.currentIndex = 0;
      playTrackAtIndex(0, state.isPlaying);
      showToast('Reset to default OG Playlist');
    }
  });

  // Add Modal
  openAddModalBtn.addEventListener('click', openModal);
  closeAddModalBtn.addEventListener('click', closeModal);
  cancelAddBtn.addEventListener('click', closeModal);
  addSongForm.addEventListener('submit', handleAddSong);

  // Quick Chips in modal
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      ytUrlInput.value = btn.dataset.url;
      customTitleInput.value = btn.dataset.title || '';
      customArtistInput.value = btn.dataset.artist || '';
    });
  });

  // Close modal when clicking on backdrop
  addModal.addEventListener('click', (e) => {
    if (e.target === addModal) closeModal();
  });

  // Fullscreen
  toggleFullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        showToast('Fullscreen not supported');
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  });

  // Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    // Don't trigger if typing in modal input
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;

    if (e.code === 'Space') {
      e.preventDefault();
      togglePlayPause();
    } else if (e.code === 'ArrowRight') {
      e.preventDefault();
      playNextTrack();
    } else if (e.code === 'ArrowLeft') {
      e.preventDefault();
      playPrevTrack();
    } else if (e.code === 'KeyM') {
      e.preventDefault();
      toggleMute();
    } else if (e.code === 'KeyF') {
      e.preventDefault();
      toggleFullscreenBtn.click();
    }
  });
}

// ==========================================================================
// Initialization
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Canvas Particles
  const canvas = document.getElementById('festiveCanvas');
  const particleSystem = new ParticleSystem(canvas);
  toggleParticlesBtn.addEventListener('click', () => particleSystem.toggle());

  // Setup UI and Events
  updateUI();
  setupEventListeners();

  // Load YouTube Player
  initYouTubeAPI();
});
