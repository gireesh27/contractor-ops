import type { CrudField } from "@/components/premium/CrudForm";
import type { CollectionName } from "@/lib/db/models";

export const projectFields: CrudField[] = [
  { name: "name", label: "Project name", required: true },
  { name: "clientName", label: "Client name" },
  { name: "clientPhone", label: "Client phone" },
  { name: "location", label: "Site location" },
  { name: "startDate", label: "Start date", type: "date" },
  { name: "expectedEndDate", label: "End date", type: "date" },
  { name: "status", label: "Status", type: "select", options: ["Draft", "Planning", "Active", "Delayed", "On Hold", "Completed", "Cancelled"] },
  { name: "contractValue", label: "Contract value", type: "number" },
  { name: "budget", label: "Budget", type: "number" },
  { name: "category", label: "Project category" },
  { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Urgent"] },
  { name: "riskStatus", label: "Risk status", type: "select", options: ["Healthy", "Watch", "At Risk", "Critical"] },
  { name: "description", label: "Description", type: "textarea" }
];

export const clientFields: CrudField[] = [
  { name: "name", label: "Client name", required: true },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email" },
  { name: "gstNumber", label: "GST number" },
  { name: "address", label: "Address", type: "textarea" }
];

export const boqFields: CrudField[] = [
  { name: "category", label: "BOQ category", type: "select", options: ["Site clearing", "Excavation", "PCC", "RCC", "Reinforcement steel", "Formwork", "Masonry", "Plastering", "Flooring", "Painting", "Plumbing", "Electrical", "Waterproofing", "Doors and windows", "Roofing", "External development", "Finishing works"] },
  { name: "description", label: "Item description", required: true },
  { name: "unit", label: "Unit" },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "rate", label: "Rate", type: "number" },
  { name: "gstPercentage", label: "GST %", type: "number" },
  { name: "wastagePercentage", label: "Wastage %", type: "number" },
  { name: "labourComponent", label: "Labour component", type: "number" },
  { name: "materialComponent", label: "Material component", type: "number" },
  { name: "contractorMargin", label: "Margin", type: "number" },
  { name: "notes", label: "Notes", type: "textarea" }
];

