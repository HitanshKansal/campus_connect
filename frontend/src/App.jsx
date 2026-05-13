import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import Chat from './pages/Chat';
import PublicProfile from './pages/PublicProfile';
import Questions from './pages/Questions';
import QuestionDetail from './pages/QuestionDetail';
import Search from './pages/Search';
import ForgotPassword from './pages/ForgotPassword';
import SetupProfile from './pages/SetupProfile';
import PostDetail from './pages/PostDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/profile/:username" element={<PublicProfile />} />
<Route path="/post/:id" element={<Feed />} />
<Route path="/questions" element={<Questions />} />
<Route path="/questions/:id" element={<QuestionDetail />} />
<Route path="/search" element={<Search />} />
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/setup-profile" element={<SetupProfile />} />
<Route path="/post/:id" element={<PostDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;





