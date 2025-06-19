import React, { useState, useEffect, useRef } from "react";
import { loadFeed, saveFeed, loadLikes, saveLikes, sanitizeCaption } from "./utils";
import EmojiBurst from "./EmojiBurst";
import ConfettiBurst from "./Confetti";

// 10 creative and chess-themed default posts, with images
const DEFAULT_POSTS = [
  {
    img: "https://images.pexels.com/photos/260024/pexels-photo-260024.jpeg?auto=compress&w=500",
    caption: "Just played the Queen's Gambit… feeling bold! ♕🏁",
    by: "Alex",
    time: Date.now() - 1000 * 60 * 60 * 2
  },
  {
    img: "https://images.pexels.com/photos/277124/pexels-photo-277124.jpeg?auto=compress&w=500",
    caption: "Finals tomorrow, but first: blitz with Pawny. Who needs sleep?",
    by: "Chris",
    time: Date.now() - 1000 * 60 * 60 * 6
  },
  {
    img: "https://images.pexels.com/photos/1329296/pexels-photo-1329296.jpeg?auto=compress&w=500",
    caption: "Check out my new wooden set! Smells like strategy. 😌",
    by: "Rena",
    time: Date.now() - 1000 * 60 * 60 * 10
  },
  {
    img: "https://images.pexels.com/photos/6001857/pexels-photo-6001857.jpeg?auto=compress&w=500",
    caption: "Tried the Bongcloud. 🤡 The results were… dazzlingly bad.",
    by: "Lev",
    time: Date.now() - 1000 * 60 * 60 * 22
  },
  {
    img: "https://images.pexels.com/photos/1003264/pexels-photo-1003264.jpeg?auto=compress&w=500",
    caption: "Endgame puzzle has me STUCK. Bishop or bust?!",
    by: "Flo",
    time: Date.now() - 1000 * 60 * 60 * 25
  },
  // Invite post, placeholder — will be replaced with glowing card
  {
    img: "__INVITE_PORTAL__",
    caption: "You're deeper into the void… but can you think ahead?",
    by: "Portal",
    time: Date.now() - 1000 * 60 * 60 * 28
  },
  {
    img: "https://images.pexels.com/photos/5412070/pexels-photo-5412070.jpeg?auto=compress&w=500",
    caption: "Sir Blunderlot blundered his queen… again. 🤦 #Relatable",
    by: "Milo",
    time: Date.now() - 1000 * 60 * 60 * 33
  },
  {
    img: "https://images.pexels.com/photos/207924/pexels-photo-207924.jpeg?auto=compress&w=500",
    caption: "Stayed up till 2AM with Knightmare. Ruthless machine.",
    by: "Sierra",
    time: Date.now() - 1000 * 60 * 60 * 40
  },
  {
    img: "https://images.pexels.com/photos/45170/pexels-photo-45170.jpeg?auto=compress&w=500",
    caption: "First game for my little sibling 🥺 They beat me...",
    by: "Jamie",
    time: Date.now() - 1000 * 60 * 60 * 50
  },
  {
    img: "https://images.pexels.com/photos/277013/pexels-photo-277013.jpeg?auto=compress&w=500",
    caption: "Anyone want a puzzle challenge?? #Checkmates",
    by: "Ada",
    time: Date.now() - 1000 * 60 * 60 * 60
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

// Generate a glowing portal card UI
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
          // Special portal invite post: glowing, clickable, with glitch reveal after scroll
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
