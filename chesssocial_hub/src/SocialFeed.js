import React, { useState, useEffect, useRef } from "react";
import { loadLikes, saveLikes, sanitizeCaption } from "./utils";
import EmojiBurst from "./EmojiBurst";
import ConfettiBurst from "./Confetti";
import { fetchPosts, addPost, subscribeToPosts } from "./supabasePosts";

// Meme post images and default posts as before
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

// Time ago utility
function timeAgo(time) {
  const delta = Math.floor((Date.now() - time) / 1000);
  if (delta < 60) return "just now";
  if (delta < 3600) return `${Math.floor(delta / 60)}m ago`;
  if (delta < 3600 * 24) return `${Math.floor(delta / 3600)}h ago`;
  return `${Math.floor(delta / 3600 / 24)}d ago`;
}

// Chess Arena invite special card component
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
        overflow: "visible",
        marginBottom: 28
      }}
    >
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

export default function SocialFeed({ onArenaPortal, notifyArenaPortal }) {
  // Posts: fetched/shared via Supabase (not localStorage)
  const [posts, setPosts] = useState([...DEFAULT_POSTS]);
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

  // Modal/fab state
  const [showModal, setShowModal] = useState(false);
  const [fabName, setFabName] = useState("");
  const [fabCaption, setFabCaption] = useState("");
  const [fabImageUrl, setFabImageUrl] = useState("");
  const [fabImageUpload, setFabImageUpload] = useState(null);
  const [fabUploadingUrl, setFabUploadingUrl] = useState("");
  const [fabError, setFabError] = useState({});

  // Fetch posts from Supabase on mount, set up real-time subscription to changes
  useEffect(() => {
    let ignore = false;
    let sub;
    const initFeed = async () => {
      try {
        // Get latest posts (with fallback to DEFAULT_POSTS if table is empty)
        const cloudPosts = await fetchPosts({ limit: 40 });
        if (!ignore && cloudPosts?.length > 0) {
          setPosts(cloudPosts);
          setFeedOffset(7); // reset offset on full reload
        }
      } catch (_) {
        // fallback: leave DEFAULT_POSTS
      }
    };
    initFeed();

    // Subscribe to real-time post inserts from Supabase
    sub = subscribeToPosts({
      onInsert: (newPost) => {
        setPosts((prev) => {
          // Prevent duplicate posts (if manually inserted or our own quickly appears)
          if (prev.some((p) => p.time === newPost.time && p.img === newPost.img && p.caption === newPost.caption && p.by === newPost.by)) {
            return prev;
          }
          return [newPost, ...prev];
        });
        setFeedAnimIdx(-1);
        setTimeout(() => setFeedAnimIdx(0), 18);
      }
    });

    return () => {
      ignore = true;
      try {
        // Unsubscribe if channel exists
        if (sub && typeof sub.unsubscribe === "function") {
          sub.unsubscribe();
        }
      } catch (_) {}
    };
  }, []);

  // Infinite scroll - trigger next posts as user scrolls
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
    // "chess" in post confetti + filter
    if (
      caption.toLowerCase().includes("chess") &&
      confetti === false
    ) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 1200);
    }
    // "checkmate" for swirl effect
    if (caption.toLowerCase().includes("checkmate")) {
      setCheckmateFilter(true);
    } else {
      setCheckmateFilter(false);
    }
  }, [caption, confetti]);

  // Portal invite glitch after scrolling deep
  useEffect(() => {
    if (feedOffset > DEFAULT_POSTS.length * 0.7 && !portalGlitch) {
      setTimeout(() => setPortalGlitch(true), 330);
    }
  }, [feedOffset, portalGlitch]);
  // Animate new post drop-in
  useEffect(() => {
    if (feedAnimIdx !== null) {
      const t = setTimeout(() => setFeedAnimIdx(null), 700);
      return () => clearTimeout(t);
    }
  }, [feedAnimIdx]);
  // Persist likes to localStorage only
  useEffect(() => {
    saveLikes(likes);
  }, [likes]);

  // Modal auto-closes on post submit (legacy behavior)
  useEffect(() => {
    if (
      showModal &&
      caption === "" &&
      imgUrl === "" &&
      fabName === "" &&
      fabCaption === "" &&
      fabImageUrl === "" &&
      !fabImageUpload
    ) setShowModal(false);
    // eslint-disable-next-line
  }, [posts]);

  // Submit new post (desktop form)
  async function submitPost(e) {
    e.preventDefault();
    if (!caption.trim()) return;
    const egg = caption.toLowerCase().includes("chess");
    const mate = caption.toLowerCase().includes("checkmate");
    const newPost = {
      img: imgUrl ||
        "https://images.pexels.com/photos/1329296/pexels-photo-1329296.jpeg?auto=compress&w=500",
      caption: sanitizeCaption(caption),
      by: "You",
      time: Date.now(),
      egg,
      mate,
    };
    // Add to Supabase (persists for all users, triggers real-time)
    try {
      await addPost(newPost);
      setCaption("");
      setImgUrl("");
      if (egg) setConfetti(true);
      setTimeout(() => setConfetti(false), 1533);
    } catch (err) {
      // fallback: still display locally for demo (not persistent)
      setPosts((prev) => [newPost, ...prev]);
      setCaption("");
      setImgUrl("");
    }
  }

  // New FAB modal handlers
  function handleFabFileChange(e) {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setFabImageUpload(f);
      setFabUploadingUrl(URL.createObjectURL(f));
      setFabImageUrl("");
    } else {
      setFabImageUpload(null);
      setFabUploadingUrl("");
    }
  }
  function validateFab() {
    const err = {};
    if (!fabName.trim()) err.name = "Name is required!";
    if (fabImageUrl && fabImageUrl.trim() && !/^https?:\/\/.+/.test(fabImageUrl.trim())) err.img = "Enter a valid image URL (must start http/https)";
    if (fabImageUrl && fabImageUpload) err.img = "Choose either Image URL or upload a file, not both.";
    return err;
  }
  async function handleFabSubmit(e) {
    e.preventDefault();
    const err = validateFab();
    if (Object.keys(err).length > 0) {
      setFabError(err);
      return;
    }
    let imageToUse = "";
    if (fabImageUpload) {
      imageToUse = fabUploadingUrl;
    } else if (fabImageUrl && fabImageUrl.trim()) {
      imageToUse = fabImageUrl.trim();
    } else {
      imageToUse = "https://images.pexels.com/photos/1329296/pexels-photo-1329296.jpeg?auto=compress&w=500";
    }
    const newPost = {
      img: imageToUse,
      caption: fabCaption ? sanitizeCaption(fabCaption) : "",
      by: fabName.trim(),
      time: Date.now()
    };
    try {
      await addPost(newPost);
    } catch (err) {
      // fallback (local only)
      setPosts((prev) => [newPost, ...prev]);
    }
    setFeedAnimIdx(-1);
    setTimeout(() => setFeedAnimIdx(0), 18);
    setShowModal(false);
    setFabName("");
    setFabCaption("");
    setFabImageUrl("");
    setFabImageUpload(null);
    setFabUploadingUrl("");
    setFabError({});
  }

  // Easy: only show N posts for infinite scroll
  const visiblePosts = posts
    .filter((p) => !(p.img === "__INVITE_PORTAL__"))
    .concat(posts.find((p) => p.img === "__INVITE_PORTAL__") ? [posts.find((p) => p.img === "__INVITE_PORTAL__")] : [])
    .slice(0, feedOffset)
    .filter(p =>
      checkmateFilter
        ? p.caption && p.caption.toLowerCase().includes("checkmate")
        : true
    );

  function handleLike(idx) {
    setLikes((old) => ({ ...old, [idx]: !old[idx] }));
    setEmojiBurstIdx(idx);
    setTimeout(() => setEmojiBurstIdx(-1), 620);
  }

  // Infinite scroll offset changes based ONLY on how many posts are loaded; doesn't fetch more from supabase, since we read upfront
  function loadMorePosts() {
    if (!loadingMore && feedOffset < posts.length) {
      setLoadingMore(true);
      setTimeout(() => {
        setFeedOffset((c) => Math.min(c + 3, posts.length));
        setLoadingMore(false);
      }, 650);
    }
  }
  function handlePortalClick() {
    if (typeof notifyArenaPortal === "function") notifyArenaPortal();
    if (typeof onArenaPortal === "function") onArenaPortal();
  }

  // Card content with badge for default posts
  function CardContent({ p, idx, animateDrop, cardRef }) {
    const isDefault = DEFAULT_POSTS.some(
      d => d.caption === p.caption && d.by === p.by
    );
    return (
      <div
        className={
          "insta-feed-card " +
          (p.mate || checkmateFilter ? "social-feed-monochrome " : "") +
          (animateDrop ? "social-feed-dropin " : "")
        }
        ref={cardRef}
        style={{
          margin: "0 auto",
          marginBottom: 24,
          maxWidth: 430,
        }}
      >
        {/* Badge */}
        {isDefault && (
          <div
            className="insta-feed-badge"
            tabIndex={0}
            title="Default viral meme post (examples only)"
          >
            <span role="img" aria-label="badge">🥈</span>
            <span className="insta-feed-badge-tip">Meme Example</span>
          </div>
        )}
        <img
          className="insta-feed-img"
          src={p.img}
          alt={p.caption}
          style={{ userSelect: "none", pointerEvents: "none" }}
          draggable={false}
        />
        <div className="insta-feed-caption">{p.caption}</div>
        <div className="insta-feed-meta">
          {p.by} &middot; {timeAgo(p.time)}
        </div>
        <button
          className={
            "insta-feed-like-btn" +
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
          <span style={{ marginRight: 2 }} role="img" aria-label="heart">
            {likes[idx] ? "💚" : "🤍"}
          </span>
          <EmojiBurst
            emoji="💖"
            show={emojiBurstIdx === idx}
          />
        </button>
        {/* Divider */}
        <div className="insta-feed-divider" />
      </div>
    );
  }

  // Render main social feed in a single vertical centered column with card UI, divider <hr>, and viewport centering
  return (
    <div className="insta-feed-outer" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
      <ConfettiBurst trigger={confetti} />

      {/* New Floating FAB Button for post (bottom-right) */}
      <button
        className="insta-feed-fab"
        tabIndex={0}
        title="Create new post"
        aria-label="Create new post"
        style={{ display: showModal ? "none" : undefined }}
        onClick={() => setShowModal(true)}
      >
        <span className="insta-feed-fab-icon" style={{ transition: "transform 0.23s" }}>+</span>
      </button>

      {/* Animated Modal popup for new FAB post */}
      {showModal && (
        <div className="insta-feed-modal-overlay" tabIndex={-1} onClick={() => setShowModal(false)}>
          <div
            className="insta-feed-modal"
            tabIndex={0}
            style={{ animation: "fadeInInstaModal 0.24s" }}
            onClick={e => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Add New Post"
          >
            <form
              className="insta-feed-form"
              onSubmit={handleFabSubmit}
              autoComplete="off"
              style={{
                boxShadow: confetti ? "0 0 23px 0 var(--highlight)" : undefined,
                transition: "box-shadow 0.2s"
              }}
            >
              <label style={{ fontWeight: 600, fontSize: "1.08em", marginBottom: 4 }}>
                Name <span style={{ color: "var(--error)" }}>*</span>
                <input
                  className="insta-feed-input"
                  style={{
                    borderColor: fabError.name ? "var(--error)" : undefined,
                    marginBottom: 2
                  }}
                  type="text"
                  placeholder="Your name or handle (required)"
                  autoFocus
                  required
                  value={fabName}
                  onChange={e => setFabName(e.target.value)}
                />
                {fabError.name && <span style={{ color: "var(--error)", fontSize: '0.93em' }}>{fabError.name}</span>}
              </label>
              <label style={{ fontWeight: 600, fontSize: "1.08em", margin: '7px 0 2px 0' }}>
                Caption
                <textarea
                  className="insta-feed-input"
                  placeholder="Say something fun, witty, or chessy! (optional)"
                  maxLength={350}
                  value={fabCaption}
                  rows={3}
                  style={{ height: 46, resize: "vertical" }}
                  onChange={e => setFabCaption(e.target.value)}
                />
              </label>
              <label style={{ fontWeight: 600, fontSize: "1.08em", display: "block", margin: '7px 0 0 0' }}>
                Image URL
                <input
                  className="insta-feed-input"
                  placeholder="Paste an image URL (optional)"
                  type="url"
                  value={fabImageUrl}
                  onChange={e => {
                    setFabImageUrl(e.target.value); setFabImageUpload(null); setFabUploadingUrl("");
                  }}
                  style={{ marginTop: 0, marginBottom: 3 }}
                  disabled={!!fabImageUpload}
                />
              </label>
              <div style={{ margin: '5px 0 3px 0', fontWeight: 600, fontSize: "1.08em" }}>OR upload image
                <input
                  className="insta-feed-input"
                  type="file"
                  accept="image/*"
                  style={{ padding: 2, marginTop: 5 }}
                  onChange={handleFabFileChange}
                  disabled={!!fabImageUrl}
                />
                {fabUploadingUrl && (
                  <div style={{ marginTop: 7 }}>
                    <img src={fabUploadingUrl} alt="preview" style={{ maxWidth: 175, maxHeight: 90, borderRadius: 7, boxShadow: "0 2.5px 16px -5px var(--primary)" }} />
                  </div>
                )}
              </div>
              {fabError.img && <span style={{ color: "var(--error)", fontSize: '0.97em' }}>{fabError.img}</span>}
              <button className="insta-feed-submit" type="submit" tabIndex={0} style={{ marginTop: 10, fontSize: "1.14em" }}>
                Post
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Desktop post entry bar, hidden if modal open or on mobile */}
      <form
        className={"insta-feed-form-bar" + (checkmateFilter ? " social-feed-form-easteregg" : "")}
        onSubmit={submitPost}
        autoComplete="off"
        style={{
          display: showModal ? "none" : undefined
        }}
      >
        <input
          className={"insta-feed-input" + (checkmateFilter ? " social-feed-input-easteregg" : "")}
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
          className="insta-feed-input"
          placeholder="Paste an image URL (optional)..."
          type="url"
          value={imgUrl}
          onChange={e => setImgUrl(e.target.value)}
          style={{ marginTop: 0, marginBottom: 10 }}
        />
        <button className="insta-feed-submit" type="submit" tabIndex={0}>
          Post
        </button>
      </form>

      {/* Feed: vertical, centered card layout with <hr> dividers and responsive styling */}
      <div
        className="insta-feed-col"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 478,
          margin: "0 auto",
          justifyContent: "flex-start",
          minHeight: "75vh"
        }}
      >
        {visiblePosts.map((p, idx) => {
          // Special invite post
          if (p.img === "__CHESS_INVITE__") {
            return (
              <React.Fragment key="chess-invite">
                <ChessInvitePost
                  glitch={portalGlitch}
                  onInvite={handlePortalClick}
                />
                {visiblePosts.length > 1 && <hr className="insta-feed-hr-divider" />}
              </React.Fragment>
            );
          }
          // Animation drop-in for new post
          const animateDrop =
            feedAnimIdx !== null
              ? (feedAnimIdx === -1 && idx === 0) ||
                (feedAnimIdx === 0 && idx === 0)
              : false;
          return (
            <React.Fragment key={idx}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  width: "100%"
                }}
              >
                <CardContent
                  p={p}
                  idx={idx}
                  animateDrop={animateDrop}
                  cardRef={idx === visiblePosts.length - 1 ? lastPostRef : undefined}
                />
              </div>
              {idx < visiblePosts.length - 1 && (
                <hr className="insta-feed-hr-divider" />
              )}
            </React.Fragment>
          );
        })}
        {loadingMore && (
          <div className="insta-feed-loadmore">Loading more posts…</div>
        )}
      </div>
    </div>
  );
}
