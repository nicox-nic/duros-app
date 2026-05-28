'use client';

import { create } from 'zustand';
import type {
  Property,
  User,
  Ticket,
  Announcement,
  WorkPermit,
  GatePass,
  SpecialPermit,
  BillingStatement,
  Message,
  AIInsight,
  AIReport,
  TicketStatus,
  TicketUpdate,
} from './types';

import { mockProperties, DEFAULT_PROPERTY_ID } from './mock/properties';
import { mockUsers, DEFAULT_STAFF_USER_ID } from './mock/users';
import { mockTickets } from './mock/tickets';
import {
  mockAnnouncements,
  mockWorkPermits,
  mockGatePasses,
  mockSpecialPermits,
  mockBillingStatements,
  mockMessages,
  mockInsights,
  mockReports,
} from './mock/everything';

// =============================================================================
// STORE SHAPE
// =============================================================================

interface AppState {
  // ----- Identity / context -----
  currentPropertyId: string;
  currentUserId: string;

  // ----- Data (single source of truth) -----
  properties: Property[];
  users: User[];
  tickets: Ticket[];
  announcements: Announcement[];
  workPermits: WorkPermit[];
  gatePasses: GatePass[];
  specialPermits: SpecialPermit[];
  billingStatements: BillingStatement[];
  messages: Message[];
  insights: AIInsight[];
  reports: AIReport[];

  // ----- Realtime simulation tick (increments to force re-renders) -----
  realtimeTick: number;

  // ----- Beep flash (for new message notifications) -----
  newMessageFlash: number;

  // =========================================================================
  // ACTIONS
  // =========================================================================

  // Identity
  setCurrentUser: (userId: string) => void;
  setCurrentProperty: (propertyId: string) => void;

  // Tickets
  createTicket: (ticket: Omit<Ticket, 'id' | 'reference' | 'createdAt' | 'updates'>) => Ticket;
  assignTicket: (ticketId: string, assigneeId: string) => void;
  updateTicketStatus: (ticketId: string, status: TicketStatus, note?: string) => void;
  addTicketUpdate: (ticketId: string, update: Omit<TicketUpdate, 'id' | 'timestamp'>) => void;

  // Realtime simulation
  tickRealtime: () => void;
  flashNewMessage: () => void;

  // Messages
  markMessageRead: (messageId: string) => void;
  pushMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;

  // Permits
  createWorkPermit: (permit: Omit<WorkPermit, 'id' | 'reference' | 'createdAt' | 'approvals'>) => WorkPermit;
  createGatePass: (pass: Omit<GatePass, 'id' | 'reference' | 'qrCode'>) => GatePass;
  createSpecialPermit: (permit: Omit<SpecialPermit, 'id' | 'reference' | 'createdAt'>) => SpecialPermit;

  // Staff
  createStaffMember: (user: Omit<User, 'id' | 'isOnline' | 'initials'>) => User;
  approveStaffMember: (userId: string) => void;
  rejectStaffMember: (userId: string) => void;

  // Billing
  payStatement: (statementId: string) => void;
  disputeStatement: (statementId: string, reason: string) => void;

  // Gate pass actions
  checkInGatePass: (passId: string) => void;
  checkOutGatePass: (passId: string) => void;

  // Work permit approvals
  approveWorkPermit: (permitId: string, by: 'engineer' | 'manager' | 'security', approver: string, approved: boolean) => void;

  // Reports
  generateCustomReport: (input: Omit<AIReport, 'id' | 'generatedAt'>) => AIReport;
}

// =============================================================================
// UTILITIES
// =============================================================================

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generateTicketReference(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const seq = String(Math.floor(Math.random() * 999)).padStart(3, '0');
  return `R-${yyyy}-${mmdd}-${seq}`;
}

function generateReference(prefix: string): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
  const seq = String(Math.floor(Math.random() * 999)).padStart(3, '0');
  return `${prefix}-${yyyy}-${mmdd}-${seq}`;
}

function computeInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

// =============================================================================
// STORE
// =============================================================================

export const useAppStore = create<AppState>((set, get) => ({
  // ----- Initial state -----
  currentPropertyId: DEFAULT_PROPERTY_ID,
  currentUserId: DEFAULT_STAFF_USER_ID,

  properties: mockProperties,
  users: mockUsers,
  tickets: mockTickets,
  announcements: mockAnnouncements,
  workPermits: mockWorkPermits,
  gatePasses: mockGatePasses,
  specialPermits: mockSpecialPermits,
  billingStatements: mockBillingStatements,
  messages: mockMessages,
  insights: mockInsights,
  reports: mockReports,

  realtimeTick: 0,
  newMessageFlash: 0,

  // ----- Identity actions -----
  setCurrentUser: (userId) => set({ currentUserId: userId }),
  setCurrentProperty: (propertyId) => set({ currentPropertyId: propertyId }),

  // ----- Ticket actions -----
  createTicket: (input) => {
    const newTicket: Ticket = {
      ...input,
      id: generateId('tkt'),
      reference: generateTicketReference(),
      createdAt: new Date().toISOString(),
      updates: [
        {
          id: generateId('upd'),
          timestamp: new Date().toISOString(),
          type: 'status_change',
          authorId: input.resident.id,
          authorName: input.resident.name,
          content: 'Ticket created by resident.',
          status: input.status,
        },
      ],
    };

    set((state) => ({ tickets: [newTicket, ...state.tickets] }));

    // Also push a message into the staff inbox
    get().pushMessage({
      propertyId: input.propertyId,
      category: 'resident',
      fromId: input.resident.id,
      fromName: input.resident.name,
      fromInitials: input.resident.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2),
      fromRole: 'resident',
      toId: 'user-alex',
      subject: `${input.resident.unitNumber} — ${input.title}`,
      preview: input.description.slice(0, 80),
      body: input.description,
      unread: true,
      relatedTicketId: newTicket.id,
    });

    return newTicket;
  },

  assignTicket: (ticketId, assigneeId) => {
    const assignee = get().users.find((u) => u.id === assigneeId);
    const me = get().users.find((u) => u.id === get().currentUserId);
    if (!assignee) return;

    set((state) => ({
      tickets: state.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          assignedTo: { id: assignee.id, name: assignee.fullName },
          updates: [
            ...t.updates,
            {
              id: generateId('upd'),
              timestamp: new Date().toISOString(),
              type: 'assigned',
              authorId: me?.id ?? 'system',
              authorName: me?.fullName ?? 'System',
              content: `Assigned to ${assignee.fullName} (${assignee.department}).`,
            },
          ],
        };
      }),
    }));

    // Notify resident
    const ticket = get().tickets.find((t) => t.id === ticketId);
    if (ticket) {
      get().pushMessage({
        propertyId: ticket.propertyId,
        category: 'ticket_comment',
        fromId: me?.id ?? 'system',
        fromName: me?.fullName ?? 'Property Management',
        fromInitials: me?.initials ?? 'PM',
        fromRole: me?.role ?? 'system',
        toId: ticket.resident.id,
        subject: `${ticket.reference} assigned`,
        preview: `Your ticket has been assigned to ${assignee.fullName}.`,
        body: `Your ticket "${ticket.title}" has been assigned to ${assignee.fullName} from ${assignee.department}. They will reach out shortly.`,
        unread: true,
        relatedTicketId: ticket.id,
      });
    }
  },

  updateTicketStatus: (ticketId, status, note) => {
    const me = get().users.find((u) => u.id === get().currentUserId);

    set((state) => ({
      tickets: state.tickets.map((t) => {
        if (t.id !== ticketId) return t;
        return {
          ...t,
          status,
          completedAt: status === 'completed' ? new Date().toISOString() : t.completedAt,
          updates: [
            ...t.updates,
            {
              id: generateId('upd'),
              timestamp: new Date().toISOString(),
              type: 'status_change',
              authorId: me?.id ?? 'system',
              authorName: me?.fullName ?? 'System',
              content: note ?? `Status changed to ${status.replace(/_/g, ' ')}.`,
              status,
            },
          ],
        };
      }),
    }));
  },

  addTicketUpdate: (ticketId, update) => {
    set((state) => ({
      tickets: state.tickets.map((t) =>
        t.id === ticketId
          ? {
              ...t,
              updates: [
                ...t.updates,
                {
                  ...update,
                  id: generateId('upd'),
                  timestamp: new Date().toISOString(),
                },
              ],
            }
          : t
      ),
    }));
  },

  // ----- Realtime -----
  tickRealtime: () => set((state) => ({ realtimeTick: state.realtimeTick + 1 })),
  flashNewMessage: () => set((state) => ({ newMessageFlash: state.newMessageFlash + 1 })),

  // ----- Messages -----
  markMessageRead: (messageId) => {
    set((state) => ({
      messages: state.messages.map((m) =>
        m.id === messageId ? { ...m, unread: false } : m
      ),
    }));
  },

  pushMessage: (input) => {
    const newMsg: Message = {
      ...input,
      id: generateId('msg'),
      timestamp: new Date().toISOString(),
    };
    set((state) => ({ messages: [newMsg, ...state.messages] }));
    get().flashNewMessage();
  },

  // ----- Permit creation -----
  createWorkPermit: (input) => {
    const newPermit: WorkPermit = {
      ...input,
      id: generateId('wp'),
      reference: generateReference('WP'),
      createdAt: new Date().toISOString(),
      approvals: {},
    };
    set((state) => ({ workPermits: [newPermit, ...state.workPermits] }));

    // Notify staff inbox
    const me = get().users.find((u) => u.id === get().currentUserId);
    get().pushMessage({
      propertyId: input.propertyId,
      category: 'permit',
      fromId: me?.id ?? input.resident.id,
      fromName: me?.fullName ?? input.resident.name,
      fromInitials: me?.initials ?? computeInitials(input.resident.name),
      fromRole: me?.role ?? 'resident',
      toId: 'user-alex',
      subject: `Work Permit — ${input.workDescription.slice(0, 40)}`,
      preview: `New work permit submitted for Unit ${input.unitNumber}. Awaiting engineering review.`,
      body: `A new work permit (${newPermit.reference}) has been submitted for Unit ${input.unitNumber}. Contractor: ${input.contractor}. Scope: ${input.scope}.`,
      unread: true,
      relatedPermitId: newPermit.id,
    });

    return newPermit;
  },

  createGatePass: (input) => {
    const newPass: GatePass = {
      ...input,
      id: generateId('gp'),
      reference: generateReference('GP'),
      qrCode: `GP-${Date.now()}-QR`,
    };
    set((state) => ({ gatePasses: [newPass, ...state.gatePasses] }));

    // Notify security inbox
    const me = get().users.find((u) => u.id === get().currentUserId);
    get().pushMessage({
      propertyId: input.propertyId,
      category: 'permit',
      fromId: me?.id ?? 'system',
      fromName: me?.fullName ?? 'Property Management',
      fromInitials: me?.initials ?? 'PM',
      fromRole: me?.role ?? 'system',
      toId: 'user-carlos',
      subject: `Gate Pass — ${input.visitorName}`,
      preview: `New ${input.type.replace(/_/g, ' ')} pass for Unit ${input.hostUnit}.`,
      body: `Gate pass ${newPass.reference} created for ${input.visitorName} visiting Unit ${input.hostUnit}.`,
      unread: true,
    });

    return newPass;
  },

  createSpecialPermit: (input) => {
    const newPermit: SpecialPermit = {
      ...input,
      id: generateId('sp'),
      reference: generateReference('SP'),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ specialPermits: [newPermit, ...state.specialPermits] }));

    const me = get().users.find((u) => u.id === get().currentUserId);
    get().pushMessage({
      propertyId: input.propertyId,
      category: 'permit',
      fromId: me?.id ?? input.resident.id,
      fromName: me?.fullName ?? input.resident.name,
      fromInitials: me?.initials ?? computeInitials(input.resident.name),
      fromRole: me?.role ?? 'resident',
      toId: 'user-alex',
      subject: `Special Permit — ${input.type.replace(/_/g, ' ')}`,
      preview: `Unit ${input.unitNumber}: ${input.details.slice(0, 60)}`,
      body: `Special permit ${newPermit.reference} submitted for ${input.type.replace(/_/g, ' ')}. Details: ${input.details}`,
      unread: true,
      relatedPermitId: newPermit.id,
    });

    return newPermit;
  },

  // ----- Staff creation -----
  createStaffMember: (input) => {
    const newUser: User = {
      ...input,
      id: generateId('user'),
      isOnline: false,
      initials: computeInitials(input.fullName),
    };
    set((state) => ({ users: [...state.users, newUser] }));
    return newUser;
  },

  approveStaffMember: (userId) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, approvalStatus: 'approved' as const } : u
      ),
    }));
  },

  rejectStaffMember: (userId) => {
    set((state) => ({
      users: state.users.map((u) =>
        u.id === userId ? { ...u, approvalStatus: 'rejected' as const } : u
      ),
    }));
  },

  // ----- Billing -----
  payStatement: (statementId) => {
    const statement = get().billingStatements.find((s) => s.id === statementId);
    if (!statement) return;

    set((state) => ({
      billingStatements: state.billingStatements.map((s) =>
        s.id === statementId
          ? { ...s, status: 'paid' as const, paidAt: new Date().toISOString() }
          : s
      ),
    }));

    // Notify accounting
    const me = get().users.find((u) => u.id === get().currentUserId);
    get().pushMessage({
      propertyId: statement.propertyId,
      category: 'billing',
      fromId: me?.id ?? statement.resident.id,
      fromName: me?.fullName ?? statement.resident.name,
      fromInitials: me?.initials ?? computeInitials(statement.resident.name),
      fromRole: me?.role ?? 'resident',
      toId: 'user-jenny',
      subject: `Payment received — ${statement.reference}`,
      preview: `Unit ${statement.unitNumber} settled their ${statement.reference} statement.`,
      body: `Payment confirmed for ${statement.reference}. Amount: ₱${statement.totalDue.toLocaleString()}.`,
      unread: true,
    });
  },

  disputeStatement: (statementId, reason) => {
    const statement = get().billingStatements.find((s) => s.id === statementId);
    if (!statement) return;
    const me = get().users.find((u) => u.id === get().currentUserId);

    get().pushMessage({
      propertyId: statement.propertyId,
      category: 'billing',
      fromId: me?.id ?? statement.resident.id,
      fromName: me?.fullName ?? statement.resident.name,
      fromInitials: me?.initials ?? computeInitials(statement.resident.name),
      fromRole: me?.role ?? 'resident',
      toId: 'user-jenny',
      subject: `Billing Dispute — ${statement.reference}`,
      preview: `Unit ${statement.unitNumber} is disputing ${statement.reference}.`,
      body: `Dispute for statement ${statement.reference} (Unit ${statement.unitNumber}, ₱${statement.totalDue.toLocaleString()}).\n\nReason: ${reason}`,
      unread: true,
    });
  },

  // ----- Gate pass actions -----
  checkInGatePass: (passId) => {
    const now = new Date().toISOString();
    set((state) => ({
      gatePasses: state.gatePasses.map((p) =>
        p.id === passId ? { ...p, status: 'in' as const, timeIn: now } : p
      ),
    }));
    const pass = get().gatePasses.find((p) => p.id === passId);
    if (pass) {
      // Notify host resident
      const resident = get().users.find(
        (u) => u.role === 'resident' && u.unitNumber === pass.hostUnit && u.propertyId === pass.propertyId
      );
      if (resident) {
        get().pushMessage({
          propertyId: pass.propertyId,
          category: 'permit',
          fromId: 'user-carlos',
          fromName: 'Security',
          fromInitials: 'SC',
          fromRole: 'security',
          toId: resident.id,
          subject: `${pass.visitorName} just arrived`,
          preview: `Your guest checked in at the gate.`,
          body: `Your visitor ${pass.visitorName}${pass.plateNumber ? ` (${pass.plateNumber})` : ''} checked in at the gate.`,
          unread: true,
        });
      }
    }
  },

  checkOutGatePass: (passId) => {
    const now = new Date().toISOString();
    set((state) => ({
      gatePasses: state.gatePasses.map((p) =>
        p.id === passId ? { ...p, status: 'out' as const, timeOut: now } : p
      ),
    }));
  },

  // ----- Work permit approvals -----
  approveWorkPermit: (permitId, by, approver, approved) => {
    const me = get().users.find((u) => u.id === get().currentUserId);
    const now = new Date().toISOString();

    set((state) => ({
      workPermits: state.workPermits.map((p) => {
        if (p.id !== permitId) return p;
        const newApprovals = { ...p.approvals, [by]: { by: approver, at: now, approved } };

        // Determine next status based on approval chain
        let newStatus = p.status;
        if (!approved) {
          newStatus = 'rejected';
        } else {
          // Engineer → Manager → Security (or Approved if all done)
          const eng = newApprovals.engineer?.approved;
          const mgr = newApprovals.manager?.approved;
          const sec = newApprovals.security?.approved;
          if (eng && mgr && sec) newStatus = 'approved';
          else if (eng && mgr) newStatus = 'approved'; // security optional for some scopes
          else if (eng) newStatus = 'for_manager_approval';
          else newStatus = 'for_engineer_review';
        }

        return { ...p, approvals: newApprovals, status: newStatus };
      }),
    }));

    // Notify resident
    const permit = get().workPermits.find((p) => p.id === permitId);
    if (permit) {
      const stageLabel = { engineer: 'Engineering', manager: 'Manager', security: 'Security' }[by];
      get().pushMessage({
        propertyId: permit.propertyId,
        category: 'permit',
        fromId: me?.id ?? 'system',
        fromName: me?.fullName ?? 'Property Management',
        fromInitials: me?.initials ?? 'PM',
        fromRole: me?.role ?? 'system',
        toId: permit.resident.id,
        subject: `Work Permit ${approved ? 'approved' : 'rejected'} — ${stageLabel}`,
        preview: `${permit.reference}: ${stageLabel} ${approved ? 'cleared' : 'rejected'} your work permit.`,
        body: `Your work permit ${permit.reference} (${permit.scope}) has been ${approved ? 'approved' : 'rejected'} by ${stageLabel}. ${approved ? 'Awaiting next approval stage if applicable.' : 'Please contact the property office for details.'}`,
        unread: true,
        relatedPermitId: permit.id,
      });
    }
  },

  // ----- Custom reports -----
  generateCustomReport: (input) => {
    const newReport: AIReport = {
      ...input,
      id: generateId('rpt'),
      generatedAt: new Date().toISOString(),
    };
    set((state) => ({ reports: [newReport, ...state.reports] }));
    return newReport;
  },
}));

// =============================================================================
// SELECTORS — derived data, scoped to current property/user
// =============================================================================

export function useCurrentUser() {
  return useAppStore((s) => s.users.find((u) => u.id === s.currentUserId)!);
}

export function useCurrentProperty() {
  return useAppStore((s) => s.properties.find((p) => p.id === s.currentPropertyId)!);
}

export function useUnreadCount() {
  return useAppStore(
    (s) => s.messages.filter((m) => m.propertyId === s.currentPropertyId && m.unread).length
  );
}
