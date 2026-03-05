import { Divide } from "lucide-react";
import React from "react";

export default function CardBack ({ disabled = true} : { disabled?: boolean}) {
   // CardBack.tsx
return (
    <div
      style={{
        width: "clamp(30px, 4.5vw, 70px)",    // SMALLER
        height: "clamp(45px, 7vw, 110px)",    // SMALLER
        border: "2px solid black",
        borderRadius: "8px",
        background: "linear-gradient(135deg, #1f3b73, #0b1b3a)",
        opacity: disabled ? 0.85 : 1,
      }}
    />
  );
}

// face down card placeholder for opponents