export const scheduleFields: CrudField[] = [
  { name: "taskName", label: "Task name", required: true },
  { name: "workCategory", label: "Work category" },
  { name: "startDate", label: "Start date", type: "date" },
  { name: "endDate", label: "End date", type: "date" },
  { name: "duration", label: "Duration", type: "number" },
  { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Urgent"] },
  { name: "status", label: "Status", type: "select", options: ["Not Started", "In Progress", "Blocked", "Delayed", "Completed", "Cancelled"] },
  { name: "progress", label: "Progress %", type: "number" },
  { name: "delayReason", label: "Delay reason", type: "textarea" },
  { name: "notes", label: "Notes", type: "textarea" }
];

export const taskFields: CrudField[] = [
  { name: "phase", label: "Phase" },
  { name: "milestone", label: "Milestone" },
  { name: "title", label: "Task title", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "startDate", label: "Start date", type: "date" },
  { name: "dueDate", label: "Due date", type: "date" },
  { name: "priority", label: "Priority", type: "select", options: ["Low", "Medium", "High", "Urgent"] },
  { name: "status", label: "Status", type: "select", options: ["Not Started", "In Progress", "Blocked", "Delayed", "Completed", "Cancelled"] },
  { name: "workCategory", label: "Work category" },
  { name: "parentTaskId", label: "Parent task ID" },
  { name: "dependencyTaskId", label: "Dependency task ID" },
  { name: "assignedWorkers", label: "Assigned workers / crew", type: "textarea" },
  { name: "requiredMaterials", label: "Materials required", type: "textarea" },
  { name: "completionPercentage", label: "Completion %", type: "number" }
];

export const progressFields: CrudField[] = [
  { name: "date", label: "Date", type: "date", required: true },
  { name: "time", label: "Time", type: "time" },
  { name: "siteLocation", label: "Site location" },
  { name: "workCategory", label: "Work category" },
  { name: "workCompleted", label: "Work completed", type: "textarea", required: true },
  { name: "quantityCompleted", label: "Quantity", type: "number" },
  { name: "unit", label: "Unit" },
  { name: "workersPresent", label: "Workers present", type: "number" },
  { name: "weather", label: "Weather" },
  { name: "issuesFaced", label: "Issues faced", type: "textarea" },
  { name: "delayReason", label: "Delay reason", type: "textarea" },
  { name: "remarks", label: "Engineer remarks", type: "textarea" },
  { name: "clientVisible", label: "Client visible", type: "checkbox" }
];

export const workerFields: CrudField[] = [
  { name: "name", label: "Worker name", required: true },
  { name: "phone", label: "Phone" },
  { name: "skillType", label: "Skill", type: "select", options: ["Mason", "Helper", "Carpenter", "Electrician", "Plumber", "Painter", "Bar bender", "Welder", "Supervisor", "Other"] },
  { name: "dailyWage", label: "Daily wage", type: "number" },
  { name: "overtimeRate", label: "Overtime rate", type: "number" },
  { name: "joiningDate", label: "Joining date", type: "date" },
  { name: "status", label: "Status", type: "select", options: ["Active", "Inactive"] }
];

export const attendanceFields: CrudField[] = [
  { name: "workerName", label: "Worker name", required: true },
  { name: "date", label: "Date", type: "date" },
  { name: "timeIn", label: "Time in", type: "time" },
  { name: "timeOut", label: "Time out", type: "time" },
  { name: "attendanceType", label: "Attendance", type: "select", options: ["Present", "Half Day", "Absent", "Overtime"] },
  { name: "wageCalculated", label: "Wage calculated", type: "number" },
  { name: "overtimeHours", label: "Overtime hours", type: "number" },
  { name: "overtimeAmount", label: "Overtime amount", type: "number" },
  { name: "remarks", label: "Remarks", type: "textarea" }
];

export const materialFields: CrudField[] = [
  { name: "name", label: "Material name", required: true },
  { name: "category", label: "Category" },
  { name: "unit", label: "Unit" },
  { name: "openingStock", label: "Opening stock", type: "number" },
  { name: "currentStock", label: "Current stock", type: "number" },
  { name: "defaultRate", label: "Default rate", type: "number" },
  { name: "supplier", label: "Supplier" },
  { name: "lowStockThreshold", label: "Low stock threshold", type: "number" }
];

export const materialTransactionFields: CrudField[] = [
  { name: "materialName", label: "Material name", required: true },
  { name: "transactionType", label: "Transaction type", type: "select", options: ["Purchase/Inward", "Usage/Outward", "Return", "Wastage", "Transfer"] },
  { name: "quantity", label: "Quantity", type: "number" },
  { name: "unitRate", label: "Unit rate", type: "number" },
  { name: "expectedRate", label: "Expected rate", type: "number" },
  { name: "supplier", label: "Supplier" },
  { name: "invoiceNumber", label: "Invoice number" },
  { name: "taskId", label: "Task/activity ID" },
  { name: "boqItemId", label: "BOQ item ID" },
  { name: "vendorId", label: "Vendor ID" },
  { name: "billId", label: "Bill ID" },
  { name: "dateTime", label: "Date and time", type: "datetime-local" },
  { name: "location", label: "Location" },
  { name: "remarks", label: "Remarks", type: "textarea" }
];

export const equipmentFields: CrudField[] = [
  { name: "name", label: "Equipment name", required: true },
  { name: "type", label: "Type" },
  { name: "ownership", label: "Ownership", type: "select", options: ["Owned", "Rented"] },
  { name: "rentalRate", label: "Rental rate", type: "number" },
  { name: "status", label: "Status", type: "select", options: ["Available", "In Use", "Under Maintenance", "Returned"] },
  { name: "usageHours", label: "Usage hours", type: "number" },
  { name: "operatorName", label: "Operator name" },
  { name: "notes", label: "Notes", type: "textarea" }
];

export const measurementFields: CrudField[] = [
  { name: "workCategory", label: "Work category" },
  { name: "boqItemId", label: "BOQ item ID" },
  { name: "taskId", label: "Task/activity ID" },
  { name: "locationLabel", label: "Location/floor/room" },
  { name: "date", label: "Date", type: "date" },
  { name: "length", label: "Length", type: "number" },
  { name: "breadth", label: "Breadth", type: "number" },
  { name: "height", label: "Height/depth", type: "number" },
  { name: "count", label: "Number/count", type: "number" },
  { name: "formulaType", label: "Formula", type: "select", options: ["L x B", "L x B x H", "Number x L", "Number x Area", "Manual quantity"] },
  { name: "calculatedQuantity", label: "Calculated quantity", type: "number" },
  { name: "unit", label: "Unit" },
  { name: "rate", label: "Rate", type: "number" },
  { name: "approvalStatus", label: "Approval", type: "select", options: ["Pending", "Approved", "Rejected"] },
  { name: "remarks", label: "Remarks", type: "textarea" }
];

export const billFields: CrudField[] = [
  { name: "billNumber", label: "Bill number", required: true },
  { name: "clientName", label: "Client name" },
  { name: "billType", label: "Bill type", type: "select", options: ["Advance bill", "Running Account Bill", "Final bill", "Extra work bill", "Retention release bill", "Material reimbursement bill"] },
  { name: "billDate", label: "Bill date", type: "date" },
  { name: "dueDate", label: "Due date", type: "date" },
  { name: "subtotal", label: "Subtotal", type: "number" },
  { name: "gstAmount", label: "GST", type: "number" },
  { name: "retention", label: "Retention", type: "number" },
  { name: "discount", label: "Discount", type: "number" },
  { name: "previousPayment", label: "Previous payment", type: "number" },
  { name: "netPayable", label: "Net payable", type: "number" },
  { name: "upiId", label: "UPI ID" },
  { name: "status", label: "Status", type: "select", options: ["Draft", "Sent", "Viewed", "Approved", "Partially Paid", "Paid", "Overdue", "Cancelled"] },
  { name: "terms", label: "Terms", type: "textarea" }
];

export const paymentFields: CrudField[] = [
  { name: "amount", label: "Amount", type: "number", required: true },
  { name: "method", label: "Method", type: "select", options: ["Razorpay Checkout", "Cashfree Payments", "UPI manual", "Bank transfer", "Cash", "Cheque"] },
  { name: "gateway", label: "Gateway" },
  { name: "status", label: "Status", type: "select", options: ["Pending", "Paid", "Verified", "Failed", "Refunded"] },
  { name: "transactionId", label: "Transaction ID" },
  { name: "paidAt", label: "Paid at", type: "datetime-local" },
  { name: "notes", label: "Notes", type: "textarea" }
];

export const vendorFields: CrudField[] = [
  { name: "name", label: "Vendor name", required: true },
  { name: "phone", label: "Phone" },
  { name: "email", label: "Email" },
  { name: "type", label: "Type", type: "select", options: ["Material supplier", "Labour contractor", "Subcontractor", "Equipment supplier", "Transport vendor", "Consultant"] },
  { name: "gstNumber", label: "GST number" },
  { name: "upiId", label: "UPI ID" },
  { name: "openingBalance", label: "Opening balance", type: "number" },
  { name: "address", label: "Address", type: "textarea" }
];

export const expenseFields: CrudField[] = [
  { name: "date", label: "Date", type: "date" },
  { name: "category", label: "Category", type: "select", options: ["Material", "Labour", "Equipment", "Transport", "Food", "Fuel", "Site office", "Miscellaneous"] },
  { name: "amount", label: "Amount", type: "number" },
  { name: "paidBy", label: "Paid by" },
  { name: "paymentMode", label: "Payment mode", type: "select", options: ["Cash", "UPI", "Bank transfer", "Cheque", "Card"] },
  { name: "remarks", label: "Remarks", type: "textarea" }
];

export const photoFields: CrudField[] = [
  { name: "date", label: "Date", type: "date" },
  { name: "time", label: "Time", type: "time" },
  { name: "workCategory", label: "Work category" },
  { name: "description", label: "Description", type: "textarea" },
  { name: "locationLabel", label: "Floor/area/location" },
  { name: "url", label: "File URL" },
  { name: "beforeAfterTag", label: "Before/after", type: "select", options: ["Before", "After", "Progress", "Proof"] },
  { name: "clientVisible", label: "Client visible", type: "checkbox" }
];

export const documentFields: CrudField[] = [
  { name: "title", label: "Document title", required: true },
  { name: "type", label: "Type", type: "select", options: ["Contract agreement", "Estimate", "BOQ", "Drawings", "Client approvals", "Vendor bills", "Labour documents", "Site reports", "Payment proofs", "Photos", "Other"] },
  { name: "url", label: "File URL" },
  { name: "tags", label: "Tags" }
];

export const notificationFields: CrudField[] = [
  { name: "type", label: "Type", required: true },
  { name: "title", label: "Title", required: true },
  { name: "body", label: "Body", type: "textarea" },
  { name: "severity", label: "Severity", type: "select", options: ["info", "success", "warning", "danger"] },
  { name: "link", label: "Link" }
];

export const moduleRegistry: Record<string, { collection: CollectionName; title: string; eyebrow: string; fields: CrudField[]; primary?: string; secondary?: string; amount?: string; description?: string }> = {
  schedule: { collection: "schedule", title: "Project scheduling", eyebrow: "Schedule", fields: scheduleFields, primary: "taskName", secondary: "status", amount: "duration" },
  tasks: { collection: "tasks", title: "Task tracking", eyebrow: "Tasks", fields: taskFields, primary: "title", secondary: "status", amount: "completionPercentage" },
  boq: { collection: "boq", title: "BOQ and estimates", eyebrow: "BOQ", fields: boqFields, primary: "description", secondary: "category", amount: "amount" },
  "daily-progress": { collection: "daily-progress", title: "Daily site progress", eyebrow: "Daily Progress", fields: progressFields, primary: "workCompleted", secondary: "workCategory", amount: "quantityCompleted" },
  labour: { collection: "labour", title: "Labour attendance", eyebrow: "Labour", fields: attendanceFields, primary: "workerName", secondary: "attendanceType", amount: "wageCalculated" },
  materials: { collection: "material-transactions", title: "Material tracking", eyebrow: "Materials", fields: materialTransactionFields, primary: "materialName", secondary: "transactionType", amount: "totalCost" },
  equipment: { collection: "equipment", title: "Equipment tracking", eyebrow: "Equipment", fields: equipmentFields, primary: "name", secondary: "status", amount: "usageHours" },
  measurements: { collection: "measurements", title: "Measurement book", eyebrow: "Measurements", fields: measurementFields, primary: "workCategory", secondary: "approvalStatus", amount: "amount" },
  bills: { collection: "bills", title: "Client billing", eyebrow: "Bills", fields: billFields, primary: "billNumber", secondary: "status", amount: "netPayable" },
  payments: { collection: "payments", title: "Payment collection", eyebrow: "Payments", fields: paymentFields, primary: "transactionId", secondary: "status", amount: "amount" },
  expenses: { collection: "expenses", title: "Expense tracking", eyebrow: "Expenses", fields: expenseFields, primary: "category", secondary: "paymentMode", amount: "amount" },
  "site-photos": { collection: "photos", title: "Site photos with location and timestamp", eyebrow: "Site Photos", fields: photoFields, primary: "description", secondary: "workCategory" },
  documents: { collection: "documents", title: "Document management", eyebrow: "Documents", fields: documentFields, primary: "title", secondary: "type" },
  notifications: { collection: "notifications", title: "Notifications", eyebrow: "Notifications", fields: notificationFields, primary: "title", secondary: "severity" }
};
