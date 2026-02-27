import './App.css';
import React from "react";
import PlayingCard from './components/PlayingCard.tsx';
import { Play } from 'lucide-react';

export default function App() {
  return (
    <div>
      <PlayingCard suit="hearts" value="A" />
    </div>
  );
} 

