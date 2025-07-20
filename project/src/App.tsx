import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ConsentManagement from './pages/ConsentManagement';
import Honeytokens from './pages/Honeytokens';
import Watermarking from './pages/Watermarking';
import PolicyManagement from './pages/PolicyManagement';
import Notifications from './pages/Notifications';
import AccessLogs from './pages/AccessLogs';
import PartnerManagement from './pages/PartnerManagement';
import RiskMonitoring from './pages/RiskMonitoring';
import MyFiles from './pages/MyFiles';
import PartnerFiles from './pages/PartnerFiles';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout>
                    <UserDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Layout>
                    <UserDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/my-files" element={
                <ProtectedRoute>
                  <Layout>
                    <MyFiles />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/partner-files" element={
                <ProtectedRoute>
                  <Layout>
                    <PartnerFiles />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <AdminDashboard />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/consent" element={
                <ProtectedRoute>
                  <Layout>
                    <ConsentManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/honeytokens" element={
                <ProtectedRoute>
                  <Layout>
                    <Honeytokens />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/watermarking" element={
                <ProtectedRoute>
                  <Layout>
                    <Watermarking />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/policies" element={
                <ProtectedRoute>
                  <Layout>
                    <PolicyManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Layout>
                    <Notifications />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/access-logs" element={
                <ProtectedRoute>
                  <Layout>
                    <AccessLogs />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/partners" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <PartnerManagement />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/risk-monitoring" element={
                <ProtectedRoute requireAdmin>
                  <Layout>
                    <RiskMonitoring />
                  </Layout>
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;