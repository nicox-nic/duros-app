'use client';

import { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, Loader2, X, Wrench, MessageSquareWarning, Lightbulb, AlertOctagon, type LucideIcon } from 'lucide-react';
import { Button } from './ui';
import { cn } from '@/lib/utils';
import type { TicketType, StaffDepartment } from '@/lib/types';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
}

interface TicketDraft {
  type: TicketType;
  title: string;
  description: string;
  department: StaffDepartment;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

/**
 * Conversational AI ticket assistant. Walks the resident through:
 * 1. Issue description
 * 2. Confirms type / department (auto-detected from keywords)
 * 3. Confirms priority (auto-detected from urgency keywords)
 * 4. Preview + submit
 *
 * All "AI" decisions are deterministic keyword matching against the user input
 * to keep the demo dependency-free and reliable.
 */
export function TicketChatbot({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (draft: TicketDraft) => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [stage, setStage] = useState<'describe' | 'confirm-type' | 'confirm-priority' | 'preview' | 'thinking'>('describe');
  const [draft, setDraft] = useState<TicketDraft>({
    type: 'repair',
    title: '',
    description: '',
    department: 'Maintenance',
    priority: 'medium',
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Reset on open
  useEffect(() => {
    if (open) {
      setMessages([
        {
          id: 'init',
          role: 'assistant',
          content:
            "Hi! I'm here to help log your request. Just tell me what's going on — in your own words. For example: \"My kitchen sink is leaking again\" or \"The hallway light has been out for 3 days.\"",
        },
      ]);
      setStage('describe');
      setInput('');
      setDraft({ type: 'repair', title: '', description: '', department: 'Maintenance', priority: 'medium' });
    }
  }, [open]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, stage]);

  const pushAssistant = (content: string) => {
    setMessages((m) => [...m, { id: `a-${Date.now()}-${Math.random()}`, role: 'assistant', content }]);
  };
  const pushUser = (content: string) => {
    setMessages((m) => [...m, { id: `u-${Date.now()}-${Math.random()}`, role: 'user', content }]);
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || stage === 'thinking') return;

    pushUser(text);
    setInput('');

    if (stage === 'describe') {
      // Detect type, department, priority, generate title
      const detected = analyzeIssue(text);
      setDraft({ ...detected, description: text });

      setStage('thinking');
      setTimeout(() => {
        const typeLabel = TYPE_LABELS[detected.type];
        pushAssistant(
          `Got it. This sounds like a **${typeLabel.toLowerCase()}** issue that should go to **${detected.department}**. Is that right?`
        );
        setStage('confirm-type');
      }, 900);
    } else if (stage === 'confirm-type') {
      // Treat any text response as accept; chip buttons handle corrections
      setStage('thinking');
      setTimeout(() => {
        const isUrgent = draft.priority === 'urgent';
        pushAssistant(
          isUrgent
            ? "This sounds urgent. I'll mark it as **Urgent priority** with a 4-hour response window. Sound good?"
            : `I'll mark this as **${draft.priority} priority**. You can change it if needed.`
        );
        setStage('confirm-priority');
      }, 700);
    } else if (stage === 'confirm-priority') {
      setStage('thinking');
      setTimeout(() => {
        pushAssistant(
          `Here's your draft ticket — review it below and tap **Submit** to send it, or tell me what to fix.`
        );
        setStage('preview');
      }, 700);
    } else if (stage === 'preview') {
      // User asked for a change — append to description and replay preview
      const updated = { ...draft, description: `${draft.description}\n\nAdditional context: ${text}` };
      setDraft(updated);
      setStage('thinking');
      setTimeout(() => {
        pushAssistant("Updated. Here's the revised draft.");
        setStage('preview');
      }, 600);
    }
  };

  const acceptStage = (acceptValue?: string) => {
    if (stage === 'confirm-type') {
      pushUser(acceptValue ?? 'Yes, that\'s right.');
      setStage('thinking');
      setTimeout(() => {
        const isUrgent = draft.priority === 'urgent';
        pushAssistant(
          isUrgent
            ? "This sounds urgent. I'll mark it as **Urgent priority** with a 4-hour response window. Sound good?"
            : `I'll mark this as **${draft.priority} priority**. You can change it if needed.`
        );
        setStage('confirm-priority');
      }, 600);
    } else if (stage === 'confirm-priority') {
      pushUser(acceptValue ?? 'Yes, that works.');
      setStage('thinking');
      setTimeout(() => {
        pushAssistant(
          `Here's your draft ticket — review it below and tap **Submit** to send it, or tell me what to fix.`
        );
        setStage('preview');
      }, 600);
    }
  };

  const setTypeAndDept = (type: TicketType, department: StaffDepartment) => {
    setDraft((d) => ({ ...d, type, department }));
    pushUser(`Actually, it's more of a ${TYPE_LABELS[type].toLowerCase()} — send it to ${department}.`);
    acceptStage(`Sure, let's go with ${TYPE_LABELS[type]} → ${department}.`);
  };

  const setPriority = (priority: TicketDraft['priority']) => {
    setDraft((d) => ({ ...d, priority }));
    pushUser(`Use ${priority} priority.`);
    acceptStage(`Got it, ${priority} priority.`);
  };

  const handleFinalSubmit = () => {
    onSubmit(draft);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm grid place-items-center md:place-items-center p-0 md:p-6">
      <div className="bg-white w-full md:w-[480px] md:max-w-[92vw] md:rounded-3xl md:shadow-soft-lg flex flex-col h-[100dvh] md:h-[640px] md:max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 md:px-5 md:py-4 border-b border-line shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-charcoal to-charcoal-soft grid place-items-center text-champagne-soft shrink-0">
            <Sparkles size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[13px] md:text-[14px] font-semibold">AI Ticket Assistant</div>
            <div className="text-[10px] md:text-[11px] text-mist">Powered by Duros AI</div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 grid place-items-center rounded-xl text-mist hover:bg-charcoal/[0.04] hover:text-charcoal transition-colors shrink-0"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-5 scrollbar-none">
          <div className="space-y-3">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}

            {stage === 'thinking' && (
              <div className="flex items-center gap-2 px-3 py-2 text-[11px] text-mist">
                <Loader2 size={12} className="animate-spin" />
                <span>Thinking…</span>
              </div>
            )}

            {/* Inline action chips */}
            {stage === 'confirm-type' && (
              <div className="space-y-2 mt-2">
                <div className="text-[10px] uppercase tracking-wider text-mist font-semibold pl-1">
                  Or correct me
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {TYPE_OPTIONS.filter(
                    (opt) => !(opt.type === draft.type && opt.department === draft.department)
                  ).slice(0, 4).map((opt) => (
                    <button
                      key={`${opt.type}-${opt.department}`}
                      onClick={() => setTypeAndDept(opt.type, opt.department)}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-line bg-white hover:border-line-strong text-left text-[10.5px] font-medium transition-colors"
                    >
                      <opt.icon size={11} className="text-mist shrink-0" />
                      <span className="truncate">{TYPE_LABELS[opt.type]} → {opt.department}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => acceptStage()}
                  className="w-full px-3 py-2 mt-1 rounded-lg bg-charcoal text-ivory text-[11px] font-semibold"
                >
                  Yes, that&apos;s right
                </button>
              </div>
            )}

            {stage === 'confirm-priority' && (
              <div className="space-y-2 mt-2">
                <div className="text-[10px] uppercase tracking-wider text-mist font-semibold pl-1">
                  Priority
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['low', 'medium', 'high', 'urgent'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={cn(
                        'px-2 py-1.5 rounded-lg text-[10.5px] font-semibold capitalize transition-all border',
                        draft.priority === p
                          ? 'bg-charcoal text-ivory border-charcoal'
                          : 'bg-white border-line text-slate hover:border-line-strong'
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => acceptStage()}
                  className="w-full px-3 py-2 mt-1 rounded-lg bg-charcoal text-ivory text-[11px] font-semibold"
                >
                  Looks good
                </button>
              </div>
            )}

            {stage === 'preview' && (
              <div className="mt-2 rounded-2xl bg-ivory-deep/60 border border-line p-3">
                <div className="text-[10px] uppercase tracking-wider text-mist font-semibold mb-2">
                  Draft Ticket
                </div>
                <div className="space-y-1.5 text-[11px] md:text-[12px]">
                  <Row label="Title" value={draft.title || draft.description.slice(0, 48) + (draft.description.length > 48 ? '…' : '')} />
                  <Row label="Type" value={TYPE_LABELS[draft.type]} />
                  <Row label="Department" value={draft.department} />
                  <Row label="Priority" value={draft.priority} capitalize />
                </div>
                <div className="border-t border-line mt-2.5 pt-2.5 text-[11px] text-slate whitespace-pre-wrap">
                  {draft.description}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button variant="secondary" fullWidth onClick={onClose}>
                    Use Form Instead
                  </Button>
                  <Button fullWidth onClick={handleFinalSubmit}>
                    <Send size={12} className="inline-block mr-1" /> Submit Ticket
                  </Button>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        {stage !== 'preview' && (
          <div className="border-t border-line p-3 md:p-3.5 shrink-0">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={
                  stage === 'describe'
                    ? "Describe your issue…"
                    : stage === 'confirm-type'
                    ? 'Or type a correction…'
                    : stage === 'confirm-priority'
                    ? 'Or type your preferred priority…'
                    : 'Type a message…'
                }
                disabled={stage === 'thinking'}
                className="flex-1 px-3.5 py-2.5 bg-ivory-deep/60 border border-line rounded-xl text-[12.5px] focus:outline-none focus:border-line-strong disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || stage === 'thinking'}
                className="w-10 h-10 grid place-items-center rounded-xl bg-charcoal text-ivory disabled:opacity-40 shrink-0"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isAssistant = message.role === 'assistant';
  return (
    <div className={cn('flex', isAssistant ? 'justify-start' : 'justify-end')}>
      <div
        className={cn(
          'max-w-[85%] px-3.5 py-2.5 text-[12px] md:text-[13px] leading-snug',
          isAssistant
            ? 'bg-ivory-deep/60 text-charcoal rounded-2xl rounded-tl-md'
            : 'bg-gradient-to-br from-charcoal to-charcoal-soft text-ivory rounded-2xl rounded-tr-md'
        )}
      >
        {renderInlineMarkdown(message.content)}
      </div>
    </div>
  );
}

function Row({ label, value, capitalize }: { label: string; value: string; capitalize?: boolean }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-mist text-[10.5px] uppercase tracking-wider font-semibold pt-0.5">{label}</span>
      <span className={cn('text-charcoal font-medium text-right', capitalize && 'capitalize')}>{value}</span>
    </div>
  );
}

/** Lightweight inline **bold** support for chat bubbles. */
function renderInlineMarkdown(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

// ============================================================================
// Mock AI analyzer — keyword-based heuristics
// ============================================================================

const TYPE_LABELS: Record<TicketType, string> = {
  repair: 'Repair',
  complaint: 'Complaint',
  suggestion: 'Suggestion',
  incident: 'Incident',
};

const TYPE_OPTIONS: { type: TicketType; department: StaffDepartment; icon: LucideIcon }[] = [
  { type: 'repair', department: 'Maintenance', icon: Wrench },
  { type: 'repair', department: 'Engineering', icon: Wrench },
  { type: 'repair', department: 'Utility', icon: Wrench },
  { type: 'complaint', department: 'Management', icon: MessageSquareWarning },
  { type: 'incident', department: 'Security', icon: AlertOctagon },
  { type: 'suggestion', department: 'Management', icon: Lightbulb },
];

function analyzeIssue(text: string): TicketDraft {
  const lower = text.toLowerCase();

  // Type detection
  let type: TicketType = 'repair';
  if (/(complain|too loud|loud|noise|neighbor|annoying|rude)/.test(lower)) type = 'complaint';
  else if (/(suggest|idea|recommend|wish|propose|improvement)/.test(lower)) type = 'suggestion';
  else if (/(intruder|stolen|theft|robbery|incident|emergency|fire|smoke|injured|fight|threat)/.test(lower)) type = 'incident';

  // Department detection
  let department: StaffDepartment = 'Maintenance';
  if (/(electric|wire|outlet|breaker|power|circuit|short|spark)/.test(lower)) department = 'Engineering';
  else if (/(elevator|lift|escalator|generator|pump|hvac)/.test(lower)) department = 'Engineering';
  else if (/(water|leak|drip|pipe|drain|clog|toilet|sink|faucet|tap)/.test(lower)) department = 'Utility';
  else if (/(billing|invoice|soa|charge|payment|fee|bill|dues)/.test(lower)) department = 'Accounting';
  else if (/(security|intruder|guard|gate|entry|stolen|theft|cctv|alarm)/.test(lower)) department = 'Security';

  if (type === 'complaint' || type === 'suggestion') department = 'Management';
  if (type === 'incident' && department === 'Maintenance') department = 'Security';

  // Priority detection
  let priority: TicketDraft['priority'] = 'medium';
  if (/(urgent|emergency|now|asap|immediately|right away|critical|dangerous|flood|fire|smoke|sparks|injured)/.test(lower)) priority = 'urgent';
  else if (/(soon|quickly|hurry|important|priority)/.test(lower)) priority = 'high';
  else if (/(sometime|whenever|no rush|low priority|minor)/.test(lower)) priority = 'low';

  // Title generation — first sentence, capped to ~60 chars
  const firstSentence = text.split(/[.!?\n]/)[0].trim();
  const title = firstSentence.length > 60 ? firstSentence.slice(0, 57) + '…' : firstSentence;
  const properTitle = title.charAt(0).toUpperCase() + title.slice(1);

  return { type, department, priority, title: properTitle, description: text };
}
