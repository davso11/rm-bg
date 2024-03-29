import { createRoot } from 'react-dom/client';
import { Toaster } from '@/components/ui/sonner';
import { App } from './app';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <>
    <App />
    <Toaster />
  </>,
);
