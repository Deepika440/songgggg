import { supabase } from './supabase.js';

const songForm = document.getElementById('songForm');
const formTitle = document.getElementById('formTitle');
const submitBtn = document.getElementById('submitBtn');
const cancelBtn = document.getElementById('cancelBtn');
const songsTableBody = document.getElementById('songsTableBody');

const idInput = document.getElementById('songId');
const titleInput = document.getElementById('title');
const artistInput = document.getElementById('artist');
const albumInput = document.getElementById('album');
const coverUrlInput = document.getElementById('cover_url');
const audioUrlInput = document.getElementById('audio_url');

let songs = [];

async function fetchSongs() {
    const { data, error } = await supabase.from('songs').select('*').order('created_at', { ascending: false });
    if (error) {
        console.error('Error fetching songs:', error);
        return;
    }
    songs = data;
    renderTable();
}

function renderTable() {
    songsTableBody.innerHTML = '';
    songs.forEach(song => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><img src="${song.cover_url}" alt="Cover" onerror="this.src='https://via.placeholder.com/40'"></td>
            <td>${song.title}</td>
            <td>${song.artist}</td>
            <td class="action-btns">
                <button class="edit-btn" onclick="editSong('${song.id}')" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="delete-btn" onclick="deleteSong('${song.id}')" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;
        songsTableBody.appendChild(tr);
    });
}

songForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const songData = {
        title: titleInput.value,
        artist: artistInput.value,
        album: albumInput.value,
        cover_url: coverUrlInput.value,
        audio_url: audioUrlInput.value
    };

    const id = idInput.value;

    if (id) {
        // Update
        const { error } = await supabase.from('songs').update(songData).eq('id', id);
        if (error) alert('Error updating song: ' + error.message);
        else resetForm();
    } else {
        // Insert
        const { error } = await supabase.from('songs').insert([songData]);
        if (error) alert('Error adding song: ' + error.message);
        else resetForm();
    }
    
    fetchSongs();
});

window.editSong = (id) => {
    const song = songs.find(s => s.id === id);
    if (!song) return;
    
    formTitle.textContent = 'Edit Song';
    submitBtn.textContent = 'Update Song';
    cancelBtn.classList.remove('hidden');
    
    idInput.value = song.id;
    titleInput.value = song.title;
    artistInput.value = song.artist;
    albumInput.value = song.album;
    coverUrlInput.value = song.cover_url;
    audioUrlInput.value = song.audio_url;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.deleteSong = async (id) => {
    if (confirm('Are you sure you want to delete this song?')) {
        const { error } = await supabase.from('songs').delete().eq('id', id);
        if (error) alert('Error deleting song: ' + error.message);
        else fetchSongs();
    }
};

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    songForm.reset();
    idInput.value = '';
    formTitle.textContent = 'Add New Song';
    submitBtn.textContent = 'Add Song';
    cancelBtn.classList.add('hidden');
}

// Initial fetch
fetchSongs();
