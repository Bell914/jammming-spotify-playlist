# Feature Request: Hide tracks already in the playlist

## Summary

When a user searches for music, Jammming should hide any track that is already
in the current playlist. This prevents accidental duplicate tracks and makes
the search results easier to scan.

## User story

As a playlist creator, I want search results to exclude songs I have already
added, so that I can build a playlist without adding the same song twice.

## Requirements

- Search results must be compared with the current playlist whenever either
  list changes.
- A track is considered the same track when its Spotify `id` matches an item
  already in the playlist.
- Tracks removed from the playlist must appear in the search results again.
- The existing **Add** and **Remove** controls must continue to work.
- If every result has already been added, show a clear empty-state message.

## Technical design

`App` owns both `searchResults` and `playlistTracks` state. It will derive a
new `availableResults` array before rendering `TrackList`:

```ts
const playlistIds = new Set(playlistTracks.map((track) => track.id));
const availableResults = searchResults.filter(
  (track) => !playlistIds.has(track.id)
);
```

`availableResults` is passed to the search-results `TrackList`, while the
playlist `TrackList` still receives `playlistTracks`. Using a `Set` keeps the
membership check efficient and avoids storing duplicated, derived state.

## Edge cases

- Two recordings with the same title but different Spotify IDs are distinct and
  must both remain available.
- A user may remove a song and immediately add it back from the results.
- Search errors and an empty search response should keep their existing
  messages; the “already added” empty state is shown only when filtering
  removes all otherwise valid results.

## Testing plan

1. Search for a track and add it to the playlist.
2. Confirm that the added track disappears from search results.
3. Remove that track from the playlist.
4. Confirm that it is shown in search results again.
5. Add every listed result and confirm the empty-state message is clear.

## Why this approach

The feature needs no new API request and no duplicated state. Deriving the
visible list from the authoritative search and playlist state makes the UI
consistent after every add or remove operation.
