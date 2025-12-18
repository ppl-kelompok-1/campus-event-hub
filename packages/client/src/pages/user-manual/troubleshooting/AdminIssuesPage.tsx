import ReactMarkdown from 'react-markdown';
import { UserManualLayout } from '../../../components/UserManualLayout';
import contentMd from '../../../docs/user-manual/troubleshooting/admin-issues.md?raw';

export default function AdminIssuesPage() {
  return (
    <UserManualLayout>
      <ReactMarkdown>{contentMd}</ReactMarkdown>
    </UserManualLayout>
  );
}
