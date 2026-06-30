import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress Ant Design v5 compatibility warning with React 19
const originalWarn = console.warn;
console.warn = function(...args) {
  if (args[0]?.includes?.('antd v5 support React is 16 ~ 18')) {
    return;
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)