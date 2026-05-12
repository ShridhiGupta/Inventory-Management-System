import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';
import EnterpriseProviders from './components/providers/EnterpriseProviders.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <EnterpriseProviders>
        <App />
      </EnterpriseProviders>
    </BrowserRouter>
  </StrictMode>
);
