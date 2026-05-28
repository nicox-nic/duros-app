'use client';

import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useAppStore, useCurrentUser, useCurrentProperty } from '@/lib/store';
import { Badge, IconBox, Button } from '@/components/ui';
import { PageHeader } from '@/components/PageHeader';
import { Sheet } from '@/components/Sheet';
import { Textarea } from '@/components/Form';
import { formatPeso, formatDate } from '@/lib/utils';
import { generateSOAPdf } from '@/lib/pdf';
import type { BillingStatement, Property } from '@/lib/types';
import { CreditCard, Droplets, Zap, ChevronDown, ChevronUp, FileText, Download, Check, MessageSquare, Send } from 'lucide-react';

export default function ResidentBillingPage() {
  const user = useCurrentUser();
  const property = useCurrentProperty();
  const statements = useAppStore(
    useShallow((s) => s.billingStatements.filter((b) => b.resident.id === user?.id))
  );
  const payStatement = useAppStore((s) => s.payStatement);
  const disputeStatement = useAppStore((s) => s.disputeStatement);

  const [payingId, setPayingId] = useState<string | null>(null);
  const [showPaid, setShowPaid] = useState(false);
  const [disputeId, setDisputeId] = useState<string | null>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [showDisputeSent, setShowDisputeSent] = useState(false);

  const disputeStatementObj = statements.find((s) => s.id === disputeId);

  const handleSubmitDispute = () => {
    if (!disputeId || !disputeReason.trim()) return;
    disputeStatement(disputeId, disputeReason.trim());
    setDisputeId(null);
    setDisputeReason('');
    setShowDisputeSent(true);
    setTimeout(() => setShowDisputeSent(false), 1800);
  };

  const outstanding = statements
    .filter((s) => s.status === 'sent' || s.status === 'overdue')
    .reduce((sum, s) => sum + s.totalDue, 0);

  const oldestUnpaid = statements
    .filter((s) => s.status === 'sent' || s.status === 'overdue')
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())[0];

  const handlePay = (id: string) => {
    setPayingId(id);
    setTimeout(() => {
      payStatement(id);
      setPayingId(null);
      setShowPaid(true);
      setTimeout(() => setShowPaid(false), 1800);
    }, 1200);
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-none md:overflow-visible">
      <div className="md:max-w-[700px] md:mx-auto md:px-8 md:py-8">
        <PageHeader title="My Billing" backHref="/home" description="Your statements and payment history." />

        {/* Outstanding summary */}
        <div className="bg-gradient-to-br from-charcoal to-charcoal-soft text-ivory rounded-2xl p-5 md:p-6 mb-4 md:mb-5 shadow-soft-md">
          <div className="text-[10px] md:text-[11px] uppercase tracking-[0.18em] text-champagne-soft font-semibold">Outstanding Balance</div>
          <div className="font-display text-[28px] md:text-[36px] font-medium tracking-tight mt-1 mb-3">
            {formatPeso(outstanding)}
          </div>
          {outstanding > 0 && oldestUnpaid && (
            <Button
              fullWidth
              onClick={() => handlePay(oldestUnpaid.id)}
              disabled={!!payingId}
            >
              {payingId === oldestUnpaid.id ? 'Processing payment…' : `Pay ${formatPeso(oldestUnpaid.totalDue)}`}
            </Button>
          )}
          {outstanding === 0 && (
            <div className="text-[11px] md:text-[13px] text-ivory/60">You&apos;re all caught up. Thank you!</div>
          )}
        </div>

        {/* Statements list */}
        <div className="text-[10px] uppercase tracking-[0.06em] text-mist font-semibold mb-2 md:text-[11px]">All Statements</div>
        <div className="space-y-3 pb-6">
          {statements.length === 0 ? (
            <div className="bg-white border border-line rounded-2xl p-8 text-center">
              <IconBox color="gold" size="lg" className="mx-auto mb-3">
                <CreditCard size={20} />
              </IconBox>
              <div className="font-display text-[15px] md:text-[18px] font-medium mb-1">No statements yet</div>
              <div className="text-[11px] md:text-[13px] text-mist">Statements appear here once generated.</div>
            </div>
          ) : (
            statements.map((s) => (
              <SOACard
                key={s.id}
                soa={s}
                property={property}
                onPay={() => handlePay(s.id)}
                onDispute={() => { setDisputeId(s.id); setDisputeReason(''); }}
                isPaying={payingId === s.id}
                disablePay={!!payingId}
              />
            ))
          )}
        </div>
      </div>

      {showPaid && (
        <div className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm grid place-items-center p-6">
          <div className="bg-white rounded-3xl shadow-soft-lg p-6 md:p-8 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-success-bg text-success grid place-items-center mx-auto mb-4">
              <Check size={26} strokeWidth={2.5} />
            </div>
            <div className="font-display text-[18px] md:text-[20px] font-medium mb-1.5">Payment Successful</div>
            <div className="text-[12px] md:text-[13.5px] text-mist">Thank you. A receipt was sent to your inbox.</div>
          </div>
        </div>
      )}

      {/* DISPUTE MODAL */}
      {disputeId && disputeStatementObj && (
        <Sheet
          onClose={() => setDisputeId(null)}
          title="Dispute Charges"
          description={`Statement ${disputeStatementObj.reference} · ${formatPeso(disputeStatementObj.totalDue)}`}
        >
          <div className="bg-info-bg/40 border border-info/15 rounded-xl px-3 py-2.5 mb-3 text-[11px] md:text-[12.5px] text-info">
            Your message will be sent to the accounting team. They&apos;ll respond within 1–2 business days.
          </div>
          <div className="text-[10px] uppercase tracking-wider text-mist font-semibold mb-1.5">
            Reason for Dispute
          </div>
          <Textarea
            autoFocus
            rows={4}
            placeholder="e.g., The water charge looks much higher than usual…"
            value={disputeReason}
            onChange={(e) => setDisputeReason(e.target.value)}
          />
          <div className="flex gap-2 mt-3">
            <Button variant="secondary" fullWidth onClick={() => setDisputeId(null)}>
              Cancel
            </Button>
            <Button fullWidth onClick={handleSubmitDispute} disabled={!disputeReason.trim()}>
              <Send size={13} className="mr-1.5 inline-block" /> Submit Dispute
            </Button>
          </div>
        </Sheet>
      )}

      {showDisputeSent && (
        <div className="fixed inset-0 z-[200] bg-charcoal/40 backdrop-blur-sm grid place-items-center p-6">
          <div className="bg-white rounded-3xl shadow-soft-lg p-6 md:p-8 text-center max-w-sm">
            <div className="w-14 h-14 rounded-2xl bg-info-bg text-info grid place-items-center mx-auto mb-4">
              <MessageSquare size={22} />
            </div>
            <div className="font-display text-[18px] md:text-[20px] font-medium mb-1.5">Dispute Sent</div>
            <div className="text-[12px] md:text-[13.5px] text-mist">Accounting will respond shortly via your inbox.</div>
          </div>
        </div>
      )}
    </div>
  );
}

