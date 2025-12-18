import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserManualLayout } from '../../../components/UserManualLayout';
import contentMd from '../../../docs/user-manual/troubleshooting/common-issues.md?raw';

export default function CommonIssuesPage() {
  return (
    <UserManualLayout>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentMd}</ReactMarkdown>
    </UserManualLayout>
  );
}
