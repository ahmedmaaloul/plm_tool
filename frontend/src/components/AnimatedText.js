// src/components/AnimatedText.js
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const Animated = styled(motion.div)`
  font-size: 2rem;
  font-weight: bold;
  color: #ff5757;
  text-align: center;
  margin-top: 20px;

  @media screen and (min-width: 769px) {
    text-align: right;
    margin-top: 0;
  }
`;

const AnimatedText = () => {
  return (
    <Animated
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, repeat: Infinity, repeatType: 'mirror' }}
    >
      Se déguster autrement
    </Animated>
  );
};

export default AnimatedText;
