import ReactMarkdown from 'react-markdown';
import { UserManualLayout } from '../../../components/UserManualLayout';
import contentMd from '../../../docs/user-manual/troubleshooting/approver-issues.md?raw';

export default function ApproverIssuesPage() {
  return (
    <UserManualLayout>
      <ReactMarkdown>{contentMd}</ReactMarkdown>
    </UserManualLayout>
  );
}
