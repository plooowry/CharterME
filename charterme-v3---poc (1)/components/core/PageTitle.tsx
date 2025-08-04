
import React from 'react';

interface PageTitleProps {
  title: string;
  subtitle?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle }) => {
  return (
    <div className="mb-6">
      <h1 className="text-3xl font-bold text-theme-text-base dark:text-dark-theme-text-base">{title}</h1>
      {subtitle && <p className="text-theme-text-muted dark:text-dark-theme-text-muted mt-1">{subtitle}</p>}
    </div>
  );
};

export default PageTitle;
