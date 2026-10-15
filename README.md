# Jammming

Jammming is a React playlist builder inspired by the Codecademy portfolio project. It lets a user search a local sample library, add and remove tracks, rename a playlist, and prepare a playlist for Spotify export.

## Technologies

- React 19
- TypeScript
- Vite
- CSS

## Features

- Filter tracks by title, artist, or album
- Add or remove tracks from a custom playlist
- Rename the playlist
- Validate that a playlist has tracks before saving

## Spotify integration

The UI uses mock tracks so it can run without private credentials. To export to a real Spotify account, add a Spotify developer Client ID and implement OAuth authorization plus the Spotify Web API calls.

## Run locally

```bash
npm install
npm run dev
```

## Future work

- Add Spotify OAuth with PKCE
- Fetch real search results from Spotify
- Save playlists to the authenticated Spotify account
- Add tests for playlist interactions
