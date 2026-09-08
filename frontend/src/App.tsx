import { Routes, Route } from 'react-router-dom';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Home } from '@/pages/Home';
import { NewContent } from '@/pages/NewContent';
import { Analysis } from '@/pages/Analysis';
import { Generated } from '@/pages/Generated';
import { Chat } from '@/pages/Chat';
import { History } from '@/pages/History';
import { Saved } from '@/pages/Saved';
import { Settings } from '@/pages/Settings';
import { NotFound } from '@/pages/NotFound';

export const App = () => {
  return (
    <MainLayout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/new" element={<NewContent />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/analysis/:projectId" element={<Analysis />} />
        <Route path="/generated" element={<Generated />} />
        <Route path="/generated/:projectId" element={<Generated />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:projectId" element={<Chat />} />
        <Route path="/history" element={<History />} />
        <Route path="/saved" element={<Saved />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </MainLayout>
  );
};
