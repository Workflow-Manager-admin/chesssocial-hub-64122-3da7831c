import React, { useState, useEffect, useRef } from "react";
import { loadFeed, saveFeed, loadLikes, saveLikes, sanitizeCaption } from "./utils";
import EmojiBurst from "./EmojiBurst";
import ConfettiBurst from "./Confetti";

/**
 * NEW: Meme-style placeholder feed posts (9) + glowing chess invite post (special at index 4).
 * All images are meme/viral style, fit for a chess social app.
 */
const MEME_URLS = [
  "https://i.imgflip.com/30b1gx.jpg",   // Distracted boyfriend
  "https://i.imgflip.com/1bij.jpg",     // Drake hotline bling
  "https://i.imgflip.com/2fm6x.jpg",    // Expanding brain
  "https://i.imgflip.com/26am.jpg",     // Grumpy cat
  "https://i.imgflip.com/6w2np6.jpg",   // Memedog "Much wow"
  "https://i.imgur.com/0vYyRFn.jpg",    // Chessboard meme "He blundered a piece!"
  "https://i.imgflip.com/3si4.jpg",     // Success Kid
  "https://i.imgflip.com/9ehk.jpg",     // Futurama Fry
  "https://i.imgur.com/vxFjEcR.png",    // Surprised Pikachu
];
// 9 meme posts; #5 is a glowing, featured Chess Arena invite
const DEFAULT_POSTS = [
  {
    img: MEME_URLS[0],
    caption: "Opponent: Resigns miserably.\nMe: Still blunders mate in 1 anyway.",
    by: "ChessNoob420",
    time: Date.now() - 1000 * 60 * 60 * 1.8
  },
  {
    img: MEME_URLS[1],
    caption: "Drake: Developing pieces? Nah. Scholars' Mate? YES.",
    by: "TacticFanboy",
    time: Date.now() - 1000 * 60 * 60 * 3.2
  },
  {
    img: MEME_URLS[2],
    caption: "My coach: Control the center!\nMe: Fianchettos both bishops and prays.",
    by: "BlunderBeast",
    time: Date.now() - 1000 * 60 * 60 * 5
  },
  {
    img: MEME_URLS[3],
    caption: "Grumpy cat hates endgames — and so do I.",
    by: "CatNapper",
    time: Date.now() - 1000 * 60 * 60 * 7.9
  },
  // ---- Glowing chess invite (#5) ----
  {
    img: "__CHESS_INVITE__",
    caption: "👑 Enter the Chess Arena! A new challenger appears…",
    by: "CheckMates",
    time: Date.now() - 1000 * 60 * 60 * 12
  },
  {
    img: MEME_URLS[4],
    caption: "Much wow, such gambit. Lost on time tho.",
    by: "DoggoChess",
    time: Date.now() - 1000 * 60 * 60 * 16.2
  },
  {
    img: MEME_URLS[5],
    caption: "He blundered a piece, so I celebrated with a queen sacrifice.",
    by: "Underpromoted",
    time: Date.now() - 1000 * 60 * 60 * 19.6
  },
  {
    img: MEME_URLS[6],
    caption: "Finally checkmated someone by underpromoting to a knight.",
    by: "PawnStar",
    time: Date.now() - 1000 * 60 * 60 * 22.5
  },
  {
    img: MEME_URLS[7],
    caption: "Not sure if opponent is a genius or just mouse-slipped.",
    by: "FryMorales",
    time: Date.now() - 1000 * 60 * 60 * 28
  }
];

// Easter egg settings
const EASTER_EGG_KEYWORD = "chess";
const CHECKMATE_KEYWORD = "checkmate";

