export type SpotifyTrack = { id: string; title: string; artist: string; album: string; uri: string };

const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined;
const redirectUri = (import.meta.env.VITE_SPOTIFY_REDIRECT_URI as string | undefined) || window.location.origin;
const scopes = ['playlist-modify-private', 'playlist-modify-public'];

function tokenFromUrl() {
  return new URLSearchParams(window.location.hash.slice(1)).get('access_token');
}

export const Spotify = {
  getAccessToken() {
    const token = tokenFromUrl();
    if (token) return token;
    if (!clientId) throw new Error('Add VITE_SPOTIFY_CLIENT_ID to a local .env file before connecting Spotify.');
    const url = new URL('https://accounts.spotify.com/authorize');
    url.search = new URLSearchParams({
      client_id: clientId,
      response_type: 'token',
      redirect_uri: redirectUri,
      scope: scopes.join(' '),
    }).toString();
    window.location.assign(url.toString());
    return null;
  },
  async search(term: string): Promise<SpotifyTrack[]> {
    const token = this.getAccessToken();
    if (!token) return [];
    const response = await fetch(`https://api.spotify.com/v1/search?type=track&limit=20&q=${encodeURIComponent(term)}`, { headers: { Authorization: `Bearer ${token}` } });
    if (!response.ok) throw new Error('Spotify search failed.');
    const data = await response.json();
    return data.tracks.items.map((track: any) => ({ id: track.id, title: track.name, artist: track.artists.map((artist: any) => artist.name).join(', '), album: track.album.name, uri: track.uri }));
  },
  async savePlaylist(name: string, uris: string[]) {
    const token = this.getAccessToken();
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const profile = await fetch('https://api.spotify.com/v1/me', { headers });
    if (!profile.ok) throw new Error('Could not read your Spotify profile.');
    const { id: userId } = await profile.json();
    const created = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, { method: 'POST', headers, body: JSON.stringify({ name }) });
    if (!created.ok) throw new Error('Could not create the Spotify playlist.');
    const playlist = await created.json();
    const tracks = await fetch(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, { method: 'POST', headers, body: JSON.stringify({ uris }) });
    if (!tracks.ok) throw new Error('Could not add tracks to the Spotify playlist.');
  },
};
