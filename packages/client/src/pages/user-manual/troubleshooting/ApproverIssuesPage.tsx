import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserManualLayout } from '../../../components/UserManualLayout';
import contentMd from '../../../docs/user-manual/troubleshooting/approver-issues.md?raw';

export default function ApproverIssuesPage() {
  return (
    <UserManualLayout>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentMd}</ReactMarkdown>
    </UserManualLayout>
  );
}
