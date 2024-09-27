// src/components/Header.js
import React from 'react';
import NavLink from './NavLink';
import './Header.css';  // Import the CSS file

const Header = () => {
  return (
    <header>
      <nav>
        <ul>
          <NavLink to="/playground" label="Playground" />
          <NavLink to="/arena" label="Arena" />
          <NavLink to="/battleground" label="Battleground" />
        </ul>
      </nav>
    </header>
  );
};

export default Header;
