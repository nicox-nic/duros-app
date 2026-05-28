// =============================================================================
// CORE DOMAIN TYPES — multi-tenant from the start
// =============================================================================

export type ID = string;
export type ISODate = string;

// ----- Property (the tenant) -----
export interface Property {
  id: ID;
  name: string;
  address: string;
  type: 'condominium' | 'subdivision' | 'mixed-use';
  towers: number;
  totalUnits: number;
}

// ----- Users & Roles -----
export type UserRole =
  | 'super_admin'
  | 'property_manager'
  | 'maintenance'
  | 'accounting'
  | 'engineer'
  | 'security'
  | 'utility'
  | 'other_staff'
  | 'resident';

export type StaffDepartment =
  | 'Maintenance'
  | 'Accounting'
  | 'Engineering'
  | 'Security'
  | 'Utility'
  | 'Management'
  | 'Other';

export interface User {
  id: ID;
  propertyId: ID;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  // Staff-specific
  employeeId?: string;
  department?: StaffDepartment;
  // Resident-specific
  unitNumber?: string;
  tower?: string;
  // Status
  isOnline: boolean;
  workloadPct?: number; // 0-100, staff only
  approvalStatus: 'pending' | 'approved' | 'rejected';
  avatarUrl?: string;
  initials: string;
}

// ----- Tickets -----
export type TicketType = 'repair' | 'complaint' | 'suggestion' | 'incident';

export type TicketStatus =
  | 'urgent'
  | 'pending'
  | 'for_approval'
  | 'approved'
  | 'rejected'
  | 'in_progress'
  | 'completed'
  | 'reopened';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TicketUpdate {
  id: ID;
  timestamp: ISODate;
  type: 'assigned' | 'status_change' | 'note' | 'photo' | 'message';
  authorId: ID;
  authorName: string;
  content: string;
  status?: TicketStatus;
}

export interface Ticket {
  id: ID;
  reference: string; // e.g. "R-2024-0514-001"
  propertyId: ID;
  type: TicketType;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  // Source
  resident: {
    id: ID;
    name: string;
    unitNumber: string;
    tower: string;
  };
  // Routing
  department: StaffDepartment;
  assignedTo?: {
    id: ID;
    name: string;
  };
  // Timing
  createdAt: ISODate;
  slaDeadline?: ISODate; // for SLA countdown
  completedAt?: ISODate;
  // Attachments
  photos: string[]; // URLs
  // Activity
  updates: TicketUpdate[];
}

// ----- Announcements -----
export type AnnouncementType =
  | 'water'
  | 'power'
  | 'elevator'
  | 'fire_drill'
  | 'pest_control'
  | 'garbage'
  | 'event'
  | 'payment'
  | 'security'
  | 'general';

export type AnnouncementAudience =
  | 'all_residents'
  | 'tower'
  | 'floor'
  | 'unit'
  | 'staff'
  | 'security'
  | 'maintenance'
  | 'commercial';

export interface Announcement {
  id: ID;
  propertyId: ID;
  type: AnnouncementType;
  title: string;
  message: string;
  audiences: AnnouncementAudience[];
  audienceDetails?: {
    towers?: string[];
    floors?: number[];
    units?: string[];
  };
  scheduledAt?: ISODate;
  publishedAt?: ISODate;
  pushEnabled: boolean;
  sendToHomeAI: boolean;
  authorId: ID;
  authorName: string;
}

// ----- Permits -----
export type PermitStatus =
  | 'pending'
  | 'for_engineer_review'
  | 'for_manager_approval'
  | 'approved'
  | 'rejected'
  | 'expired'
  | 'completed';

export type WorkPermitScope =
  | 'renovation'
  | 'aircon'
  | 'cabinet'
  | 'plumbing'
  | 'electrical'
  | 'tile'
  | 'painting'
  | 'other';

