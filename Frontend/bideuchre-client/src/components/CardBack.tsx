import { Divide } from "lucide-react";
import React from "react";
import { cardBackStyle } from "./CardBack.styles";

export default function CardBack ({ disabled = true} : { disabled?: boolean}) {
   // CardBack.tsx
return (
    <div
      style={cardBackStyle(disabled)}
    />
  );
}

// face down card placeholder for opponents