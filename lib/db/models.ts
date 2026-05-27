// @ts-nocheck
import { Schema, model, models, type Model } from "mongoose";

const { ObjectId, Mixed } = Schema.Types;

const baseFields = {
  organizationId: { type: ObjectId, ref: "Organization", index: true },
  createdBy: { type: ObjectId, ref: "User" },
  updatedBy: { type: ObjectId, ref: "User" },
  deletedAt: { type: Date, default: null, index: true }
};

const baseOptions = { timestamps: true, minimize: false };

function makeModel<T = any>(name: string, schema: Schema): Model<T> {
  return (models[name] as Model<T>) || model<T>(name, schema);
}

const UserSchema = new Schema(
  {
    name: String,
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: String,
    image: String,
    passwordHash: String,
    lastLoginAt: Date,
    activeOrganizationId: { type: ObjectId, ref: "Organization" },
    deletedAt: { type: Date, default: null, index: true }
  },
  baseOptions
);

const AccountSchema = new Schema(
  {
    userId: { type: ObjectId, ref: "User", index: true },
    type: String,
    provider: String,
    providerAccountId: String,
    refresh_token: String,
    access_token: String,
    expires_at: Number,
    token_type: String,
    scope: String,
    id_token: String,
    session_state: String
  },
  baseOptions
);
AccountSchema.index({ provider: 1, providerAccountId: 1 }, { unique: true });

const SessionSchema = new Schema(
  {
    sessionToken: { type: String, unique: true },
    userId: { type: ObjectId, ref: "User", index: true },
    expires: Date
  },
  baseOptions
);

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true },
    contractorName: String,
    phone: String,
    email: String,
    businessType: String,
    city: String,
    state: String,
    gstNumber: String,
    currency: { type: String, default: "INR" },
    defaultUnits: [String],
    logoUrl: String,
    bankDetails: Mixed,
    subscriptionStatus: { type: String, default: "Trial" },
    blockedAt: Date,
    deletedAt: { type: Date, default: null, index: true }
  },
  baseOptions
);

const OrganizationMemberSchema = new Schema(
  {
    organizationId: { type: ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: ObjectId, ref: "User", required: true, index: true },
    role: {
      type: String,
      enum: ["Super Admin", "Owner", "Admin", "Organization Owner", "Organization Admin", "Project Manager", "Site Engineer", "Accountant", "Viewer", "Member"],
      default: "Viewer"
    },
    invitedBy: { type: ObjectId, ref: "User" },
    joinedAt: Date
  },
  baseOptions
);
OrganizationMemberSchema.index({ organizationId: 1, userId: 1 }, { unique: true });

const ClientSchema = new Schema(
  {
    ...baseFields,
    name: { type: String, required: true },
    phone: String,
    email: String,
    address: String,
    gstNumber: String,
    notes: String
  },
  baseOptions
);

const ProjectSchema = new Schema(
  {
    ...baseFields,
    clientId: { type: ObjectId, ref: "Client", index: true },
    name: { type: String, required: true },
    clientName: String,
    clientPhone: String,
    clientEmail: String,
    location: String,
    siteAddress: String,
    coordinates: { lat: Number, lng: Number },
    startDate: Date,
    expectedEndDate: Date,
    actualEndDate: Date,
    status: {
      type: String,
      enum: ["Draft", "Planning", "Active", "Delayed", "On Hold", "Completed", "Cancelled"],
      default: "Draft",
      index: true
    },
    contractValue: { type: Number, default: 0 },
    budget: { type: Number, default: 0 },
    estimatedCost: { type: Number, default: 0 },
    projectManagerId: { type: ObjectId, ref: "User" },
    siteEngineerId: { type: ObjectId, ref: "User" },
    assignedEngineer: String,
    category: String,
    priority: { type: String, default: "Medium" },
    riskStatus: { type: String, default: "Healthy" },
    progress: { type: Number, default: 0 },
    description: String,
    attachments: [Mixed]
  },
  baseOptions
);
ProjectSchema.index({ organizationId: 1, status: 1, deletedAt: 1 });

const BOQItemSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    boqVersionId: { type: ObjectId, ref: "BOQVersion" },
    category: String,
    description: String,
    unit: String,
    quantity: { type: Number, default: 0 },
    completedQuantity: { type: Number, default: 0 },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    gstPercentage: { type: Number, default: 0 },
    wastagePercentage: { type: Number, default: 0 },
    labourComponent: { type: Number, default: 0 },
    materialComponent: { type: Number, default: 0 },
    contractorMargin: { type: Number, default: 0 },
    status: { type: String, default: "Draft" },
    lockedAt: Date,
    notes: String
  },
  baseOptions
);

const BOQVersionSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    versionNumber: Number,
    status: { type: String, default: "Draft" },
    approvedBy: { type: ObjectId, ref: "User" },
    approvedAt: Date,
    rejectedReason: String,
    snapshot: [Mixed]
  },
  baseOptions
);

const ScheduleTaskSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    taskName: String,
    workCategory: String,
    startDate: Date,
    endDate: Date,
    duration: Number,
    assignedUserId: { type: ObjectId, ref: "User" },
    dependencyTaskId: { type: ObjectId, ref: "ScheduleTask" },
    priority: { type: String, default: "Medium" },
    status: { type: String, default: "Not Started" },
    progress: { type: Number, default: 0 },
    delayReason: String,
    notes: String
  },
  baseOptions
);

const ProjectTaskSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    phase: String,
    milestone: String,
    parentTaskId: { type: ObjectId, ref: "ProjectTask", index: true },
    title: String,
    description: String,
    assignedTo: { type: ObjectId, ref: "User" },
    startDate: Date,
    dueDate: Date,
    priority: { type: String, default: "Medium" },
    status: { type: String, default: "Not Started" },
    workCategory: String,
    boqItemId: { type: ObjectId, ref: "BOQItem" },
    requiredMaterials: [Mixed],
    assignedWorkers: [Mixed],
    dependencyTaskIds: [{ type: ObjectId, ref: "ProjectTask" }],
    attachments: [Mixed],
    comments: [Mixed],
    completionPercentage: { type: Number, default: 0 },
    activityHistory: [Mixed]
  },
  baseOptions
);

const DailyProgressSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    date: Date,
    time: String,
    siteLocation: String,
    coordinates: { lat: Number, lng: Number },
    workCategory: String,
    workCompleted: String,
    quantityCompleted: { type: Number, default: 0 },
    unit: String,
    boqItemId: { type: ObjectId, ref: "BOQItem" },
    workersPresent: { type: Number, default: 0 },
    materialsUsed: [Mixed],
    equipmentUsed: [Mixed],
    issuesFaced: String,
    delayReason: String,
    weather: String,
    remarks: String,
    clientVisibleNotes: String,
    photos: [Mixed],
    clientVisible: { type: Boolean, default: false }
  },
  baseOptions
);
DailyProgressSchema.index({ organizationId: 1, projectId: 1, date: -1 });

const LabourWorkerSchema = new Schema(
  {
    ...baseFields,
    name: String,
    phone: String,
    skillType: String,
    dailyWage: { type: Number, default: 0 },
    overtimeRate: { type: Number, default: 0 },
    idProofDocument: Mixed,
    assignedProjectId: { type: ObjectId, ref: "Project" },
    status: { type: String, default: "Active" },
    joiningDate: Date
  },
  baseOptions
);

const LabourAttendanceSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    workerId: { type: ObjectId, ref: "LabourWorker", index: true },
    workerName: String,
    date: Date,
    timeIn: String,
    timeOut: String,
    coordinates: { lat: Number, lng: Number },
    attendanceType: { type: String, default: "Present" },
    wageCalculated: { type: Number, default: 0 },
    overtimeHours: { type: Number, default: 0 },
    overtimeAmount: { type: Number, default: 0 },
    remarks: String,
    photoProof: Mixed
  },
  baseOptions
);

