
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface text-theme-text-base dark:text-dark-theme-text-base py-8 mt-12 border-t border-theme-border dark:border-dark-theme-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-4">
          <h4 className="font-semibold mb-2 text-lg">Disclaimer</h4>
          <p className="text-sm text-theme-text-muted dark:text-dark-theme-text-muted">
            This AI-powered tool is designed to assist you in preparing your Chartered Engineer (CEng) application. 
            It provides guidance based on the UK Standard for Professional Engineering Competence (UK-SPEC).
          </p>
          <p className="text-sm text-theme-text-muted dark:text-dark-theme-text-muted mt-1">
            The AI's feedback on your evidence is indicative and based solely on the information you provide. 
            It does not constitute a formal assessment by a Professional Engineering Institution and does not guarantee CEng registration or a successful outcome in your formal application.
          </p>
          <p className="text-sm text-theme-text-muted dark:text-dark-theme-text-muted mt-1">
            The ultimate responsibility for the content, accuracy, and completeness of your CEng application rests entirely with you, the applicant.
            Formal assessment for CEng registration involves holistic human judgment by experienced assessors. This tool cannot replicate that comprehensive human assessment process.
          </p>
           <p className="text-sm text-theme-text-muted dark:text-dark-theme-text-muted mt-1">
            Always seek guidance from experienced mentors, Professional Registration Advisors (PRAs), and your sponsors.
          </p>
        </div>
        <p className="text-sm text-theme-text-muted dark:text-dark-theme-text-muted">
          &copy; {new Date().getFullYear()} CharterMe. All rights reserved. Built for demonstration purposes.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
