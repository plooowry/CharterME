
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ProfileData } from '../../types';
import PageTitle from '../core/PageTitle';
import LoadingSpinner from '../core/LoadingSpinner';

const ProfilePage: React.FC = () => {
  const { currentUser, profile, updateProfile, loading: authLoading } = useAuth();
  const [careerSummary, setCareerSummary] = useState('');
  const [targetPEI, setTargetPEI] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setCareerSummary(profile.careerSummary);
      setTargetPEI(profile.targetPEI);
      setPageLoading(false);
    } else if (!authLoading) {
      setPageLoading(false);
    }
  }, [profile, authLoading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    if (!currentUser) return;

    const newProfile: ProfileData = { careerSummary, targetPEI };
    try {
      await updateProfile(newProfile);
      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error("Failed to update profile", error);
      setMessage('Failed to update profile.');
    }
  };

  if (authLoading || pageLoading) {
    return <div className="container mx-auto p-4"><LoadingSpinner text="Loading profile..."/></div>;
  }

  if (!currentUser) {
    return <div className="container mx-auto p-4 text-center text-theme-accent-red dark:text-dark-theme-accent-red">Please login to view your profile.</div>;
  }
  
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageTitle title="My Profile" subtitle="Manage your personal and application details." />

      {message && <div className={`p-3 rounded-md mb-4 ${message.includes('successfully') ? 'bg-green-100 text-green-700 dark:bg-dark-theme-accent-green/20 dark:text-dark-theme-accent-green' : 'bg-red-100 text-red-700 dark:bg-dark-theme-accent-red/20 dark:text-dark-theme-accent-red'}`}>{message}</div>}

      <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface shadow-xl rounded-lg p-6 md:p-8">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base">Personal Information</h3>
          <p className="text-theme-text-muted dark:text-dark-theme-text-muted"><span className="font-medium text-theme-text-base dark:text-dark-theme-text-base">Name:</span> {currentUser.name || 'N/A'}</p>
          <p className="text-theme-text-muted dark:text-dark-theme-text-muted"><span className="font-medium text-theme-text-base dark:text-dark-theme-text-base">Email:</span> {currentUser.email}</p>
        </div>

        <form onSubmit={handleSave}>
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-theme-text-base dark:text-dark-theme-text-base">Application Details</h3>
            <div className="mt-4">
              <label htmlFor="careerSummary" className="block text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base mb-1">
                Career Summary
              </label>
              <textarea
                id="careerSummary"
                rows={4}
                className="shadow-sm focus:ring-theme-primary dark:focus:ring-dark-theme-primary focus:border-theme-primary dark:focus:border-dark-theme-primary mt-1 block w-full sm:text-sm bg-theme-bg-muted dark:bg-dark-theme-bg-muted border-theme-border dark:border-dark-theme-border rounded-md p-2 disabled:bg-theme-bg-base dark:disabled:bg-dark-theme-bg-base text-theme-text-base dark:text-dark-theme-text-base placeholder-theme-text-muted dark:placeholder-dark-theme-text-muted"
                value={careerSummary}
                onChange={(e) => setCareerSummary(e.target.value)}
                disabled={!isEditing}
                placeholder="A brief summary of your engineering career."
              />
            </div>
            <div className="mt-4">
              <label htmlFor="targetPEI" className="block text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base mb-1">
                Target Professional Engineering Institution (PEI)
              </label>
              <input
                type="text"
                id="targetPEI"
                className="shadow-sm focus:ring-theme-primary dark:focus:ring-dark-theme-primary focus:border-theme-primary dark:focus:border-dark-theme-primary mt-1 block w-full sm:text-sm bg-theme-bg-muted dark:bg-dark-theme-bg-muted border-theme-border dark:border-dark-theme-border rounded-md p-2 disabled:bg-theme-bg-base dark:disabled:bg-dark-theme-bg-base text-theme-text-base dark:text-dark-theme-text-base placeholder-theme-text-muted dark:placeholder-dark-theme-text-muted"
                value={targetPEI}
                onChange={(e) => setTargetPEI(e.target.value)}
                disabled={!isEditing}
                placeholder="e.g., IET, IMechE, ICE"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    if(profile) { 
                        setCareerSummary(profile.careerSummary);
                        setTargetPEI(profile.targetPEI);
                    }
                  }}
                  className="px-4 py-2 border border-theme-border dark:border-dark-theme-border rounded-md shadow-sm text-sm font-medium text-theme-text-base dark:text-dark-theme-text-base bg-theme-bg-muted dark:bg-dark-theme-bg-muted hover:bg-theme-bg-hover dark:hover:bg-dark-theme-bg-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-dark-theme-primary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-theme-primary dark:bg-dark-theme-primary hover:bg-theme-primary/80 dark:hover:bg-dark-theme-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary dark:focus:ring-dark-theme-primary"
                >
                  Save Changes
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-theme-secondary dark:bg-dark-theme-secondary hover:bg-theme-secondary/80 dark:hover:bg-dark-theme-secondary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-secondary dark:focus:ring-dark-theme-secondary"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
