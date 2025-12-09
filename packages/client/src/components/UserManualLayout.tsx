import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../styles/UserManualLayout.css';

interface NavigationPage {
  path: string;
  title: string;
}

interface NavigationSection {
  title: string;
  icon: string;
  pages: NavigationPage[];
}

interface UserManualLayoutProps {
  children: React.ReactNode;
}

export const UserManualLayout: React.FC<UserManualLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation: Record<string, NavigationSection> = {
    'getting-started': {
      title: 'Getting Started',
      icon: '🚀',
      pages: [
        { path: '/user-manual/getting-started/login', title: 'Login' }
      ]
    },
    'users': {
      title: 'For All Users',
      icon: '👤',
      pages: [
        { path: '/user-manual/users/viewing-profile', title: 'Viewing Profile' },
        { path: '/user-manual/users/updating-profile', title: 'Updating Profile' },
        { path: '/user-manual/users/registering-events', title: 'Registering for Events' },
        { path: '/user-manual/users/unregistering-events', title: 'Unregistering from Events' }
      ]
    },
    'event-creators': {
      title: 'For Event Creators',
      icon: '📝',
      pages: [
        { path: '/user-manual/event-creators/creating-event', title: 'Creating an Event' },
        { path: '/user-manual/event-creators/submitting-event', title: 'Submitting for Approval' },
        { path: '/user-manual/event-creators/editing-event', title: 'Editing an Event' },
        { path: '/user-manual/event-creators/deleting-event', title: 'Deleting an Event' },
        { path: '/user-manual/event-creators/canceling-event', title: 'Canceling an Event' }
      ]
    },
    'approvers': {
      title: 'For Approvers',
      icon: '✅',
      pages: [
        { path: '/user-manual/approvers/approving-event', title: 'Approving an Event' },
        { path: '/user-manual/approvers/requesting-revision', title: 'Requesting Revision' },
        { path: '/user-manual/approvers/publishing-directly', title: 'Publishing Directly' }
      ]
    },
    'administrators': {
      title: 'For Administrators',
      icon: '👥',
      pages: [
        { path: '/user-manual/administrators/creating-user', title: 'Creating Users' },
        { path: '/user-manual/administrators/creating-location', title: 'Creating Locations' },
        { path: '/user-manual/administrators/toggling-location', title: 'Toggling Locations' }
      ]
    },
    'superadministrators': {
      title: 'For Superadministrators',
      icon: '⚙️',
      pages: [
        { path: '/user-manual/superadministrators/updating-settings', title: 'Updating Settings' },
        { path: '/user-manual/superadministrators/uploading-logo', title: 'Uploading Logo' }
      ]
    }
  };

  // Generate breadcrumbs from current path
  const getBreadcrumbs = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/' }];

    if (pathParts[0] === 'user-manual') {
      breadcrumbs.push({ name: 'User Manual', path: '/user-manual' });

      if (pathParts.length > 1) {
        // Find the section and page
        for (const section of Object.values(navigation)) {
          const page = section.pages.find(p => p.path === location.pathname);
          if (page) {
            breadcrumbs.push({ name: section.title, path: '#' });
            breadcrumbs.push({ name: page.title, path: location.pathname });
            break;
          }
        }
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="user-manual-layout">
      {/* Mobile Menu Button */}
      <button
        className="manual-mobile-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation"
      >
        ☰
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="manual-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside className={`manual-sidebar ${sidebarOpen ? 'manual-sidebar-open' : ''}`}>
        <div className="manual-sidebar-header">
          <Link to="/user-manual" className="manual-sidebar-title">
            📖 User Manual
          </Link>
          <button
            className="manual-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            ×
          </button>
        </div>

        <nav className="manual-sidebar-nav">
          {Object.entries(navigation).map(([key, section]) => (
            <div key={key} className="manual-nav-section">
              <div className="manual-nav-section-title">
                <span className="manual-nav-icon">{section.icon}</span>
                {section.title}
              </div>
              <ul className="manual-nav-pages">
                {section.pages.map((page) => (
                  <li key={page.path}>
                    <Link
                      to={page.path}
                      className={`manual-nav-link ${location.pathname === page.path ? 'manual-nav-link-active' : ''}`}
                      onClick={() => window.innerWidth <= 768 && setSidebarOpen(false)}
                    >
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="manual-main-content">
        {/* Breadcrumbs */}
        <nav className="manual-breadcrumbs" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, index) => (
            <span key={crumb.path} className="manual-breadcrumb-item">
              {index > 0 && <span className="manual-breadcrumb-separator">/</span>}
              {index < breadcrumbs.length - 1 ? (
                <Link to={crumb.path} className="manual-breadcrumb-link">
                  {crumb.name}
                </Link>
              ) : (
                <span className="manual-breadcrumb-current">{crumb.name}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Page Content */}
        <div className="manual-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};
