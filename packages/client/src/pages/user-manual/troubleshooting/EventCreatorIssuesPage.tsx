import ReactMarkdown from 'react-markdown';
import { UserManualLayout } from '../../../components/UserManualLayout';
import contentMd from '../../../docs/user-manual/troubleshooting/event-creator-issues.md?raw';

export default function EventCreatorIssuesPage() {
  return (
    <UserManualLayout>
      <ReactMarkdown>{contentMd}</ReactMarkdown>
    </UserManualLayout>
  );
}