function timeAgo(time) {
  const delta = Math.floor((Date.now() - time) / 1000);
  if (delta < 60) return "just now";
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 3600 * 24) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 3600 / 24)}d ago`;
}

/**
 * ChessInvitePost: Memey glowing, featured, visual stand-out card for Chess Arena.
 * - Shows a '✨ Featured' label with crown
 * - Has a glow effect always
 * - Calls parent's onArenaPortal and notifyArenaPortal prop on click
 */
function ChessInvitePost({ onInvite, glitch }) {
  return (
    <div
      tabIndex="0"
      className={
        "social-feed-card social-feed-invite" +
        (glitch ? " social-feed-invite-glitch" : "")
      }
      title="Enter the Chess Arena"
      onClick={onInvite}
      onKeyDown={e => ["Enter", " "].includes(e.key) && onInvite()}
      style={{
        boxShadow:
          "0 0 48px 8px var(--accent), 0 0 16px 2px var(--primary)",
        border: "2.7px solid var(--accent)",
        minHeight: 144,
        alignItems: "center",
        display: "flex",
        justifyContent: "center",
        position: "relative",
        cursor: "pointer",
        overflow: "visible"
      }}
    >
      {/* Featured badge */}
      <div
        style={{
          position: "absolute",
          top: 12,
          left: 16,
          background: "rgba(255,245,205,0.92)",
          color: "#db880a",
          fontWeight: "bold",
          fontSize: "1.02em",
          borderRadius: 8,
          padding: "3px 10px 3px 7px",
          boxShadow: "0 2px 8px -3px #f6c760",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: 6
        }}
      >
        <span role="img" aria-label="crown" style={{marginRight:2}}>👑</span>
        <span>Featured</span>
      </div>
      <div style={{ width: "100%", textAlign: "center" }}>
        <div style={{ fontSize: "2.2em", marginBottom: 0 }}>
          <span role="img" aria-label="portal">🌀</span>
        </div>
        <span style={{ fontWeight: "800", fontSize: "1.25em", letterSpacing: "0.01em" }}>
          Enter the Chess Arena!
        </span>
        <div
          style={{
            marginTop: 12,
            fontSize: "1.07em",
            fontWeight: 500,
            opacity: 0.96,
            padding: 1
          }}
        >
          <span role="img" aria-label="sparkles">✨</span>
          {" "}Step up your game. Challenge minds, not just pawns!{" "}
          <span role="img" aria-label="sparkles">✨</span>
        </div>
      </div>
    </div>
  );
}

// Retain original PortalPost for any future use or narrative (infinite scroll)
function PortalPost({ onEnterArena, glitch }) {
  return (
    <div
      tabIndex="0"
      className={
        "social-feed-card social-feed-invite" +
        (glitch ? " social-feed-invite-glitch" : "")
      }
      title="Enter the Chess Arena"
      onClick={onEnterArena}
      onKeyDown={e => ["Enter", " "].includes(e.key) && onEnterArena()}
      style={{
        boxShadow: glitch
          ? "0 0 33px 0 var(--accent), 0 0 18px 2px var(--primary)"
          : undefined,
        cursor: "pointer",
        minHeight: 110,
        alignItems: "center",
        display: "flex",
        justifyContent: "center"
      }}
    >
      <div style={{ width: "100%", textAlign: "center" }}>
        <span style={{ fontSize: "1.13rem" }}>
          <span role="img" aria-label="portal" style={{ marginRight: 5 }}>
            🌀{" "}
          </span>
          <span style={{ fontWeight: "700" }}>
            {glitch ? "🪐 Welcome to CheckMates Arena 🪐"
              : "Chess Portal: Click to enter the Arena" }
          </span>
        </span>
        <div
          style={{
            marginTop: 7,
            opacity: 0.85,
            fontSize: "0.96rem",
            letterSpacing: "0.02em"
          }}
        >
          {glitch ? "You're deeper into the void… but can you think ahead?" : "Step through and challenge the AI bots"}
        </div>
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
export default function SocialFeed({ onArenaPortal, notifyArenaPortal }) {
  const [posts, setPosts] = useState(() => loadFeed() || [...DEFAULT_POSTS]);
  const [likes, setLikes] = useState(() => loadLikes());
  const [caption, setCaption] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [emojiBurstIdx, setEmojiBurstIdx] = useState(-1);
  const [confetti, setConfetti] = useState(false);
  const [feedAnimIdx, setFeedAnimIdx] = useState(null);
  const [feedOffset, setFeedOffset] = useState(7);
  const [loadingMore, setLoadingMore] = useState(false);
  const [checkmateFilter, setCheckmateFilter] = useState(false);
  const [portalGlitch, setPortalGlitch] = useState(false);
  const lastPostRef = useRef();

  // Infinite scroll behavior
  useEffect(() => {
    function onScroll() {
      if (
        window.innerHeight + window.scrollY >
        (document.body.offsetHeight - 220)
      ) {
        loadMorePosts();
      }
    }
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
    // eslint-disable-next-line
  }, [feedOffset, posts, checkmateFilter]);

  useEffect(() => {
    // Easter egg: if the user posts a caption with "chess", trigger confetti and filter
    if (
      caption.toLowerCase().includes(EASTER_EGG_KEYWORD) &&
      confetti === false
    ) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1200);
    }
    // Checkmate easter egg: monochrome swirl form background
    if (caption.toLowerCase().includes(CHECKMATE_KEYWORD)) {
      setCheckmateFilter(true);
    } else {
      setCheckmateFilter(false);
    }
  }, [caption, confetti]);

  // Glitch the portal invite after user scrolls past the feed (narrative effect)
  useEffect(() => {
    if (feedOffset > DEFAULT_POSTS.length * 0.7 && !portalGlitch) {
      // After the user scrolls/feed-more, "glitch" the portal card
      setTimeout(() => setPortalGlitch(true), 330);
    }
  }, [feedOffset, portalGlitch]);

  // Animated drop-in effect on new posts
  useEffect(() => {
    if (feedAnimIdx !== null) {
      const t = setTimeout(() => setFeedAnimIdx(null), 700);
      return () => clearTimeout(t);
    }
  }, [feedAnimIdx]);

  // Save posts/likes on change
  useEffect(() => {
    saveFeed(posts);
    saveLikes(likes);
  }, [posts, likes]);

  function submitPost(e) {
    e.preventDefault();
    if (!caption.trim()) {
      return;
    }
    const isEgg = caption.toLowerCase().includes(EASTER_EGG_KEYWORD);
    const isMate = caption.toLowerCase().includes(CHECKMATE_KEYWORD);
    const newPost = {
      img: imgUrl ||
        "https://images.pexels.com/photos/1329296/pexels-photo-1329296.jpeg?auto=compress&w=500",
      caption: sanitizeCaption(caption),
      by: "You",
      time: Date.now(),
      egg: isEgg,
      mate: isMate
    };
    setPosts([newPost, ...posts]);
    setFeedAnimIdx(-1); // for your own new post animation
    setTimeout(() => setFeedAnimIdx(0), 18);
    setCaption("");
    setImgUrl("");
    // Easter egg confetti!
    if (isEgg) setConfetti(true);
    setTimeout(() => setConfetti(false), 1533);
  }

  // Show only up to N posts for "infinite" scroll
  const visiblePosts = posts
    .filter((p) => !(p.img === "__INVITE_PORTAL__")) // hide portal for sort
    .concat(posts.find((p) => p.img === "__INVITE_PORTAL__") ? [posts.find((p) => p.img === "__INVITE_PORTAL__")] : [])
    .slice(0, feedOffset)
    .filter(p =>
      checkmateFilter
        ? p.caption.toLowerCase().includes(CHECKMATE_KEYWORD)
        : true
    );

  // Like button interaction
  function handleLike(idx) {
    setLikes((old) => {
      const newer = { ...old, [idx]: !old[idx] };
      return newer;
    });
    setEmojiBurstIdx(idx);
    setTimeout(() => setEmojiBurstIdx(-1), 620);
  }

  // Infinite scroll - simulate load more
  function loadMorePosts() {
    if (!loadingMore && feedOffset < posts.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setFeedOffset((c) => Math.min(c + 3, posts.length));
        setLoadingMore(false);
      }, 650);
    }
  }

  // Portal post triggers Chess Arena tab
  function handlePortalClick() {
    if (typeof notifyArenaPortal === "function") notifyArenaPortal();
    if (typeof onArenaPortal === "function") onArenaPortal();
  }

  return (
    <div>
      <ConfettiBurst trigger={confetti} />
      <form
        className={
          "social-feed-form " +
          (checkmateFilter ? "social-feed-form-easteregg" : "")
        }
        onSubmit={submitPost}
        autoComplete="off"
        style={{
          marginTop: 16,
          boxShadow: confetti
            ? "0 0 23px 0 var(--highlight)"
            : undefined,
          transition: "box-shadow 0.2s"
        }}
      >
        <input
          className={
            "social-feed-input-caption" +
            (checkmateFilter ? " social-feed-input-easteregg" : "")
          }
          placeholder={
            checkmateFilter
              ? "🖤 'checkmate' detected! The void expands... Post anyway?"
              : "Write your move, share your mood (type 'chess' or 'checkmate' for a surprise)"
          }
          maxLength={350}
          value={caption}
          onChange={e => setCaption(e.target.value)}
        />
        <input
          className="social-feed-input-caption"
          placeholder="Paste an image URL (optional)..."
          type="url"
          value={imgUrl}
          onChange={e => setImgUrl(e.target.value)}
          style={{ marginTop: 0, marginBottom: 9 }}
        />
        <button className="social-feed-button" type="submit">
          Post
        </button>
      </form>

      <div className="social-feed-grid">
        {visiblePosts.map((p, idx) => {
          // Render the special ChessInvitePost at post 5 (index 4)
          if (p.img === "__CHESS_INVITE__")
            return (
              <ChessInvitePost
                key="chess-invite"
                glitch={portalGlitch}
                onInvite={handlePortalClick}
              />
            );
          // For any old narrative portal post fallback (not typical in new meme feed, but preserved for narrative effect)
          if (p.img === "__INVITE_PORTAL__")
            return (
              <PortalPost
                key="portal-invite"
                glitch={portalGlitch}
                onEnterArena={handlePortalClick}
              />
            );
          // Card animation/easter eggs
          const animateDrop =
            feedAnimIdx !== null
              ? (feedAnimIdx === -1 && idx === 0) ||
                (feedAnimIdx === 0 && idx === 0)
              : false;
          return (
            <div
              key={idx}
              className={
                "social-feed-card " +
                (p.mate || checkmateFilter ? "social-feed-monochrome " : "") +
                (animateDrop
                  ? "social-feed-dropin"
                  : "")
              }
              ref={
                idx === visiblePosts.length - 1
                  ? lastPostRef
                  : undefined
              }
            >
              <img
                className="social-feed-img"
                src={p.img}
                alt={p.caption}
                style={{ userSelect: "none", pointerEvents: "none" }}
                draggable={false}
              />
              <div className="social-feed-card-caption">
                {p.caption}
              </div>
              <div className="social-feed-meta">
                {p.by} &middot; {timeAgo(p.time)}
              </div>
              <button
                className={
                  "social-feed-like-btn" +
                  (likes[idx] ? " liked" : "")
                }
                aria-label={
                  likes[idx]
                    ? "Unlike post"
                    : "Like post"
                }
                onClick={() => handleLike(idx)}
                type="button"
                tabIndex={0}
              >
                <span role="img" aria-label="heart">
                  {likes[idx] ? "💚" : "🤍"}
                </span>
                <EmojiBurst
                  emoji="💖"
                  show={emojiBurstIdx === idx}
                />
              </button>
            </div>
          );
        })}
      </div>
      {loadingMore && (
        <div className="social-feed-loadmore">Loading more posts…</div>
      )}
    </div>
  );
}
