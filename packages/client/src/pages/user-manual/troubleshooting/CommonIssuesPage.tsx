import ReactMarkdown from 'react-markdown';
import { UserManualLayout } from '../../../components/UserManualLayout';
import contentMd from '../../../docs/user-manual/troubleshooting/common-issues.md?raw';

export default function CommonIssuesPage() {
  return (
    <UserManualLayout>
      <ReactMarkdown>{contentMd}</ReactMarkdown>
    </UserManualLayout>
  );
}
