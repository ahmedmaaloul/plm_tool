import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  /* Reset CSS */
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Global Fonts and Colors */
  body {
    font-family: 'Arial', sans-serif;
    background-color: #fff7eb;
    color: #333;
  }

  a {
    text-decoration: none;
    color: inherit;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
  }

  /* Utility Classes */
  .container {
    width: 90%;
    max-width: 1200px;
    margin: auto;
  }
`;

export default GlobalStyles;
