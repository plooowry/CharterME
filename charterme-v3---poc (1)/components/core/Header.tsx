import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import ResponsiveNavLink from './ResponsiveNavLink';
import Icon from './Icon';
import ThemeToggleButton from './ThemeToggleButton'; // Import the toggle button

const Header: React.FC = () => {
  const { currentUser, logout, loading } = useAuth();

  return (
    <header className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface shadow-lg sticky top-0 z-50 border-b border-theme-border dark:border-dark-theme-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-theme-primary dark:text-dark-theme-primary">
              Charter<span className="text-theme-secondary dark:text-dark-theme-secondary">Me</span>
            </Link>
          </div>
          <nav className="hidden md:flex space-x-4 items-center">
            {currentUser && (
              <>
                <ResponsiveNavLink to="/dashboard" iconName="dashboard">Dashboard</ResponsiveNavLink>
                <ResponsiveNavLink to="/competencies" iconName="competencies">Competencies</ResponsiveNavLink>
                <ResponsiveNavLink to="/chartered-evidence-hub" iconName="archiveBox">Evidence Hub</ResponsiveNavLink>
                <ResponsiveNavLink to="/draft-application" iconName="draft">Draft Application</ResponsiveNavLink>
                <ResponsiveNavLink to="/resources" iconName="resources">Resources</ResponsiveNavLink>
              </>
            )}
          </nav>
          <div className="flex items-center">
             <ThemeToggleButton /> {/* Added theme toggle button here */}
            {loading ? (
              <span className="text-theme-text-muted dark:text-dark-theme-text-muted ml-3">Loading...</span>
            ) : currentUser ? (
              <div className="ml-3 relative group">
                <button className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-dark-theme-primary text-theme-text-base dark:text-dark-theme-text-base hover:text-theme-primary dark:hover:text-dark-theme-primary">
                  <Icon name="user" className="w-8 h-8 p-1 bg-theme-bg-muted dark:bg-dark-theme-bg-muted rounded-full" />
                  <span className="ml-2 hidden md:inline">{currentUser.name || currentUser.email}</span>
                  <Icon name="chevronDown" className="ml-1 h-4 w-4 hidden md:inline" />
                </button>
                <div className="opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 ease-in-out origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-theme-bg-surface dark:bg-dark-theme-bg-surface ring-1 ring-theme-border dark:ring-dark-theme-border ring-opacity-50 z-10">
                  <ResponsiveNavLink to="/profile" className="block px-4 py-2 text-sm w-full text-left !rounded-none">My Profile</ResponsiveNavLink> {/* Removed explicit text color here, will inherit from NavLink */}
                  <button
                    onClick={logout}
                    className="flex items-center w-full text-left px-4 py-2 text-sm text-theme-text-muted dark:text-dark-theme-text-muted hover:bg-theme-bg-hover dark:hover:bg-dark-theme-bg-hover"
                  >
                    <Icon name="logout" className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <ResponsiveNavLink to="/login" className="ml-3">Login</ResponsiveNavLink>
            )}
          </div>
        </div>
        {/* Mobile Nav (conditionally rendered or part of a mobile menu toggle) */}
        {currentUser && (
            <div className="md:hidden py-2 border-t border-theme-border dark:border-dark-theme-border">
                 <nav className="flex flex-col space-y-1">
                    <ResponsiveNavLink to="/dashboard" iconName="dashboard">Dashboard</ResponsiveNavLink>
                    <ResponsiveNavLink to="/competencies" iconName="competencies">Competencies</ResponsiveNavLink>
                    <ResponsiveNavLink to="/chartered-evidence-hub" iconName="archiveBox">Evidence Hub</ResponsiveNavLink>
                    <ResponsiveNavLink to="/draft-application" iconName="draft">Draft Application</ResponsiveNavLink>
                    <ResponsiveNavLink to="/resources" iconName="resources">Resources</ResponsiveNavLink>
                </nav>
            </div>
        )}
      </div>
    </header>
  );
};

export default Header;