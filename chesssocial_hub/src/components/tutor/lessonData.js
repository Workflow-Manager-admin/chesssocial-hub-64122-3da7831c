const LESSONS = [
  {
    key: "openings",
    title: "Basic Openings",
    description: "Learn how to start your games right with classic opening moves like the Italian, Spanish, and Queen's Gambit.",
    themeColor: "#4F46E5", // Indigo blue, for neon border
    fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
    tip: "Tip: Develop your pieces quickly and control the center, rather than memorizing move orders.",
    details: [
      "Openings are the first 5–10 moves. Prioritize quick development and king safety.",
      "Popular: Italian – 1.e4 e5 2.Nf3 Nc6 3.Bc4; Queen's Gambit – 1.d4 d5 2.c4."
    ],
    quiz: {
      question: "What is the main goal of the opening phase?",
      options: [
        "Memorize as many moves as possible",
        "Develop your pieces and control the center",
        "Move your queen out early"
      ],
      correctIndex: 1
    }
  },
  {
    key: "tactics",
    title: "Common Tactics",
    description: "Unlock the power of forks, pins, skewers and more to tactically dominate.",
    themeColor: "#F59E0B", // Amber
    fen: "r1bqkbnr/pppp1ppp/2n5/4p3/8/5N2/PPPPPPPP/RNBQKB1R w KQkq - 2 3",
    tip: "Tip: After every move, scan for checks, captures, and threat tactics.",
    details: [
      "Tactics are short-term opportunities for advantage: forks, pins, skewers, discoveries.",
      "Fork: making two threats at once; Pin: enemy can't move without loss."
    ],
    quiz: {
      question: "Which tactic involves attacking two pieces at the same time?",
      options: ["Pin", "Skewer", "Fork"],
      correctIndex: 2
    }
  },
  {
    key: "checkmate",
    title: "Checkmate Patterns",
    description: "Master the most common mating patterns like back rank mate and smothered mate.",
    themeColor: "#10B981", // Emerald
    fen: "6k1/5ppp/8/8/8/8/5PPP/6K1 w - - 0 1",
    tip: "Tip: Watch for unguarded squares around the king—pattern recognition is key.",
    details: [
      "Back rank mate uses a rook/queen against a king trapped on the edge.",
      "Smothered mate uses a knight and blocked escape squares."
    ],
    quiz: {
      question: "What helps you find checkmates the fastest?",
      options: ["Memorizing all moves", "Recognizing patterns", "Always playing for stalemate"],
      correctIndex: 1
    }
  }
];

export default LESSONS;