function SOACard({
  soa,
  property,
  onPay,
  onDispute,
  isPaying,
  disablePay,
}: {
  soa: BillingStatement;
  property: Property | undefined;
  onPay: () => void;
  onDispute: () => void;
  isPaying: boolean;
  disablePay: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const canPay = soa.status === 'sent' || soa.status === 'overdue';

  return (
    <div className="bg-white border border-line rounded-2xl overflow-hidden shadow-soft-sm">
      <button onClick={() => setExpanded(!expanded)} className="w-full p-3 md:p-4 flex items-center gap-3 text-left">
        <IconBox color={soa.status === 'paid' ? 'green' : soa.status === 'overdue' ? 'red' : 'gold'} size="md">
          <FileText size={16} />
        </IconBox>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-2 mb-0.5">
            <div className="text-[12.5px] md:text-[14px] font-semibold">
              {formatDate(soa.periodEnd, { month: 'long', year: 'numeric' })} SOA
            </div>
            <SOABadge status={soa.status} />
          </div>
          <div className="text-[10px] md:text-[12px] text-mist">
            Due {formatDate(soa.dueDate)} · <span className="font-mono">{soa.reference}</span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-display text-[14px] md:text-[18px] font-medium">{formatPeso(soa.totalDue, { compact: true })}</div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-mist" /> : <ChevronDown size={16} className="text-mist" />}
      </button>

      {expanded && (
        <div className="px-3 md:px-4 pb-4 border-t border-line">
          {/* Meters */}
          <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
            {soa.meters.map((m) => (
              <div key={m.type} className="bg-ivory-deep rounded-xl p-2.5">
                <div className="flex items-center gap-1.5 mb-1">
                  {m.type === 'water' ? <Droplets size={11} className="text-info" /> : <Zap size={11} className="text-warning" />}
                  <div className="text-[9.5px] md:text-[10.5px] text-mist uppercase tracking-wider font-semibold">{m.type}</div>
                </div>
                <div className="font-display text-[14px] md:text-[16px] font-medium">{m.current.toLocaleString()} {m.unit}</div>
                <div className="text-[9px] md:text-[10.5px] text-mist mt-0.5">Prev: {m.previous.toLocaleString()} {m.unit}</div>
              </div>
            ))}
          </div>

          {/* Charges */}
          <div className="divide-y divide-line">
            {soa.charges.map((c, i) => (
              <div key={i} className="flex justify-between py-2 text-[11px] md:text-[12.5px]">
                <span className="text-slate">{c.label}</span>
                <span className="font-display font-medium">{formatPeso(c.amount)}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between mt-3 pt-3 border-t border-line">
            <span className="text-[11px] md:text-[12.5px] font-semibold">Total</span>
            <span className="font-display text-[14px] md:text-[16px] font-medium">{formatPeso(soa.totalDue)}</span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => property && generateSOAPdf(soa, property.name)}
            >
              <Download size={13} className="mr-1.5 inline-block" /> PDF
            </Button>
            {canPay && (
              <>
                <Button variant="secondary" fullWidth onClick={onDispute}>
                  <MessageSquare size={13} className="mr-1.5 inline-block" /> Dispute
                </Button>
                <Button fullWidth onClick={onPay} disabled={disablePay}>
                  {isPaying ? 'Processing…' : 'Pay Now'}
                </Button>
              </>
            )}
            {!canPay && (
              <Button variant="secondary" fullWidth onClick={onDispute}>
                <MessageSquare size={13} className="mr-1.5 inline-block" /> Dispute
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SOABadge({ status }: { status: string }) {
  const map: Record<string, { variant: 'urgent' | 'pending' | 'progress' | 'complete'; label: string }> = {
    draft: { variant: 'pending', label: 'Pending' },
    sent: { variant: 'progress', label: 'Unpaid' },
    paid: { variant: 'complete', label: 'Paid' },
    overdue: { variant: 'urgent', label: 'Overdue' },
  };
  const config = map[status] ?? { variant: 'pending' as const, label: status };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