export interface WorkPermit {
  id: ID;
  reference: string;
  propertyId: ID;
  unitNumber: string;
  resident: { id: ID; name: string };
  workDescription: string;
  scope: WorkPermitScope;
  contractor: string;
  startDate: ISODate;
  endDate: ISODate;
  workers: { name: string; idNumber: string }[];
  documents: string[];
  status: PermitStatus;
  approvals: {
    engineer?: { by: string; at: ISODate; approved: boolean };
    manager?: { by: string; at: ISODate; approved: boolean };
    security?: { by: string; at: ISODate; approved: boolean };
  };
  createdAt: ISODate;
}

export type GatePassType =
  | 'visitor'
  | 'delivery'
  | 'contractor'
  | 'move_in'
  | 'move_out'
  | 'furniture'
  | 'vehicle'
  | 'guest_parking';

export interface GatePass {
  id: ID;
  reference: string;
  propertyId: ID;
  type: GatePassType;
  visitorName: string;
  plateNumber?: string;
  idNumber?: string;
  hostUnit: string;
  hostName: string;
  timeIn?: ISODate;
  timeOut?: ISODate;
  expiresAt: ISODate;
  status: 'pending' | 'approved' | 'in' | 'out' | 'expired' | 'rejected';
  qrCode: string;
}

export type SpecialPermitType =
  | 'amenity'
  | 'function_room'
  | 'pool_party'
  | 'moving'
  | 'pet'
  | 'temp_parking'
  | 'overnight_guest'
  | 'commercial'
  | 'photoshoot'
  | 'drone'
  | 'extended_hours';

export interface SpecialPermit {
  id: ID;
  reference: string;
  propertyId: ID;
  type: SpecialPermitType;
  unitNumber: string;
  resident: { id: ID; name: string };
  details: string;
  startAt: ISODate;
  endAt: ISODate;
  status: PermitStatus;
  createdAt: ISODate;
}

// ----- Billing / SOA -----
export interface MeterReading {
  type: 'water' | 'electric';
  current: number;
  previous: number;
  unit: 'm³' | 'kWh';
  photoUrl?: string;
}

export interface BillingCharge {
  label: string;
  amount: number;
}

export interface BillingStatement {
  id: ID;
  reference: string; // e.g. "SOA-2024-05-1502"
  propertyId: ID;
  unitNumber: string;
  resident: { id: ID; name: string };
  periodStart: ISODate;
  periodEnd: ISODate;
  dueDate: ISODate;
  meters: MeterReading[];
  charges: BillingCharge[];
  previousBalance: number;
  totalDue: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  sentAt?: ISODate;
  paidAt?: ISODate;
}

// ----- Inbox / Messages -----
export type MessageCategory =
  | 'resident'
  | 'internal_staff'
  | 'ticket_comment'
  | 'billing'
  | 'permit'
  | 'announcement'
  | 'urgent_alert'
  | 'manager_instruction'
  | 'home_ai';

export interface Message {
  id: ID;
  propertyId: ID;
  category: MessageCategory;
  fromId: ID;
  fromName: string;
  fromInitials: string;
  fromRole: UserRole | 'system';
  toId: ID; // recipient (resident or staff)
  subject: string;
  preview: string;
  body: string;
  timestamp: ISODate;
  unread: boolean;
  relatedTicketId?: ID;
  relatedPermitId?: ID;
}

// ----- AI Insights -----
export type InsightType =
  | 'recurring_issue'
  | 'sla_alert'
  | 'usage_anomaly'
  | 'recommendation'
  | 'delinquency';

export interface AIInsight {
  id: ID;
  propertyId: ID;
  type: InsightType;
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'danger' | 'success';
  actionLabel?: string;
  actionHref?: string;
  generatedAt: ISODate;
}

// ----- Reports -----
export type ReportType =
  | 'daily_ops'
  | 'weekly_health'
  | 'monthly_complaint'
  | 'maintenance_perf'
  | 'billing_collection'
  | 'security_incidents'
  | 'satisfaction'
  | 'recurring_issues';

export interface AIReport {
  id: ID;
  propertyId: ID;
  type: ReportType;
  title: string;
  subtitle: string;
  periodStart: ISODate;
  periodEnd: ISODate;
  stats: { label: string; value: string }[];
  summary: string;
  generatedAt: ISODate;
}
