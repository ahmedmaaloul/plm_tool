// src/components/LoadingSpinner.js
import React from 'react';
import styled from 'styled-components';

const Spinner = styled.div`
  border: 8px solid #fff7eb;
  border-top: 8px solid #4267B2;
  border-radius: 50%;
  width: 60px;
  height: 60px;
  animation: spin 1s linear infinite;
  margin: 100px auto;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;


const LoadingSpinner = () => {
  return <Spinner />;
};

export default LoadingSpinner;