const MaterialSchema = new Schema(
  {
    ...baseFields,
    name: String,
    category: String,
    unit: String,
    openingStock: { type: Number, default: 0 },
    currentStock: { type: Number, default: 0 },
    defaultRate: { type: Number, default: 0 },
    supplier: String,
    lowStockThreshold: { type: Number, default: 0 },
    projectId: { type: ObjectId, ref: "Project" }
  },
  baseOptions
);

const MaterialTransactionSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    materialId: { type: ObjectId, ref: "Material", index: true },
    materialName: String,
    taskId: { type: ObjectId, ref: "ProjectTask" },
    boqItemId: { type: ObjectId, ref: "BOQItem" },
    vendorId: { type: ObjectId, ref: "Vendor" },
    billId: { type: ObjectId, ref: "Bill" },
    transactionType: String,
    quantity: { type: Number, default: 0 },
    unitRate: { type: Number, default: 0 },
    expectedRate: { type: Number, default: 0 },
    totalCost: { type: Number, default: 0 },
    supplier: String,
    invoiceNumber: String,
    dateTime: Date,
    location: String,
    coordinates: { lat: Number, lng: Number },
    attachment: Mixed,
    remarks: String
  },
  baseOptions
);

const EquipmentSchema = new Schema(
  {
    ...baseFields,
    name: String,
    type: String,
    ownership: String,
    rentalRate: { type: Number, default: 0 },
    assignedProjectId: { type: ObjectId, ref: "Project" },
    status: { type: String, default: "Available" },
    usageHours: { type: Number, default: 0 },
    operatorName: String,
    notes: String
  },
  baseOptions
);

const EquipmentUsageSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    equipmentId: { type: ObjectId, ref: "Equipment", index: true },
    date: Date,
    usageHours: { type: Number, default: 0 },
    operatorName: String,
    cost: { type: Number, default: 0 },
    notes: String
  },
  baseOptions
);

const MeasurementSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    boqItemId: { type: ObjectId, ref: "BOQItem" },
    taskId: { type: ObjectId, ref: "ProjectTask" },
    workCategory: String,
    locationLabel: String,
    date: Date,
    length: { type: Number, default: 0 },
    breadth: { type: Number, default: 0 },
    height: { type: Number, default: 0 },
    count: { type: Number, default: 1 },
    formulaType: String,
    calculatedQuantity: { type: Number, default: 0 },
    unit: String,
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    checkedBy: String,
    approvedBy: String,
    approvalStatus: { type: String, default: "Pending" },
    remarks: String,
    attachment: Mixed,
    versionHistory: [Mixed]
  },
  baseOptions
);

const BillItemSchema = new Schema(
  {
    description: String,
    quantity: { type: Number, default: 0 },
    unit: String,
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    gst: { type: Number, default: 0 }
  },
  { _id: true }
);

const BillSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    clientId: { type: ObjectId, ref: "Client", index: true },
    billNumber: String,
    clientName: String,
    billType: String,
    billDate: Date,
    dueDate: Date,
    items: [BillItemSchema],
    subtotal: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    retention: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    previousPayment: { type: Number, default: 0 },
    netPayable: { type: Number, default: 0 },
    bankDetails: Mixed,
    upiId: String,
    paymentLink: String,
    terms: String,
    status: { type: String, default: "Draft", index: true },
    viewedAt: Date,
    signatureUrl: String
  },
  baseOptions
);

const PaymentSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    billId: { type: ObjectId, ref: "Bill", index: true },
    clientId: { type: ObjectId, ref: "Client" },
    amount: { type: Number, default: 0 },
    method: String,
    gateway: String,
    status: { type: String, default: "Pending" },
    transactionId: String,
    gatewayOrderId: String,
    gatewayPaymentId: String,
    proof: Mixed,
    verifiedBy: { type: ObjectId, ref: "User" },
    verifiedAt: Date,
    notes: String,
    paidAt: Date
  },
  baseOptions
);

const VendorSchema = new Schema(
  {
    ...baseFields,
    name: String,
    phone: String,
    email: String,
    type: String,
    gstNumber: String,
    address: String,
    bankDetails: Mixed,
    upiId: String,
    openingBalance: { type: Number, default: 0 }
  },
  baseOptions
);

