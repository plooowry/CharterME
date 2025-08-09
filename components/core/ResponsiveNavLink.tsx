
import React from 'react';
import { NavLink, NavLinkProps as OriginalNavLinkProps, NavLinkRenderProps } from 'react-router-dom';
import { IconName } from './Icon';
import Icon from './Icon';

// Define custom props specific to ResponsiveNavLink
interface ResponsiveNavLinkCustomProps {
  iconName?: IconName;
  children: React.ReactNode; // Simplified 'children' prop type
}

// Combine OriginalNavLinkProps with our custom props.
// We Omit 'children' from OriginalNavLinkProps because we are providing our own simpler definition.
// All other props from OriginalNavLinkProps (like 'to', 'className', 'end', 'style', etc.) will be included.
export type ResponsiveNavLinkProps = Omit<OriginalNavLinkProps, 'children'> & ResponsiveNavLinkCustomProps;

const ResponsiveNavLink: React.FC<ResponsiveNavLinkProps> = ({ 
  iconName, 
  children, 
  className, // className is inherited from OriginalNavLinkProps
  ...navLinkSpecificProps // This captures 'to', 'end', 'style', etc.
}) => {
  const baseClasses = "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out";
  
  const inactiveClasses = "text-theme-text-muted dark:text-dark-theme-text-muted hover:bg-theme-primary/20 dark:hover:bg-dark-theme-primary/20 hover:text-theme-link-text dark:hover:text-dark-theme-link-text"; 
  const activeClasses = "bg-theme-primary dark:bg-dark-theme-primary text-white dark:text-white";

  return (
    <NavLink
      {...navLinkSpecificProps} // Pass through all other NavLink props like 'to', 'end', etc.
      className={(navLinkRenderProps: NavLinkRenderProps) => {
        const { isActive } = navLinkRenderProps;
        const linkCoreClasses = `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`;
        // 'className' here is the prop passed to ResponsiveNavLink itself
        if (typeof className === 'function') {
          // NavLink's own className can be a function, so we pass NavLinkRenderProps
          return `${linkCoreClasses} ${className(navLinkRenderProps) || ''}`.trim();
        }
        return `${linkCoreClasses} ${className || ''}`.trim();
      }}
    >
      {iconName && <Icon name={iconName} className="w-5 h-5 mr-2" />}
      {children}
    </NavLink>
  );
};

export default ResponsiveNavLink;
