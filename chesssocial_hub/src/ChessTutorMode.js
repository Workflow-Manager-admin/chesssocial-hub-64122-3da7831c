import React, { useState } from "react";
import LessonHub from "./components/tutor/LessonHub";
import LessonModule from "./components/tutor/LessonModule";
import BackButton from "./components/tutor/BackButton";

// PUBLIC_INTERFACE
/**
 * ChessTutorMode manages stateful routing between the lesson hub and individual lessons/modules.
 * Uses useState for simple view switching: starts with hub (lesson grid), clicking a lesson sets activeLesson,
 * and returns to hub on "back". Passes navigation handlers and state to LessonHub/LessonModule.
 */
export default function ChessTutorMode() {
  const [activeLesson, setActiveLesson] = useState(null);

  // Handler when user selects a lesson from the hub
  const handleLessonSelect = (lessonKey) => {
    setActiveLesson(lessonKey);
  };

  // Handler to return to hub (from a lesson)
  const handleBackToHub = () => {
    setActiveLesson(null);
  };

  return (
    <div style={{
      width: "100%",
      minHeight: 360,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      {activeLesson === null ? (
        <LessonHub
          setActiveLesson={handleLessonSelect}
          activeLesson={activeLesson}
        />
      ) : (
        <div style={{ width: "100%", maxWidth: 680 }}>
          <BackButton onClick={handleBackToHub} />
          <LessonModule
            lessonKey={activeLesson}
            setActiveLesson={setActiveLesson}
            activeLesson={activeLesson}
            onBack={handleBackToHub}
          />
        </div>
      )}
    </div>
  );
}
