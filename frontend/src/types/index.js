// User Types
export const USER_ROLES = {
  ADMIN: 'admin',
  TEACHER: 'teacher',
  STUDENT: 'student'
};

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// Academic Types
export const COURSE_DURATION = {
  ONE_YEAR: '1 Year',
  TWO_YEARS: '2 Years',
  THREE_YEARS: '3 Years',
  FOUR_YEARS: '4 Years',
  FIVE_YEARS: '5 Years'
};

export const ATTENDANCE_STATUS = {
  PRESENT: 'present',
  ABSENT: 'absent',
  LATE: 'late',
  EXCUSED: 'excused'
};

export const ASSIGNMENT_STATUS = {
  PENDING: 'pending',
  SUBMITTED: 'submitted',
  GRADED: 'graded',
  OVERDUE: 'overdue'
};

export const EXAM_STATUS = {
  SCHEDULED: 'scheduled',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Fee Types
export const FEE_STATUS = {
  PAID: 'paid',
  PARTIAL: 'partial',
  PENDING: 'pending',
  OVERDUE: 'overdue'
};

export const PAYMENT_METHODS = {
  CASH: 'cash',
  CARD: 'card',
  ONLINE: 'online',
  BANK_TRANSFER: 'bank_transfer'
};

// Notification Types
export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error'
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
};