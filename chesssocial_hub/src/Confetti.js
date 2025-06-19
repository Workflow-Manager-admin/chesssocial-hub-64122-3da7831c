import React, { useEffect } from "react";

// PUBLIC_INTERFACE
export default function ConfettiBurst({trigger}) {
  useEffect(() => {
    if (!trigger) return;
    // Super lightweight canvas confetti drop (fallback for most browsers)
    const canvas = document.createElement("canvas");
    canvas.className = "confetti-canvas";
    document.body.appendChild(canvas);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext("2d");
    const confettiColors = [
      "#4F46E5","#F59E0B","#10B981","#F9FAFB","#232136","#D6D6D6"
    ];
    const pieces = [];
    for (let i=0; i<42; ++i) {
      pieces.push({
        x: Math.random()*canvas.width,
        y: Math.random()*-100,
        r: Math.random()*17+8,
        color: confettiColors[Math.floor(Math.random()*confettiColors.length)],
        dy: Math.random()*4.5+3,
        dx: Math.random()*2-1,
        rot: Math.random()*360,
        dr: Math.random()*6-2
      });
    }
    let frame=0, run=true;
    function animate() {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for (let p of pieces) {
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot*Math.PI)/180);
        ctx.fillStyle = p.color;
        ctx.beginPath(); ctx.arc(0,0,p.r,0,2*Math.PI); ctx.fill();
        ctx.restore();
        p.x += p.dx;
        p.y += p.dy;
        p.rot += p.dr;
      }
      frame++;
      if (frame<49 && run) requestAnimationFrame(animate);
      else document.body.removeChild(canvas);
    }
    animate();
    return () => { run=false; if(canvas.parentNode) canvas.parentNode.removeChild(canvas); };
  }, [trigger]);
  return null;
}
