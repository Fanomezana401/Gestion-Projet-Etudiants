import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.tsx';
import { BrowserRouter } from 'react-router-dom';
import { SseProvider } from './context/SseContext.tsx';


ReactDOM.createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <AuthProvider>
      <SseProvider>
        <App />
      </SseProvider>
    </AuthProvider>
  </BrowserRouter>
);
