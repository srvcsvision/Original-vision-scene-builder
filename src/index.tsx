import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initFirebase } from '@/services/firebase';

initFirebase().then(() => {
  console.log('Firebase initialized');
}).catch(() => {
  console.warn('Firebase init skipped');
});

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
