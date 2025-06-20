// Storage for feed posts/likes and helpers
const FEED_KEY = "checkmates-feedposts-v1";
const LIKES_KEY = "checkmates-feedlikes-v1";

// PUBLIC_INTERFACE
export function loadFeed() {
  try {
    const posts = JSON.parse(localStorage.getItem(FEED_KEY));
    return Array.isArray(posts) ? posts : null;
  } catch {
    return null;
  }
}

// PUBLIC_INTERFACE
export function saveFeed(posts) {
  localStorage.setItem(FEED_KEY, JSON.stringify(posts));
}

// PUBLIC_INTERFACE
export function loadLikes() {
  try {
    const likes = JSON.parse(localStorage.getItem(LIKES_KEY));
    return typeof likes === "object" && likes !== null ? likes : {};
  } catch {
    return {};
  }
}

// PUBLIC_INTERFACE
export function saveLikes(likes) {
  localStorage.setItem(LIKES_KEY, JSON.stringify(likes));
}

/**
 * PUBLIC_INTERFACE
 * Sanitizes a caption by trimming to 350 chars and removing vulnerable HTML tags.
 * Prevents XSS and code injection by stripping markup.
 */
export function sanitizeCaption(txt) {
  // Replace common HTML and potentially dangerous chars to prevent injection
  const safe = String(txt)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/script/gi, "")
    .slice(0, 350);
  return safe;
}
