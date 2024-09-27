// src/MainContent.jsx
import React, { useRef } from 'react';
import { Route, Routes } from 'react-router-dom';
import Playground from '../pages/Playground';
import Arena from '../pages/Arena';
import Battleground from '../pages/Battleground';
import './MainContent.css';

const MainContent = () => {
  const playgroundRef = useRef(null);

  return (
    <main>
      <Routes>
        <Route path="/playground" element={<Playground ref={playgroundRef} />} />
        <Route path="/arena" element={<Arena />} />
        <Route path="/battleground" element={<Battleground />} />
      </Routes>
    </main>
  );
};

export default MainContent;
