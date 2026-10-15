import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Spotify } from './spotify';
import './style.css';

type Track = { id: string; title: string; artist: string; album: string; uri: string };

const library: Track[] = [
  { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We’re Dreaming', uri: 'spotify:track:1' },
  { id: '2', title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', uri: 'spotify:track:2' },
  { id: '3', title: 'Electric Feel', artist: 'MGMT', album: 'Oracular Spectacular', uri: 'spotify:track:3' },
  { id: '4', title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', uri: 'spotify:track:4' },
];

function TrackRow({ track, action, label }: { track: Track; action: () => void; label: string }) {
  return <li className="track"><div><strong>{track.title}</strong><span>{track.artist} · {track.album}</span></div><button type="button" onClick={action} aria-label={`${label} ${track.title}`}>{label}</button></li>;
}

function App() {
  const [query, setQuery] = useState('');
  const [playlistName, setPlaylistName] = useState('My Jammming Playlist');
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [results, setResults] = useState<Track[]>(library);
  const [message, setMessage] = useState('Search the library to begin.');
  const addTrack = (track: Track) => setPlaylist(current => current.some(item => item.id === track.id) ? current : [...current, track]);
  const removeTrack = (id: string) => setPlaylist(current => current.filter(track => track.id !== id));
  const search = async () => {
    if (!query.trim()) return setMessage('Enter a song, artist, or album to search.');
    try {
      if (import.meta.env.VITE_SPOTIFY_CLIENT_ID) {
        const tracks = await Spotify.search(query);
        setResults(tracks);
        setMessage(`${tracks.length} matching Spotify track(s) found.`);
      } else {
        const tracks = library.filter(track => `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(query.toLowerCase()));
        setResults(tracks);
        setMessage(`${tracks.length} matching sample track(s) found. Add a Spotify Client ID to use live search.`);
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Spotify search failed.'); }
  };
  const savePlaylist = async () => {
    if (!playlist.length) return setMessage('Add at least one track before saving.');
    if (!import.meta.env.VITE_SPOTIFY_CLIENT_ID) return setMessage('Add your Spotify Client ID to a local .env file before saving.');
    try {
      await Spotify.savePlaylist(playlistName || 'Untitled playlist', playlist.map(track => track.uri));
      setPlaylist([]);
      setMessage(`Saved “${playlistName || 'Untitled playlist'}” to Spotify.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Spotify save failed.'); }
  };
  return <main>
    <header><p className="eyebrow">React playlist builder</p><h1>Jammming</h1><p>Find tracks, build a playlist, then export it to Spotify.</p></header>
    <section className="search" aria-label="Search songs"><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by song, artist, or album" /><button type="button" onClick={search}>Search</button></section>
    <p className="status" role="status">{message}</p>
    <section className="columns">
      <section className="panel"><h2>Search Results</h2><ul>{results.map(track => <TrackRow key={track.id} track={track} label="+" action={() => addTrack(track)} />)}</ul></section>
      <section className="panel"><input className="playlist-name" value={playlistName} onChange={e => setPlaylistName(e.target.value)} aria-label="Playlist name" /><ul>{playlist.length ? playlist.map(track => <TrackRow key={track.id} track={track} label="−" action={() => removeTrack(track.id)} />) : <li className="empty">Your playlist is empty.</li>}</ul><button className="save" type="button" onClick={savePlaylist}>Save to Spotify</button></section>
    </section>
  </main>;
}

createRoot(document.getElementById('app')!).render(<App />);
