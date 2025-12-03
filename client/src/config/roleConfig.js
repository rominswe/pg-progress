export const ROLE_CONFIG = {
  student: {
    dashboard: "/student/dashboard",
    layout: "/student/*",
  },
  supervisor: {
    dashboard: "/supervisor/dashboard",
    layout: "/supervisor/*",
  },
  examiner: {
    dashboard: "/examiner/dashboard",
    layout: "/examiner/*",
  },
  cgs: {
    dashboard: "/cgs/dashboard",
    layout: "/cgs/*",
    login: "/cgs/login",
  },
};