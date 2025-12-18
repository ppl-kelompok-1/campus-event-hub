import { Link } from 'react-router-dom';
import '../styles/UserManualIndex.css';

interface Page {
  title: string;
  path: string;
}

interface Section {
  role: string;
  icon: string;
  description: string;
  pages: Page[];
}

export default function UserManualIndexPage() {
  const sections: Section[] = [
    {
      role: 'Getting Started',
      icon: '🚀',
      description: 'Learn the basics of using Campus Event Hub',
      pages: [
        { title: 'Login', path: '/user-manual/getting-started/login' }
      ]
    },
    {
      role: 'For All Users',
      icon: '👤',
      description: 'Features available to all authenticated users',
      pages: [
        { title: 'Viewing Profile', path: '/user-manual/users/viewing-profile' },
        { title: 'Updating Profile', path: '/user-manual/users/updating-profile' },
        { title: 'Registering for Events', path: '/user-manual/users/registering-events' },
        { title: 'Unregistering from Events', path: '/user-manual/users/unregistering-events' }
      ]
    },
    {
      role: 'For Event Creators',
      icon: '📝',
      description: 'Create and manage your own events',
      pages: [
        { title: 'Creating an Event', path: '/user-manual/event-creators/creating-event' },
        { title: 'Submitting for Approval', path: '/user-manual/event-creators/submitting-event' },
        { title: 'Editing an Event', path: '/user-manual/event-creators/editing-event' },
        { title: 'Deleting an Event', path: '/user-manual/event-creators/deleting-event' },
        { title: 'Canceling an Event', path: '/user-manual/event-creators/canceling-event' }
      ]
    },
    {
      role: 'For Approvers',
      icon: '✅',
      description: 'Review and approve events submitted by users',
      pages: [
        { title: 'Approving an Event', path: '/user-manual/approvers/approving-event' },
        { title: 'Requesting Revision', path: '/user-manual/approvers/requesting-revision' },
        { title: 'Publishing Directly', path: '/user-manual/approvers/publishing-directly' }
      ]
    },
    {
      role: 'For Administrators',
      icon: '👥',
      description: 'Manage users, locations, and system configuration',
      pages: [
        { title: 'Creating Users', path: '/user-manual/administrators/creating-user' },
        { title: 'Creating Locations', path: '/user-manual/administrators/creating-location' },
        { title: 'Toggling Locations', path: '/user-manual/administrators/toggling-location' }
      ]
    },
    {
      role: 'For Superadministrators',
      icon: '⚙️',
      description: 'Configure site-wide settings and branding',
      pages: [
        { title: 'Updating Settings', path: '/user-manual/superadministrators/updating-settings' },
        { title: 'Uploading Logo', path: '/user-manual/superadministrators/uploading-logo' }
      ]
    },
    {
      role: 'Troubleshooting',
      icon: '🔧',
      description: 'Solutions for common problems and technical issues',
      pages: [
        { title: 'Common Issues', path: '/user-manual/troubleshooting/common-issues' },
        { title: 'Event Creator Issues', path: '/user-manual/troubleshooting/event-creator-issues' },
        { title: 'Approver Issues', path: '/user-manual/troubleshooting/approver-issues' },
        { title: 'Administrator Issues', path: '/user-manual/troubleshooting/admin-issues' },
        { title: 'Technical Issues', path: '/user-manual/troubleshooting/technical-issues' }
      ]
    }
  ];

  return (
    <div className="user-manual-index">
      <div className="user-manual-index-header">
        <h1>📖 Campus Event Hub User Manual</h1>
        <p className="user-manual-index-subtitle">
          Welcome to the Campus Event Hub User Manual. Find step-by-step guides organized by your role below.
        </p>
      </div>

      <div className="user-manual-sections">
        {sections.map((section) => (
          <section key={section.role} className="user-manual-role-section">
            <div className="role-section-header">
              <h2>
                <span className="role-icon">{section.icon}</span>
                {section.role}
              </h2>
              <p className="role-description">{section.description}</p>
            </div>

            <div className="role-page-cards">
              {section.pages.map((page) => (
                <Link
                  key={page.path}
                  to={page.path}
                  className="page-card"
                >
                  <span className="page-card-title">{page.title}</span>
                  <span className="page-card-arrow">→</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <footer className="user-manual-index-footer">
        <p>
          <strong>Need help?</strong> Contact your system administrator or the Campus Event Hub support team.
        </p>
      </footer>
    </div>
  );
}
