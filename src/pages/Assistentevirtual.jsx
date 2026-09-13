import { useEffect } from 'react';
import TocaTrIAPremium from '@/components/assistente/TocaTrIAPremium';

export default function AssistentevirtualPage() {
  useEffect(() => {
    document.title = 'Assistente IA TryA | Trancoso Resolve';
  }, []);
  return <TocaTrIAPremium />;
}
