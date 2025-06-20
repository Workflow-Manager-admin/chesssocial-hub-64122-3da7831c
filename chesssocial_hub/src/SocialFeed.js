import React, { useState, useEffect, useRef } from "react";
import { loadLikes, saveLikes, sanitizeCaption, loadFeed, saveFeed } from "./utils";
import EmojiBurst from "./EmojiBurst";
import ConfettiBurst from "./Confetti";

// PUBLIC_INTERFACE
/**
 * Triggers download of a JSON file with the provided data and filename.
 * Defensive: Handles all browsers and stringifies properly. Used for posts export.
 */
function downloadJSON(data, filename) {
  try {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  } catch (e) {
    alert("Error exporting posts: " + (e.message || e));
  }
}

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

/**
 * Chess Arena invite special card with premium metallic "shine" hover (when isChessHint=true)
 * - Solid #C0C0C0 background
 * - On hover: semi-transparent white diagonal shine, 0.3s ease-in
 * - Soft silver glow, soft border
 */
function ChessInvitePost({ onInvite, glitch, isChessHint = true }) {
  return (
    <div
      tabIndex="0"
      className={
        "social-feed-card social-feed-invite" +
        (glitch ? " social-feed-invite-glitch" : "") +
        (isChessHint ? " metallic-chess-invite" : "")
      }
      title="Enter the Chess Arena"
      onClick={onInvite}
      onKeyDown={e => ["Enter", " "].includes(e.key) && onInvite()}
      style={{
        // Only apply these background styles if isChessHint flag is true (per subtask)
        background: isChessHint ? "#C0C0C0" : undefined,
        boxShadow: isChessHint
          ? "0 0 36px 0 rgba(130,130,150,0.20), 0 0 13px 2px #C0C0C0"
          : "0 0 48px 8px var(--accent), 0 0 16px 2px var(--primary)",
        border: isChessHint ? "2.7px solid #e6e7ed" : "2.7px solid var(--accent)",
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
      {/* metallic shine overlay: CSS only */}
      {isChessHint && (
        <span className="metallic-shine-anim" aria-hidden="true" />
      )}
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

// PUBLIC_INTERFACE
export default function SocialFeed({ onArenaPortal, notifyArenaPortal }) {
  // Load posts from localStorage on mount (fallback to DEFAULT_POSTS)
  const [posts, setPosts] = useState(() => {
    const loaded = loadFeed();
    if (Array.isArray(loaded) && loaded.length > 0) {
      // defensive: ensure comment/id
      return loaded.map((p, i) => ({
        ...p,
        id: p.id || `loc-${i}-${Date.now()}`,
        comments: Array.isArray(p.comments) ? p.comments : [],
      }));
    }
    // Defensive: add missing structure for comments/ids to default
    return DEFAULT_POSTS.map((p, i) => ({
      ...p,
      id: `def-${i}`,
      comments: [],
    }));
  });
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

  // Save posts to localStorage on updates
  useEffect(() => {
    saveFeed(posts);
  }, [posts]);

  // Persist likes to localStorage only
  useEffect(() => {
    saveLikes(likes);
  }, [likes]);

  // "chess" in post confetti + filter
  useEffect(() => {
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
  // Animate new post drop-in -- NOOP (remove effect entirely, not needed)
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
  function submitPost(e) {
    e.preventDefault();
    if (!caption.trim()) return;
    const egg = caption.toLowerCase().includes("chess");
    const mate = caption.toLowerCase().includes("checkmate");
    const newPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      img: imgUrl ||
        "https://images.pexels.com/photos/1329296/pexels-photo-1329296.jpeg?auto=compress&w=500",
      caption: sanitizeCaption(caption),
      by: "You",
      time: Date.now(),
      comments: [],
      egg,
      mate,
    };
    setPosts((prev) => {
      const next = [newPost, ...prev];
      saveFeed(next);
      return next;
    });
    setCaption("");
    setImgUrl("");
    if (egg) setConfetti(true);
    setTimeout(() => setConfetti(false), 1533);
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
  function handleFabSubmit(e) {
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
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2,8)}`,
      img: imageToUse,
      caption: fabCaption ? sanitizeCaption(fabCaption) : "",
      by: fabName.trim(),
      time: Date.now(),
      comments: [],
      egg: fabCaption?.toLowerCase().includes("chess") || false,
      mate: fabCaption?.toLowerCase().includes("checkmate") || false,
    };
    setPosts((prev) => {
      const next = [newPost, ...prev];
      saveFeed(next);
      return next;
    });
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
    setLikes((old) => {
      const next = { ...old, [idx]: !old[idx] };
      saveLikes(next);
      return next;
    });
    // Save posts array for structural consistency
    saveFeed(posts);
    setEmojiBurstIdx(idx);
    setTimeout(() => setEmojiBurstIdx(-1), 620);
  }

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

  // PUBLIC_INTERFACE
  function CardContent({ p, idx, animateDrop, cardRef }) {
    const isDefault = DEFAULT_POSTS.some(
      d => d.caption === p.caption && d.by === p.by
    );

    // Truncation for captions
    const [showFullCaption, setShowFullCaption] = useState(false);
    const CAPTION_LIMIT = 120;
    const isTruncated = p.caption && p.caption.length > CAPTION_LIMIT;
    const displayCaption = showFullCaption || !isTruncated
      ? p.caption
      : (p.caption ? (p.caption.slice(0, CAPTION_LIMIT) + "…") : "");

    // Comments section (persisted to posts state)
    const [comments, setComments] = useState(() => {
      return Array.isArray(p.comments) ? p.comments : [];
    });
    const [commentInput, setCommentInput] = useState("");
    const commentInputRef = useRef(null);

    // Animation state for wiggle/checkmark on successful comment
    const [commentSuccess, setCommentSuccess] = useState(false);

    // === Slide-in Animation on Viewport ===
    const [inView, setInView] = useState(false);
    const localRef = useRef(null);
    // Use external cardRef if provided (last element), else our local ref
    const mergedRef = (el) => {
      localRef.current = el;
      if (typeof cardRef === "function") cardRef(el);
      else if (cardRef && typeof cardRef === "object") cardRef.current = el;
    };
    useEffect(() => {
      const node = localRef.current;
      if (!node) return;
      let observer;
      // Use intersection observer if available
      if ("IntersectionObserver" in window) {
        observer = new window.IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setInView(true);
              observer.disconnect();
            }
          },
          { threshold: 0.12 }
        );
        observer.observe(node);
      } else {
        // Fallback: just show immediately
        setInView(true);
      }
      return () => {
        if (observer) observer.disconnect();
      };
    }, []); // only first mount

    function handleCommentSubmit(e) {
      e.preventDefault();
      const text = commentInput.trim();
      if (!text) return;
      const newComment = {
        by: "You",
        text,
        time: Date.now(),
      };
      setComments(prev => {
        const next = [...prev, newComment];
        setPosts((allPosts) => {
          const modded = allPosts.map((postObj, postIdx) =>
            idx === postIdx
              ? { ...postObj, comments: [...(Array.isArray(postObj.comments) ? postObj.comments : []), newComment] }
              : postObj
          );
          saveFeed(modded);
          return modded;
        });
        return next;
      });
      setCommentInput("");
      setCommentSuccess(true);
      // Reset success indicator after animation
      setTimeout(() => setCommentSuccess(false), 850);
    }

    // Avatar: use first letter of username or emoji fallback
    const avatar = (
      <div
        style={{
          background: 'linear-gradient(130deg, #ece9f7 60%, #f7d689 100%)',
          color: '#916909',
          fontWeight: 900,
          width: 36, height: 36, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.22rem', marginRight: 13, border: '2px solid #f7e2bc', boxShadow: '0 1px 4.4px -1px #efd99b'
        }}
        aria-label={p.by.slice(0,1)}
      >
        {p.by.match(/[a-z0-9]/i) ? p.by.slice(0,1).toUpperCase() : "👤"}
      </div>
    );

    const likeCount = likes[idx] ? 1 : 0;
    const commentCount = comments.length;
    const commentsToShow = comments.slice(-2);
    const cardId = `post-card-${idx}`;

    // Animation classes removed: render with only base card + optional monochrome
    const cardClass =
      "insta-feed-card instagram-style-card " +
      (p.mate || checkmateFilter ? "social-feed-monochrome " : "");

    return (
      <div
        className={cardClass}
        ref={mergedRef}
        style={{
          margin: "0 auto",
          marginBottom: 24,
          maxWidth: 600,
          minWidth: 0,
          width: "100%",
          padding: 0,
          overflow: "visible",
          position: "relative",
        }}
        tabIndex={0}
        aria-labelledby={cardId+"-header"}
        role="region"
      >
        {/* Header: avatar, name, time */}
        <div className="post-card-header" id={cardId+"-header"} style={{
          display: "flex", alignItems: "center", gap: 0,
          padding: "17px 19px 10px 19px"
        }}>
          {/* Badge for meme default posts */}
          {isDefault && (
            <div className="insta-feed-badge" tabIndex={0}
                 title="Default viral meme post (examples only)"
                 style={{ position: "static", marginRight: 10 }}>
              <span role="img" aria-label="badge">🥈</span>
              <span className="insta-feed-badge-tip">Meme Example</span>
            </div>
          )}
          {avatar}
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <span style={{
              fontWeight: 700,
              fontSize: "1.09rem",
              color: "var(--primary)",
              letterSpacing: "-0.015em"
            }}>{p.by}</span>
            <span style={{
              fontWeight: 400,
              color: "#aab", opacity: 0.77,
              marginLeft: 10, fontSize: "0.97rem"
            }}>{timeAgo(p.time)}</span>
          </div>
        </div>
        {/* Main Image */}
        <div className="post-card-img-container"
             style={{
                width: "100%", padding: "0 0", display: "flex",
                alignItems: "center", justifyContent: "center",
                background: "var(--boardBg)", borderRadius: "0"
              }}>
          <img
            className="insta-feed-img instagram-style-img"
            src={p.img}
            alt={p.caption?.slice(0,80) || ""}
            style={{
              borderRadius: 0, width: "100%",
              maxHeight: "370px", minHeight: 110,
              aspectRatio: "1/1", objectFit: "cover",
              background: "var(--boardBg)"
            }}
            draggable={false}
          />
        </div>
        {/* Actions row: likes, comment icon */}
        <div className="post-card-actions" style={{
          display: "flex", alignItems: "center", gap: "18px",
          padding: "7px 19px 0 19px"
        }}>
          <button
            className={
              "insta-feed-like-btn post-card-like-btn" +
              (likes[idx] ? " liked" : "")
            }
            aria-label={likes[idx] ? "Unlike post" : "Like post"}
            onClick={() => handleLike(idx)}
            type="button"
            tabIndex={0}
            style={{ position: "relative", top: 0, right: 0, marginRight: "3px" }}
          >
            <span style={{ 
              marginRight: 2, 
              fontSize: "1.5em", 
              color: likes[idx] ? "#EF4444" : undefined, 
              textShadow: likes[idx] 
                ? "0 0 8px #ef444466, 0 0 1px #ef4444"
                : undefined,
              transition: "color 0.22s, text-shadow 0.18s"
            }} role="img" aria-label="heart">
              {likes[idx] ? "❤️" : "🤍"}
            </span>
            <EmojiBurst
              emoji="💖"
              show={emojiBurstIdx === idx}
            />
          </button>
          <span style={{
            fontWeight: 600, color: "var(--highlight)", width: 28, minWidth: 28
          }}
            aria-label="Like count"
            tabIndex={-1}
          >{likeCount}</span>
          {/* Comment icon/count */}
          <span style={{ marginLeft: 16, display: "flex", alignItems: "center", color: "#aab" }}>
            <span role="img" aria-label="comment" style={{ fontSize: "1.24em", marginRight: 2 }}>💬</span>
            <span
              style={{ fontWeight: 600 }}
              aria-label="Comments count"
              tabIndex={-1}
            >{commentCount}</span>
          </span>
        </div>

        {/* Caption (truncatable, "more" link if long) */}
        <div className="post-card-caption" style={{
          fontSize: "1.10rem",
          color: "var(--text)",
          padding: "10px 19px 2px 19px",
          fontWeight: 500,
          marginTop: "0.30em",
          marginBottom: "0.12em",
          lineHeight: 1.42,
          whiteSpace: "pre-line",
          wordBreak: "break-word"
        }}>
          {displayCaption}
          {isTruncated && !showFullCaption && (
            <button
              type="button"
              style={{
                background: "none", border: "none", color: "var(--primary)", fontWeight: 700,
                cursor: "pointer", padding: 0, fontSize: "1.08em", marginLeft: 2
              }}
              tabIndex={0}
              aria-label="See more"
              onClick={() => setShowFullCaption(true)}
            >more</button>
          )}
        </div>

        {/* Comment(s) preview */}
        <div className="post-card-comments-preview" style={{
          padding: "2px 19px 0 19px",
          marginBottom: 1, marginTop: 4
        }}>
          {commentsToShow.length === 0 ? (
            <span style={{
              color: "#aaa", opacity: 0.51, fontSize: "0.98em", fontStyle: "italic"
            }}>No comments yet</span>
          ) : (
            commentsToShow.map((c, i) => (
              <div key={i} style={{
                fontSize: "0.98em",
                color: "var(--text-secondary)",
                marginBottom: "1.5px",
                display: "flex",
                alignItems: "baseline",
                gap: 8
              }}>
                <span style={{
                  fontWeight: 500, marginRight: 5, color: "var(--primary)", fontSize: "1em"
                }}>{c.by}:</span>
                <span style={{ opacity: 0.92, flex: 1, wordBreak: "break-word" }}>{c.text}</span>
                <span style={{
                  marginLeft: 9, fontSize: "0.89em", color: "#bbb"
                }}>
                  {c.time ? timeAgo(c.time) : ""}
                </span>
              </div>
            ))
          )}
        </div>
        {/* Add Comment field (local, persisted in post) */}
        <form
          className="post-card-comment-form"
          style={{
            display: "flex",
            gap: 7,
            alignItems: "center",
            padding: "5px 19px 13px 19px",
            position: "relative"
          }}
          autoComplete="off"
          onSubmit={handleCommentSubmit}
        >
          <input
            ref={commentInputRef}
            type="text"
            value={commentInput}
            onChange={e => setCommentInput(e.target.value)}
            maxLength={120}
            className={
              "social-feed-input" + (commentSuccess ? " comment-input-animate-success" : "")
            }
            aria-label="Add a comment"
            placeholder="Add a comment..."
            style={{
              flex: "1 1 auto",
              borderRadius: 13,
              border: "1px solid #e3daef",
              fontSize: "1.02em",
              background: "#fcfcffe6",
              padding: "7.5px 12px",
              outline: 0,
              color: "var(--text)",
              minWidth: "0"
            }}
          />
          <button
            type="submit"
            style={{
              fontWeight: 700,
              color: "var(--accent)",
              background: "none",
              border: "none",
              fontSize: "1.02em",
              cursor: commentInput.trim() ? "pointer" : "default",
              opacity: commentInput.trim() ? 1 : 0.44,
              padding: "0 3px"
            }}
            disabled={!commentInput.trim()}
            tabIndex={0}
            aria-label="Post comment"
          >Post</button>
          {/* Success checkmark icon */}
          {commentSuccess && (
            <span className="comment-input-checkmark" aria-live="polite" role="status">✔️</span>
          )}
        </form>
        {/* Divider */}
        <div className="insta-feed-divider" />
      </div>
    );
  }

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

  // Render main social feed in a single vertical centered column with card UI, divider <hr>, and viewport centering
  return (
    <div className="insta-feed-outer" style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start" }}>
      <ConfettiBurst trigger={confetti} />

      {/* Export Posts Button (top toolbar, accessible, visually styled) */}
      <div
        style={{
          width: "100%",
          maxWidth: 535,
          marginBottom: 13,
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
        }}
      >
        <button
          className="social-feed-button"
          onClick={() => downloadJSON(posts, "posts-export.json")}
          style={{
            fontWeight: 600,
            fontSize: "1.04rem",
            marginRight: 0,
            letterSpacing: ".01em"
          }}
          aria-label="Export posts as JSON"
          tabIndex={0}
        >
          <span role="img" aria-label="download" style={{ marginRight: 7 }}>📤</span>
          Export
        </button>
      </div>

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

      {/* Feed: vertical, centered card layout with <hr> dividers and responsive styling */}
      <div
        className="insta-feed-col"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: 535,
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
          // Animation effect is gone
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
