import React, { useState, useRef } from 'react';
import { manusPesquisa } from '@/functions/manusPesquisa';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Search, Loader2, CheckCircle2, Clock, XCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

const STATUS_CONFIG = {
  running: { label: 'Pesquisando...', icon: Loader2, color: 'text-blue-600', spin: true, bg: 'bg-blue-50 border-blue-200' },
  pending: { label: 'Aguardando...', icon: Clock, color: 'text-yellow-600', spin: false, bg: 'bg-yellow-50 border-yellow-200' },
  completed: { label: 'Concluído', icon: CheckCircle2, color: 'text-green-600', spin: false, bg: 'bg-green-50 border-green-200' },
  error: { label: 'Erro', icon: XCircle, color: 'text-red-600', spin: false, bg: 'bg-red-50 border-red-200' },
};

export default function PesquisaProfunda() {
  const [prompt, setPrompt] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const pollRefs = useRef({});

  const pollStatus = (taskId) => {
    const intervalId = setInterval(async () => {
      try {
        const res = await manusPesquisa({ action: 'status', task_id: taskId });
        const { status, result, task_url } = res.data;

        setTasks(prev => prev.map(t =>
          t.task_id === taskId ? { ...t, status, result, task_url } : t
        ));

        if (status === 'completed' || status === 'error') {
          clearInterval(pollRefs.current[taskId]);
          delete pollRefs.current[taskId];
        }
      } catch {
        clearInterval(pollRefs.current[taskId]);
        delete pollRefs.current[taskId];
        setTasks(prev => prev.map(t =>
          t.task_id === taskId ? { ...t, status: 'error' } : t
        ));
      }
    }, 5000);
    pollRefs.current[taskId] = intervalId;
  };

  const handleSubmit = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    try {
      const res = await manusPesquisa({ action: 'create', prompt: prompt.trim() });
      const { task_id, status, task_url } = res.data;
      const newTask = {
        task_id,
        status,
        task_url,
        prompt: prompt.trim(),
        result: null,
        expanded: true,
        created_at: new Date(),
      };
      setTasks(prev => [newTask, ...prev]);
      setPrompt('');
      pollStatus(task_id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (taskId) => {
    setTasks(prev => prev.map(t =>
      t.task_id === taskId ? { ...t, expanded: !t.expanded } : t
    ));
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-slate-50">
      {/* Header */}
      <div className="p-4 border-b border-purple-100 bg-white shrink-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Search className="w-4 h-4 text-purple-600" />
          </div>
          <h2 className="font-bold text-slate-800">Pesquisa Profunda</h2>
          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">by Manus.ia</span>
        </div>
        <p className="text-xs text-slate-500">Tarefas complexas de pesquisa e análise com IA avançada. Pode levar alguns minutos.</p>
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-b border-slate-100 shrink-0">
        <Textarea
          placeholder="Ex: Analise as tendências de turismo em Trancoso para 2025 e sugira estratégias de marketing..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={3}
          className="resize-none text-sm mb-3 border-purple-200 focus:border-purple-400"
        />
        <Button
          onClick={handleSubmit}
          disabled={!prompt.trim() || loading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
        >
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Search className="w-4 h-4 mr-2" />}
          {loading ? 'Enviando...' : 'Iniciar Pesquisa'}
        </Button>
      </div>

      {/* Tasks list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {tasks.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Nenhuma pesquisa ainda.</p>
            <p className="text-xs">Envie uma tarefa acima para começar.</p>
          </div>
        )}

        {tasks.map((task) => {
          const cfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.running;
          const Icon = cfg.icon;
          return (
            <div key={task.task_id} className={`rounded-xl border p-4 bg-white shadow-sm ${task.status === 'running' || task.status === 'pending' ? 'border-blue-200' : ''}`}>
              {/* Task header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-slate-800 line-clamp-2 flex-1">{task.prompt}</p>
                <button onClick={() => toggleExpand(task.task_id)} className="text-slate-400 hover:text-slate-600 shrink-0">
                  {task.expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {/* Status badge */}
              <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
                <Icon className={`w-3 h-3 ${cfg.spin ? 'animate-spin' : ''}`} />
                {cfg.label}
                {(task.status === 'running' || task.status === 'pending') && (
                  <span className="text-slate-400 ml-1">verificando a cada 5s...</span>
                )}
              </div>

              {/* Expandable result */}
              {task.expanded && task.result && (
                <div className="mt-3 pt-3 border-t border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Resultado</p>
                  <div className="prose prose-sm max-w-none text-slate-700">
                    <ReactMarkdown>{task.result}</ReactMarkdown>
                  </div>
                </div>
              )}

              {/* Task URL */}
              {task.task_url && (
                <a
                  href={task.task_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800"
                >
                  <ExternalLink className="w-3 h-3" />
                  Ver no Manus.ia
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}