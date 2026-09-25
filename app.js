import { supabase } from './supabase.js';

let songs = [];
let currentSongIndex = -1;
let isPlaying = false;

const audioPlayer = document.getElementById('audioPlayer');
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const progressBar = document.getElementById('progressBar');
const progressWrapper = document.getElementById('progressWrapper');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const volumeSlider = document.getElementById('volumeSlider');
const nowPlayingSection = document.getElementById('nowPlayingSection');
const playerCover = document.getElementById('playerCover');
const playerTitle = document.getElementById('playerTitle');
const playerArtist = document.getElementById('playerArtist');
const searchInput = document.getElementById('searchInput');

async function fetchSongs() {
    const { data, error } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching songs:', error);
        return;
    }
    songs = data;
    renderSongs(songs);
}

function renderSongs(songsToRender) {
    const songsGrid = document.getElementById('songsGrid');
    songsGrid.innerHTML = '';

    if (songsToRender.length === 0) {
        songsGrid.innerHTML = '<p style="color: var(--text-secondary);">No songs found.</p>';
        return;
    }

    songsToRender.forEach((song, index) => {
        const card = document.createElement('div');
        card.className = `song-card ${currentSongIndex !== -1 && songs[currentSongIndex].id === song.id ? 'playing' : ''}`;
        
        // Find index in main array for playing
        const mainIndex = songs.findIndex(s => s.id === song.id);

        card.innerHTML = `
            <div class="cover-wrapper">
                <img src="${song.cover_url}" alt="${song.title} Cover" onerror="this.src='https://via.placeholder.com/150'">
                <div class="play-overlay">
                    <i class="fa-solid ${currentSongIndex !== -1 && songs[currentSongIndex].id === song.id && isPlaying ? 'fa-pause' : 'fa-play'}"></i>
                </div>
            </div>
            <div class="song-info">
                <div class="title">${song.title}</div>
                <div class="artist">${song.artist}</div>
            </div>
        `;

        card.addEventListener('click', () => playSong(mainIndex));
        songsGrid.appendChild(card);
    });
}

function playSong(index) {
    if (index < 0 || index >= songs.length) return;

    // If clicking same song, toggle play/pause
    if (currentSongIndex === index) {
        togglePlay();
        return;
    }

    currentSongIndex = index;
    const song = songs[index];
    
    audioPlayer.src = song.audio_url;
    audioPlayer.play();
    isPlaying = true;

    updatePlayerUI();
}

function togglePlay() {
    if (currentSongIndex === -1) return;

    if (isPlaying) {
        audioPlayer.pause();
    } else {
        audioPlayer.play();
    }
    isPlaying = !isPlaying;
    updatePlayerUI();
}

function updatePlayerUI() {
    if (currentSongIndex === -1) return;
    
    const song = songs[currentSongIndex];
    playerCover.src = song.cover_url;
    playerTitle.textContent = song.title;
    playerArtist.textContent = song.artist;

    playBtn.innerHTML = `<i class="fa-solid ${isPlaying ? 'fa-pause' : 'fa-play'}"></i>`;
    
    if (isPlaying) {
        nowPlayingSection.classList.add('is-playing');
    } else {
        nowPlayingSection.classList.remove('is-playing');
    }

    // Re-render grid to update active state
    renderSongs(searchInput.value ? filterSongs(searchInput.value) : songs);
}

function playNext() {
    if (songs.length === 0) return;
    let nextIndex = currentSongIndex + 1;
    if (nextIndex >= songs.length) nextIndex = 0;
    playSong(nextIndex);
}

function playPrev() {
    if (songs.length === 0) return;
    let prevIndex = currentSongIndex - 1;
    if (prevIndex < 0) prevIndex = songs.length - 1;
    playSong(prevIndex);
}

// Event Listeners
playBtn.addEventListener('click', togglePlay);
nextBtn.addEventListener('click', playNext);
prevBtn.addEventListener('click', playPrev);

audioPlayer.addEventListener('timeupdate', () => {
    const { currentTime, duration } = audioPlayer;
    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
        durationEl.textContent = formatTime(duration);
    }
});

audioPlayer.addEventListener('ended', playNext);

progressWrapper.addEventListener('click', (e) => {
    const width = progressWrapper.clientWidth;
    const clickX = e.offsetX;
    const duration = audioPlayer.duration;
    if (duration) {
        audioPlayer.currentTime = (clickX / width) * duration;
    }
});

volumeSlider.addEventListener('input', (e) => {
    audioPlayer.volume = e.target.value;
});

searchInput.addEventListener('input', (e) => {
    const term = e.target.value;
    renderSongs(filterSongs(term));
});

function filterSongs(term) {
    const lower = term.toLowerCase();
    return songs.filter(s => s.title.toLowerCase().includes(lower) || s.artist.toLowerCase().includes(lower));
}

function formatTime(seconds) {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Initial fetch
fetchSongs();