const VendorTransactionSchema = new Schema(
  {
    ...baseFields,
    vendorId: { type: ObjectId, ref: "Vendor", index: true },
    projectId: { type: ObjectId, ref: "Project", index: true },
    date: Date,
    description: String,
    direction: String,
    amount: { type: Number, default: 0 },
    paymentStatus: { type: String, default: "Pending" },
    attachment: Mixed
  },
  baseOptions
);

const ExpenseSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    date: Date,
    category: String,
    amount: { type: Number, default: 0 },
    paidBy: String,
    paymentMode: String,
    receipt: Mixed,
    remarks: String
  },
  baseOptions
);

const SitePhotoSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    uploadedBy: { type: ObjectId, ref: "User" },
    date: Date,
    time: String,
    coordinates: { lat: Number, lng: Number },
    workCategory: String,
    description: String,
    dailyProgressId: { type: ObjectId, ref: "DailyProgress" },
    boqItemId: { type: ObjectId, ref: "BOQItem" },
    clientVisible: { type: Boolean, default: false },
    beforeAfterTag: String,
    locationLabel: String,
    url: String,
    storageKey: String,
    watermarkUrl: String
  },
  baseOptions
);

const DocumentSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    type: String,
    title: String,
    url: String,
    storageKey: String,
    mimeType: String,
    size: Number,
    tags: [String],
    linkedRecord: Mixed
  },
  baseOptions
);

const ReportSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    type: String,
    title: String,
    filters: Mixed,
    fileUrl: String,
    generatedBy: { type: ObjectId, ref: "User" },
    generatedAt: { type: Date, default: Date.now }
  },
  baseOptions
);

const NotificationSchema = new Schema(
  {
    ...baseFields,
    userId: { type: ObjectId, ref: "User", index: true },
    projectId: { type: ObjectId, ref: "Project", index: true },
    relatedRecordId: ObjectId,
    dedupeKey: { type: String, index: true },
    type: String,
    title: String,
    body: String,
    severity: { type: String, default: "info" },
    link: String,
    readAt: Date,
    pushSentAt: Date
  },
  baseOptions
);
NotificationSchema.index({ organizationId: 1, dedupeKey: 1 }, { unique: true, sparse: true });

const SubscriptionPlanSchema = new Schema(
  {
    name: String,
    price: { type: Number, default: 0 },
    interval: { type: String, default: "monthly" },
    projectLimit: Mixed,
    userLimit: Mixed,
    features: [String],
    popular: Boolean,
    active: { type: Boolean, default: true }
  },
  baseOptions
);

const SubscriptionSchema = new Schema(
  {
    ...baseFields,
    planId: { type: ObjectId, ref: "SubscriptionPlan" },
    planName: String,
    status: { type: String, default: "Trial" },
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    gateway: String,
    razorpayCustomerId: String,
    razorpaySubscriptionId: String,
    cashfreeCustomerId: String,
    manualPaymentProof: Mixed,
    pendingVerificationAt: Date
  },
  baseOptions
);

const PaymentGatewayLogSchema = new Schema(
  {
    ...baseFields,
    gateway: String,
    direction: String,
    event: String,
    status: String,
    request: Mixed,
    response: Mixed,
    signatureValid: Boolean
  },
  baseOptions
);

const ActivityLogSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    actorId: { type: ObjectId, ref: "User" },
    action: String,
    entityType: String,
    entityId: ObjectId,
    metadata: Mixed
  },
  baseOptions
);

const AIRequestLogSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project" },
    userId: { type: ObjectId, ref: "User" },
    feature: String,
    promptTokens: Number,
    completionTokens: Number,
    provider: String,
    status: String,
    input: Mixed,
    output: Mixed
  },
  baseOptions
);

const QualityChecklistSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    type: String,
    locationLabel: String,
    items: [Mixed],
    checkedBy: String,
    status: { type: String, default: "Open" },
    photos: [Mixed]
  },
  baseOptions
);

const InspectionLogSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    date: Date,
    inspector: String,
    workChecked: String,
    defects: String,
    correctiveAction: String,
    status: { type: String, default: "Open" },
    photos: [Mixed]
  },
  baseOptions
);

