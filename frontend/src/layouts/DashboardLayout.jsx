import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import PetAiAssistantModal from '../components/PetAiAssistantModal';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = ({ allowedRoles, title }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-slate-300">Loading Smart Pet Care Portal...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={title} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <PetAiAssistantModal />
    </div>
  );
};

export default DashboardLayout;
