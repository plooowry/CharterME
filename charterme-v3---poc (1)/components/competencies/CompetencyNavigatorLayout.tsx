
import React from 'react';
import { NavLink, Outlet, useParams, useLocation } from 'react-router-dom';
import { COMPETENCY_AREAS, UK_SPEC_COMPETENCIES } from '../../constants';
import { CompetencyAreaCode } from '../../types';
import PageTitle from '../core/PageTitle';
import Icon from '../core/Icon';

const CompetencyNavigatorLayout: React.FC = () => {
  const { areaCode, subCode } = useParams<{ areaCode?: CompetencyAreaCode, subCode?: string }>();
  const location = useLocation();

  const selectedArea = COMPETENCY_AREAS.find(a => a.code === areaCode);
  const selectedSubCompetency = UK_SPEC_COMPETENCIES.find(sc => sc.Sub_Competency_Code === subCode);

  let title = "UK-SPEC Competency Navigator";
  let subtitle = "Select a competency area to begin.";

  if (selectedArea && !selectedSubCompetency) {
    title = `Area ${selectedArea.code}: ${selectedArea.title}`;
    subtitle = "Select a sub-competency to view details and add evidence.";
  } else if (selectedSubCompetency) {
    title = `${selectedSubCompetency.Sub_Competency_Code}: ${selectedSubCompetency.Sub_Competency_Title}`;
    subtitle = `Viewing details for Area ${selectedSubCompetency.Competency_Area_Code}.`;
  }


  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <PageTitle title={title} subtitle={subtitle} />
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        <aside className="w-full md:w-1/3 lg:w-1/4 bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-lg self-start">
          <h3 className="text-lg font-semibold text-theme-text-base dark:text-dark-theme-text-base mb-4">Competency Areas</h3>
          <nav className="space-y-1">
            {COMPETENCY_AREAS.map((area) => (
              <div key={area.code}>
                <NavLink
                  to={`/competencies/${area.code}`}
                  className={({ isActive }) =>
                    `flex justify-between items-center w-full px-3 py-2.5 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out group ${
                      isActive && location.pathname === `/competencies/${area.code}` 
                      ? 'bg-theme-primary dark:bg-dark-theme-primary text-white dark:text-white' 
                      : 'text-theme-text-muted dark:text-dark-theme-text-muted hover:bg-theme-primary/20 dark:hover:bg-dark-theme-primary/20 hover:text-theme-primary dark:hover:text-dark-theme-primary'
                    }`
                  }
                >
                  <span>{area.code}: {area.title}</span>
                  <Icon name={areaCode === area.code ? "chevronDown" : "chevronRight"} className="w-4 h-4 text-current" />
                </NavLink>
                {areaCode === area.code && (
                  <div className="pl-4 mt-1 space-y-1 border-l-2 border-theme-primary/40 dark:border-dark-theme-primary/40 ml-2">
                    {UK_SPEC_COMPETENCIES.filter(sc => sc.Competency_Area_Code === area.code).map(sub => (
                      <NavLink
                        key={sub.Sub_Competency_Code}
                        to={`/competencies/${area.code}/${sub.Sub_Competency_Code}`}
                        className={({ isActive }) =>
                          `block px-3 py-2 text-xs rounded-md transition-colors duration-150 ease-in-out ${
                            isActive 
                            ? 'bg-theme-primary/30 dark:bg-dark-theme-primary/30 text-theme-primary dark:text-dark-theme-primary font-semibold' 
                            : 'text-theme-text-muted dark:text-dark-theme-text-muted hover:bg-theme-primary/20 dark:hover:bg-dark-theme-primary/20 hover:text-theme-primary dark:hover:text-dark-theme-primary'
                          }`
                        }
                      >
                        {sub.Sub_Competency_Code}: {sub.Sub_Competency_Title.substring(0,35)}...
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <main className="w-full md:w-2/3 lg:w-3/4">
          {!areaCode && !subCode && (
             <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-lg text-center">
                <Icon name="info" className="w-12 h-12 text-theme-primary dark:text-dark-theme-primary mx-auto mb-4" />
                <p className="text-theme-text-muted dark:text-dark-theme-text-muted">Please select a competency area from the list on the left to get started.</p>
             </div>
          )}
          {areaCode && !subCode && (
             <div className="bg-theme-bg-surface dark:bg-dark-theme-bg-surface p-6 rounded-xl shadow-lg text-center">
                <Icon name="info" className="w-12 h-12 text-theme-primary dark:text-dark-theme-primary mx-auto mb-4" />
                <p className="text-theme-text-muted dark:text-dark-theme-text-muted">Please select a sub-competency from the list on the left to view its details and manage your evidence.</p>
             </div>
          )}
          <Outlet /> 
        </main>
      </div>
    </div>
  );
};

export default CompetencyNavigatorLayout;