const SnagItemSchema = new Schema(
  {
    ...baseFields,
    projectId: { type: ObjectId, ref: "Project", index: true },
    issue: String,
    locationLabel: String,
    assignedTo: { type: ObjectId, ref: "User" },
    priority: { type: String, default: "Medium" },
    dueDate: Date,
    status: { type: String, default: "Open" },
    photos: [Mixed],
    closureProof: Mixed
  },
  baseOptions
);

export const User = makeModel("User", UserSchema);
export const Account = makeModel("Account", AccountSchema);
export const Session = makeModel("Session", SessionSchema);
export const Organization = makeModel("Organization", OrganizationSchema);
export const OrganizationMember = makeModel("OrganizationMember", OrganizationMemberSchema);
export const Client = makeModel("Client", ClientSchema);
export const Project = makeModel("Project", ProjectSchema);
export const BOQItem = makeModel("BOQItem", BOQItemSchema);
export const BOQVersion = makeModel("BOQVersion", BOQVersionSchema);
export const ScheduleTask = makeModel("ScheduleTask", ScheduleTaskSchema);
export const ProjectTask = makeModel("ProjectTask", ProjectTaskSchema);
export const DailyProgress = makeModel("DailyProgress", DailyProgressSchema);
export const LabourWorker = makeModel("LabourWorker", LabourWorkerSchema);
export const LabourAttendance = makeModel("LabourAttendance", LabourAttendanceSchema);
export const Material = makeModel("Material", MaterialSchema);
export const MaterialTransaction = makeModel("MaterialTransaction", MaterialTransactionSchema);
export const Equipment = makeModel("Equipment", EquipmentSchema);
export const EquipmentUsage = makeModel("EquipmentUsage", EquipmentUsageSchema);
export const Measurement = makeModel("Measurement", MeasurementSchema);
export const Bill = makeModel("Bill", BillSchema);
export const Payment = makeModel("Payment", PaymentSchema);
export const Vendor = makeModel("Vendor", VendorSchema);
export const VendorTransaction = makeModel("VendorTransaction", VendorTransactionSchema);
export const Expense = makeModel("Expense", ExpenseSchema);
export const SitePhoto = makeModel("SitePhoto", SitePhotoSchema);
export const Document = makeModel("Document", DocumentSchema);
export const Report = makeModel("Report", ReportSchema);
export const Notification = makeModel("Notification", NotificationSchema);
export const SubscriptionPlan = makeModel("SubscriptionPlan", SubscriptionPlanSchema);
export const Subscription = makeModel("Subscription", SubscriptionSchema);
export const PaymentGatewayLog = makeModel("PaymentGatewayLog", PaymentGatewayLogSchema);
export const ActivityLog = makeModel("ActivityLog", ActivityLogSchema);
export const AIRequestLog = makeModel("AIRequestLog", AIRequestLogSchema);
export const QualityChecklist = makeModel("QualityChecklist", QualityChecklistSchema);
export const InspectionLog = makeModel("InspectionLog", InspectionLogSchema);
export const SnagItem = makeModel("SnagItem", SnagItemSchema);

export const collectionModels = {
  clients: Client,
  projects: Project,
  boq: BOQItem,
  "boq-versions": BOQVersion,
  schedule: ScheduleTask,
  tasks: ProjectTask,
  "daily-progress": DailyProgress,
  workers: LabourWorker,
  labour: LabourAttendance,
  materials: Material,
  "material-transactions": MaterialTransaction,
  equipment: Equipment,
  "equipment-usage": EquipmentUsage,
  measurements: Measurement,
  bills: Bill,
  payments: Payment,
  vendors: Vendor,
  "vendor-transactions": VendorTransaction,
  expenses: Expense,
  photos: SitePhoto,
  documents: Document,
  reports: Report,
  notifications: Notification,
  subscriptions: Subscription,
  "quality-checklists": QualityChecklist,
  inspections: InspectionLog,
  snags: SnagItem
} as const;

export type CollectionName = keyof typeof collectionModels;
