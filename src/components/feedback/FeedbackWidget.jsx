import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    try {
      // TODO: Send feedback to backend
      console.log('Feedback:', feedback);
      setFeedback('');
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      console.error('Feedback error:', error);
    }
  };

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg z-40"
          aria-label="Abrir feedback"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-2xl z-50 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900">Envie seu Feedback</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-6">
              <p className="text-green-600 font-semibold">Obrigado pelo seu feedback!</p>
            </div>
          ) : (
            <>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Diga-nos o que você acha..."
                className="w-full p-3 border border-slate-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                rows={4}
              />
              <Button
                onClick={handleSubmit}
                disabled={!feedback.trim()}
                className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar
              </Button>
            </>
          )}
        </div>
      )}
    </>
  );
}