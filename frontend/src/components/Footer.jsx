// src/components/Footer.js
import React from 'react';
import FooterText from './FooterText';
import './Footer.css';  // Import the CSS file

const Footer = () => {
  return (
    <footer>
      <FooterText text="&copy; 2024 Coding Platform. All rights reserved." />
    </footer>
  );
};

export default Footer;