// src/components/NavLink.js
import React from 'react';
import { Link } from 'react-router-dom';
import './NavLink.css';  // Import the CSS file

const NavLink = ({ to, label }) => {
  return (
    <li>
      <Link className="hbut" to={to}>{label}</Link>
    </li>
  );
};

export default NavLink;
