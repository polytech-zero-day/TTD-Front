import { BrowserRouter, Route, Routes } from 'react-router';
import { Toaster } from 'sonner';
import { CurrentUserProvider } from '@/lib/auth/CurrentUserContext';
import ProtectedRoute from '@/lib/auth/ProtectedRoute';
import AuthPage from './pages/AuthPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ProblemManagementPage from './pages/admin/ProblemManagementPage';
import AiModelSettingsPage from './pages/admin/AiModelSettingsPage';
import CalibrationPage from './pages/admin/CalibrationPage';
import ProblemListPage from './pages/ProblemListPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import MyPage from './pages/MyPage';
import Leaderboard from './pages/Leaderboard';
import AttemptPage from './pages/AttemptPage';
import ResultPage from './pages/ResultPage';
import PricingPage from './pages/PricingPage';
import PaymentPage from './pages/PaymentPage';
import PaymentCompletePage from './pages/PaymentCompletePage';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster theme="dark" position="top-center" richColors />
      <CurrentUserProvider>
        <Routes>
          {/* 공개 경로 */}
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/signup" element={<AuthPage mode="signup" />} />

          {/* 인증 필요 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ProblemListPage />} />
            <Route path="/problems" element={<ProblemListPage />} />
            <Route path="/problems/:id" element={<ProblemDetailPage />} />
            <Route path="/problems/:id/attempt" element={<AttemptPage />} />
            <Route path="/result/:attemptId" element={<ResultPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/payment/complete" element={<PaymentCompletePage />} />

            {/* 관리자 전용 */}
            <Route element={<ProtectedRoute requireAdmin />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="users" element={<UserManagementPage />} />
                <Route path="problems" element={<ProblemManagementPage />} />
                <Route path="ai-models" element={<AiModelSettingsPage />} />
                <Route path="calibration" element={<CalibrationPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </CurrentUserProvider>
    </BrowserRouter>
  );
}
