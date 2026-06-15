import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client'
import DownPage from '@/pages/DownPage';
import './index.css'
import '@/common/i18n/i18n';

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <DownPage />
    </StrictMode>
);
