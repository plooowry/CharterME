import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './components/auth/AuthContext';
import Header from './components/core/Header';
import Footer from './components/core/Footer';
import LoginPage from './components/auth/LoginPage';
import DashboardPage from './components/dashboard/DashboardPage';
import ProfilePage from './components/auth/ProfilePage';
import CompetencyNavigatorLayout from './components/competencies/CompetencyNavigatorLayout';
import SubCompetencyDetailPage from './components/competencies/SubCompetencyDetailPage';
import ApplicationDrafterPage from './components/ai/ApplicationDrafterPage';
import ResourceHubPage from './components/resources/ResourceHubPage';
import LoadingSpinner from './components/core/LoadingSpinner';
import CharteredEvidenceHubPage from './components/poc-evidence-hub/CharteredEvidenceHubPage'; // New Import

const ProtectedRoute: React.FC = () => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    // Body tag now handles base bg/text color, so spinner stands out
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner text="Authenticating..." /></div>;
  }

  return currentUser ? <Outlet /> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  return (
    <HashRouter>
      {/* The body tag in index.html now handles the base theme bg and text colors. 
          The .dark class on <html> will toggle these. */}
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/competencies" element={<CompetencyNavigatorLayout />}>
                  <Route path=":areaCode" element={<Outlet />} /> {/* Placeholder for area selection, handled by layout */}
                  <Route path=":areaCode/:subCode" element={<SubCompetencyDetailPage />} />
              </Route>
              <Route path="/chartered-evidence-hub" element={<CharteredEvidenceHubPage />} /> {/* New Route */}
              <Route path="/draft-application" element={<ApplicationDrafterPage />} />
              <Route path="/resources" element={<ResourceHubPage />} />
            </Route>
            
            <Route path="*" element={<Navigate to="/dashboard" replace />} /> {/* Fallback route */}
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;