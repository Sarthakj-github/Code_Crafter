// src/App.js
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import './App.css';  // Import the CSS file

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <MainContent />
        <Footer />
      </div>
    </Router>
  );
}

export default App;