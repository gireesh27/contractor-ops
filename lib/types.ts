export type ID = string;

export type Role = "Owner" | "Admin" | "Project Manager" | "Site Engineer" | "Accountant" | "Viewer";

export type BusinessType =
  | "Civil contractor"
  | "Interior contractor"
  | "Builder"
  | "Subcontractor"
  | "Site engineer";

export type MeasurementUnit =
  | "ft"
  | "m"
  | "sq.ft"
  | "sq.m"
  | "cubic feet"
  | "cubic meter"
  | "kg"
  | "tons"
  | "bags"
  | "nos"
  | "bricks"
  | "lump sum";

export type ProjectStatus = "Planning" | "Active" | "On Hold" | "Completed" | "Cancelled";

export type ProjectType =
  | "Residential building"
  | "Commercial building"
  | "Interior work"
  | "Renovation"
  | "Road work"
  | "Plumbing"
  | "Electrical"
  | "Painting"
  | "Flooring"
  | "Other";

export type WorkCategory =
  | "Earthwork"
  | "PCC"
  | "RCC"
  | "Brickwork"
  | "Plastering"
  | "Flooring"
  | "Painting"
  | "Electrical"
  | "Plumbing"
  | "Woodwork"
  | "Steel"
  | "Roofing"
  | "Other";

export type EstimateStatus = "Draft" | "Sent" | "Approved" | "Rejected" | "Revised";

export type AttendanceStatus = "Present" | "Half day" | "Absent" | "Overtime";

export type MaterialTransactionType = "Purchase/Inward" | "Usage/Outward" | "Return" | "Wastage" | "Transfer";

export type FormulaType =
  | "Length x Breadth"
  | "Length x Breadth x Height"
  | "Number x Length"
  | "Manual quantity";

export type BillType = "Advance" | "Running Account Bill" | "Final Bill" | "Extra Work Bill";

export type BillStatus =
  | "Draft"
  | "Sent"
  | "Approved"
  | "Partially Paid"
  | "Paid"
  | "Overdue"
  | "Cancelled";

export type PaymentMode = "Cash" | "UPI" | "Bank transfer" | "Cheque" | "Other";

export type VendorType =
  | "Material supplier"
  | "Labour contractor"
  | "Subcontractor"
  | "Equipment supplier"
  | "Transport"
  | "Other";

export type ReportType =
  | "Project summary"
  | "Daily progress"
  | "Weekly progress"
  | "Monthly progress"
  | "Labour cost"
  | "Material usage"
  | "Measurement"
  | "Client billing"
  | "Outstanding payment"
  | "Profit/loss estimate";

export interface Organization {
  id: ID;
  name: string;
  contractorName: string;
  phone: string;
  email: string;
  businessType: BusinessType;
  city: string;
  state: string;
  gstNumber?: string;
  currency: "INR";
  defaultUnits: MeasurementUnit[];
}

export interface User {
  id: ID;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  organizationId: ID;
}

