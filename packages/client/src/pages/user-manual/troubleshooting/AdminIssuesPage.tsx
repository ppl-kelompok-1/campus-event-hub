import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserManualLayout } from '../../../components/UserManualLayout';
import contentMd from '../../../docs/user-manual/troubleshooting/admin-issues.md?raw';

export default function AdminIssuesPage() {
  return (
    <UserManualLayout>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentMd}</ReactMarkdown>
    </UserManualLayout>
  );
}
