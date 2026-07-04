import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'sonner';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import AuthGuard from '@/components/auth/AuthGuard';
import AppLayout from '@/components/layout/AppLayout';
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import VerifyEmailPage from '@/pages/VerifyEmailPage';
import DashboardPage from '@/pages/DashboardPage';
import DiscoverPage from '@/pages/DiscoverPage';
import SkillsPage from '@/pages/SkillsPage';
import ExchangesPage from '@/pages/ExchangesPage';
import ExchangeDetailPage from '@/pages/ExchangeDetailPage';
import ChatPage from '@/pages/ChatPage';
import SessionsPage from '@/pages/SessionsPage';
import ProfilePage from '@/pages/ProfilePage';
import UserProfilePage from '@/pages/UserProfilePage';
import NotFoundPage from '@/pages/NotFoundPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ className: 'bg-navy border-border text-foreground' }} />
        <ErrorBoundary>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route element={<AuthGuard />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/exchanges" element={<ExchangesPage />} />
              <Route path="/exchanges/:id" element={<ExchangeDetailPage />} />
              <Route path="/exchanges/:id/chat" element={<ChatPage />} />
              <Route path="/sessions" element={<SessionsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/users/:id" element={<UserProfilePage />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
