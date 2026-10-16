import { useEffect } from 'react';
import TocaTrIAPremium from '@/components/assistente/TocaTrIAPremium';

export default function AssistentevirtualPage() {
  useEffect(() => {
    document.title = 'Assistente IA TrIA | Trancoso Resolve';
  }, []);
  return <TocaTrIAPremium />;
}
