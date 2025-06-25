import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import RoutesRoot from './routes';
import { ErrorBoundary } from './ErrorBoundary';
import './index.css';
import axios from 'axios';


axios.defaults.baseURL = 'http://localhost:5000/api';

axios.interceptors.request.use(cfg => {
  const t = localStorage.getItem('token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
    <BrowserRouter>
      <RoutesRoot />
    </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);

