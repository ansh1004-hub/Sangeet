export async function fetchTrackDetails(title, artist) {
  try {
    // Clean the search query so the URL doesn't break
    const query = encodeURIComponent(`${title} ${artist}`);

    // Ask iTunes for the top song matching the Gemini AI's recommendation
    const response = await fetch(
      `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`,
    );
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const track = data.results[0];
      return {
        // iTunes defaults to tiny 100px images. We swap the URL string to force 300px high-res!
        coverArt: track.artworkUrl100.replace("100x100bb", "300x300bb"),
        audioPreview: track.previewUrl,
      };
    }

    // Fallback just in case iTunes doesn't have the song
    return { coverArt: null, audioPreview: null };
  } catch (error) {
    console.error("iTunes API Error:", error);
    return { coverArt: null, audioPreview: null };
  }
}
