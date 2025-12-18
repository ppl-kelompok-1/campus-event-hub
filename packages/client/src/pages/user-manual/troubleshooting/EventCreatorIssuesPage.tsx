import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { UserManualLayout } from '../../../components/UserManualLayout';
import contentMd from '../../../docs/user-manual/troubleshooting/event-creator-issues.md?raw';

export default function EventCreatorIssuesPage() {
  return (
    <UserManualLayout>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{contentMd}</ReactMarkdown>
    </UserManualLayout>
  );
}
