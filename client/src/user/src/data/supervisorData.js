// supervisorData.js

export const students = [
  {
    id: '1',
    name: 'Michael Chen',
    researchTitle: 'Machine Learning Applications in Healthcare Diagnostics',
    progress: 75,
    lastSubmissionDate: '2024-11-08',
    email: 'michael.chen@university.edu',
  },
  {
    id: '2',
    name: 'Sarah Williams',
    researchTitle: 'Sustainable Urban Planning in Developing Nations',
    progress: 60,
    lastSubmissionDate: '2024-11-05',
    email: 'sarah.williams@university.edu',
  },
  {
    id: '3',
    name: 'Ahmed Hassan',
    researchTitle: 'Quantum Computing for Cryptographic Security',
    progress: 85,
    lastSubmissionDate: '2024-11-09',
    email: 'ahmed.hassan@university.edu',
  },
  {
    id: '4',
    name: 'Emily Rodriguez',
    researchTitle: 'Climate Change Impact on Marine Ecosystems',
    progress: 45,
    lastSubmissionDate: '2024-11-01',
    email: 'emily.rodriguez@university.edu',
  },
  {
    id: '5',
    name: 'David Kim',
    researchTitle: 'Neural Networks for Natural Language Processing',
    progress: 90,
    lastSubmissionDate: '2024-11-10',
    email: 'david.kim@university.edu',
  },
  {
    id: '6',
    name: 'Jennifer Taylor',
    researchTitle: 'Behavioral Economics in Digital Markets',
    progress: 55,
    lastSubmissionDate: '2024-11-03',
    email: 'jennifer.taylor@university.edu',
  },
];

export const submissions = [
  {
    id: '1',
    studentName: 'Michael Chen',
    documentType: 'Chapter 3 - Methodology',
    submittedDate: '2024-11-08',
    status: 'pending',
  },
  {
    id: '2',
    studentName: 'Ahmed Hassan',
    documentType: 'Literature Review',
    submittedDate: '2024-11-09',
    status: 'pending',
  },
  {
    id: '3',
    studentName: 'David Kim',
    documentType: 'Complete Draft Thesis',
    submittedDate: '2024-11-10',
    status: 'pending',
  },
  {
    id: '4',
    studentName: 'Sarah Williams',
    documentType: 'Research Proposal',
    submittedDate: '2024-11-05',
    status: 'approved',
  },
  {
    id: '5',
    studentName: 'Jennifer Taylor',
    documentType: 'Chapter 2 - Literature Review',
    submittedDate: '2024-11-03',
    status: 'rejected',
  },
  {
    id: '6',
    studentName: 'Emily Rodriguez',
    documentType: 'Progress Report',
    submittedDate: '2024-11-01',
    status: 'approved',
  },
];

export const dashboardStats = {
  totalStudents: 6,
  pendingReviews: 3,
  thesisApproved: 2,
  proposalsReviewed: 4,
};