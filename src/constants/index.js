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

export const CLASSES = [
  'Nursery', 'LKG', 'UKG',
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5',
  'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10',
  'Grade 11-A', 'Grade 11-B', 'Grade 12-A', 'Grade 12-B'
];

export const SUBJECTS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'English', 'Hindi', 'History', 'Geography', 'Civics',
  'Computer Science', 'Environmental Studies', 'Art',
  'Business Studies', 'Accountancy', 'Economics'
];

export const DEPARTMENTS = [
  'Math Dept',
  'Physics Dept',
  'Chemistry Dept',
  'Biology Dept',
  'English Dept',
  'Hindi Dept',
  'Social Science Dept',
  'History Dept',
  'Geography Dept',
  'Civics Dept',
  'Computer Science Dept',
  'Environmental Studies Dept',
  'Art Dept',
  'Business Studies Dept',
  'Accountancy Dept',
  'Economics Dept',
  'Accounts Dept',
  'Principal Office',
  'VP Office'
];

