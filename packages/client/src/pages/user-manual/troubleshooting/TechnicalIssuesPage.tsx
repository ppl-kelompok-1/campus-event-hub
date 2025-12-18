import ReactMarkdown from 'react-markdown';
import { UserManualLayout } from '../../../components/UserManualLayout';
import contentMd from '../../../docs/user-manual/troubleshooting/technical-issues.md?raw';

export default function TechnicalIssuesPage() {
  return (
    <UserManualLayout>
      <ReactMarkdown>{contentMd}</ReactMarkdown>
    </UserManualLayout>
  );
}
