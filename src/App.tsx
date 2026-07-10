import { BrowserRouter, Route, Routes } from 'react-router';
import AuthPage from './pages/AuthPage';
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import UserManagementPage from './pages/admin/UserManagementPage';
import ProblemManagementPage from './pages/admin/ProblemManagementPage';
import ProblemListPage from './pages/ProblemListPage';
import ProblemDetailPage from './pages/ProblemDetailPage';
import MyPage from './pages/MyPage';
import Leaderboard from './pages/Leaderboard';
import AttemptPage from './pages/AttemptPage';
import GradingPage from './pages/GradingPage';
import ResultPage from './pages/ResultPage';
import PricingPage from './pages/PricingPage';
import PaymentPage from './pages/PaymentPage';
import PaymentCompletePage from './pages/PaymentCompletePage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProblemListPage />} />
        <Route path="/problems" element={<ProblemListPage />} />
        <Route path="/problems/:id" element={<ProblemDetailPage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/complete" element={<PaymentCompletePage />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="users" element={<UserManagementPage />} />
          <Route path="problems" element={<ProblemManagementPage />} />
        </Route>
        <Route path="/problems/:id" element={<ProblemDetailPage />} />
        <Route path="/problems/:id/attempt" element={<AttemptPage />} />
        <Route path="/grading" element={<GradingPage />} />
        <Route path="/result/:attemptId" element={<ResultPage />} />
      </Routes>
    </BrowserRouter>
  );
}
