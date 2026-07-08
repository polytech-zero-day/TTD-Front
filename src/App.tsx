import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import AdminLayout from './pages/admin/AdminLayout';
import UserManagementPage from './pages/admin/UserManagementPage';
import MyPage from './pages/MyPage';
import Leaderboard from './pages/Leaderboard';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AuthPage mode="login" />} />
        <Route path="/signup" element={<AuthPage mode="signup" />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="users" element={<UserManagementPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