export interface Client {
  id: ID;
  organizationId: ID;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export interface Project {
  id: ID;
  organizationId: ID;
  clientId: ID;
  name: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  type: ProjectType;
  location: string;
  startDate: string;
  expectedEndDate: string;
  status: ProjectStatus;
  contractValue: number;
  estimatedCost: number;
  description: string;
  assignedEngineer: string;
  progress: number;
}

export interface BOQItem {
  id: ID;
  organizationId: ID;
  projectId: ID;
  estimateId: ID;
  category: WorkCategory;
  description: string;
  unit: MeasurementUnit;
  quantity: number;
  completedQuantity: number;
  rate: number;
  taxPercentage?: number;
  notes?: string;
}

export interface Estimate {
  id: ID;
  organizationId: ID;
  projectId: ID;
  estimateNumber: string;
  status: EstimateStatus;
  sentAt?: string;
  approvedAt?: string;
}

export interface DailyProgress {
  id: ID;
  organizationId: ID;
  projectId: ID;
  date: string;
  workCompleted: string;
  category: WorkCategory;
  quantityCompleted: number;
  unit: MeasurementUnit;
  area: string;
  workersPresent: number;
  materialsUsed: string;
  issuesFaced?: string;
  delayReason?: string;
  weather: string;
  remarks: string;
  photosCount: number;
  clientVisible: boolean;
  boqItemId?: ID;
  status: "On track" | "Needs attention" | "Delayed";
}

export interface LabourWorker {
  id: ID;
  organizationId: ID;
  name: string;
  phone?: string;
  skillType:
    | "Mason"
    | "Helper"
    | "Carpenter"
    | "Electrician"
    | "Plumber"
    | "Painter"
    | "Bar bender"
    | "Welder"
    | "Supervisor"
    | "Other";
  dailyWage: number;
  status: "Active" | "Inactive";
}

export interface LabourAttendance {
  id: ID;
  organizationId: ID;
  projectId: ID;
  workerId: ID;
  workerName: string;
  date: string;
  status: AttendanceStatus;
  wageAmount: number;
  overtimeHours: number;
  overtimeAmount: number;
  remarks?: string;
}

export interface Material {
  id: ID;
  organizationId: ID;
  name: string;
  unit: MeasurementUnit;
  defaultRate: number;
  supplier?: string;
  lowStockAlertQuantity: number;
}

export interface MaterialTransaction {
  id: ID;
  organizationId: ID;
  projectId: ID;
  materialId: ID;
  materialName: string;
  date: string;
  type: MaterialTransactionType;
  quantity: number;
  unitRate: number;
  supplier?: string;
  billNumber?: string;
  notes?: string;
}

export interface Measurement {
  id: ID;
  organizationId: ID;
  projectId: ID;
  boqItemId?: ID;
  date: string;
  workDescription: string;
  location: string;
  length: number;
  breadth: number;
  height: number;
  count: number;
  formula: FormulaType;
  manualQuantity?: number;
  unit: MeasurementUnit;
  rate: number;
  checkedBy: string;
  remarks?: string;
}

export interface BillItem {
  id: ID;
  billId: ID;
  description: string;
  quantity: number;
  unit: MeasurementUnit;
  rate: number;
}

export interface Bill {
  id: ID;
  organizationId: ID;
  projectId: ID;
  clientId: ID;
  billNumber: string;
  clientName: string;
  billDate: string;
  dueDate: string;
  billingType: BillType;
  gstPercentage: number;
  discount: number;
  retentionAmount: number;
  previousAmountReceived: number;
  notes?: string;
  terms?: string;
  status: BillStatus;
}

export interface Payment {
  id: ID;
  organizationId: ID;
  projectId: ID;
  billId: ID;
  clientId: ID;
  clientName: string;
  paymentDate: string;
  amountReceived: number;
  mode: PaymentMode;
  transactionReference?: string;
  notes?: string;
}

export interface Vendor {
  id: ID;
  organizationId: ID;
  name: string;
  phone: string;
  email?: string;
  type: VendorType;
  gstNumber?: string;
  address: string;
  openingBalance: number;
}

export interface VendorTransaction {
  id: ID;
  organizationId: ID;
  vendorId: ID;
  projectId: ID;
  date: string;
  description: string;
  direction: "Debit" | "Credit";
  amount: number;
  paymentStatus: "Pending" | "Paid" | "Partially Paid";
}

export interface SitePhoto {
  id: ID;
  organizationId: ID;
  projectId: ID;
  date: string;
  uploadedBy: string;
  category: WorkCategory;
  description: string;
  locationTag?: string;
  clientVisible: boolean;
  url: string;
}

export interface Report {
  id: ID;
  organizationId: ID;
  projectId?: ID;
  type: ReportType;
  title: string;
  generatedAt: string;
  generatedBy: string;
}

export interface SubscriptionPlan {
  id: ID;
  name: "Free Trial" | "Starter" | "Pro" | "Business";
  price: number;
  target: string;
  projectLimit: number | "Unlimited";
  userLimit: number;
  features: string[];
}

export interface ActivityLog {
  id: ID;
  organizationId: ID;
  projectId?: ID;
  actor: string;
  action: string;
  createdAt: string;
}
