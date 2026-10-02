import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import Home from './pages/Home';
import Learn from './pages/Learn';

const routes = [
  { path: '/', element: <Home /> },
  { path: '/learn/:char', element: <Learn /> },
];
if (import.meta.env.DEV) {
  const { default: Editor } = await import('./pages/Editor');
  routes.push({ path: '/editor', element: <Editor /> });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={createBrowserRouter(routes)} />
  </React.StrictMode>,
);
