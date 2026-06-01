// Centralized constants — no more magic strings scattered across files

export const ROLES = {
  PRINCIPAL: 'Principal',
  TEACHER: 'Teacher',
  STUDENT: 'Student',
  PARENT: 'Parent',
  ADMIN: 'Admin Staff',
  RECEPTION: 'Reception / Office Staff',
  VICE_PRINCIPAL: 'Vice Principal',
};

export const APPOINTMENT_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
};

export const QUERY_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const COMPLAINT_STATUS = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
};

export const PAYMENT_STATUS = {
  PAID: 'Paid',
  PENDING: 'Pending',
  PARTIAL: 'Partial',
};

export const QUERY_CATEGORIES = [
  'Academics', 'Fee issues', 'Attendance', 'Exams',
  'Timetable', 'Certificates', 'Transport', 'Technical support',
];

export const COMPLAINT_TYPES = [
  'Teacher issue', 'Student behavior', 'Infrastructure',
  'Administration', 'Transport', 'Harassment / disciplinary issue',
];
