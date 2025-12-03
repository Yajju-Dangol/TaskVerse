export interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  points: number;
  duration: string;
  businessId: string;
  businessName: string;
  skills: string[];
  status: 'open' | 'in-progress' | 'completed' | 'under-review';
  postedDate: string;
  deadline?: string;
}

export interface Submission {
  id: string;
  taskId: string;
  internId: string;
  internName: string;
  submittedDate: string;
  description: string;
  attachmentUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
  rating?: number;
  feedback?: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  internId: string;
  name: string;
  points: number;
  level: number;
  tasksCompleted: number;
  badges: number;
}

export interface PortfolioItem {
  id: string;
  taskTitle: string;
  businessName: string;
  completedDate: string;
  description: string;
  skills: string[];
  rating: number;
  points: number;
}

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Design a Social Media Banner',
    description: 'Create an eye-catching banner for our upcoming product launch on Instagram and Facebook. Dimensions: 1200x630px.',
    category: 'Design',
    difficulty: 'Beginner',
    points: 50,
    duration: '2-3 hours',
    businessId: 'b1',
    businessName: 'TechStart Inc.',
    skills: ['Graphic Design', 'Canva', 'Adobe Photoshop'],
    status: 'open',
    postedDate: '2025-11-15',
    deadline: '2025-11-25',
  },
  {
    id: '2',
    title: 'Write Product Descriptions',
    description: 'Write compelling product descriptions for 10 items in our e-commerce catalog. Each description should be 50-100 words.',
    category: 'Content Writing',
    difficulty: 'Beginner',
    points: 75,
    duration: '3-4 hours',
    businessId: 'b2',
    businessName: 'StyleHub',
    skills: ['Copywriting', 'SEO', 'Content Strategy'],
    status: 'open',
    postedDate: '2025-11-16',
    deadline: '2025-11-30',
  },
  {
    id: '3',
    title: 'Build a Landing Page Component',
    description: 'Create a responsive landing page component using React and Tailwind CSS. Must include hero section, features, and CTA.',
    category: 'Development',
    difficulty: 'Intermediate',
    points: 150,
    duration: '6-8 hours',
    businessId: 'b3',
    businessName: 'WebFlow Solutions',
    skills: ['React', 'Tailwind CSS', 'JavaScript'],
    status: 'open',
    postedDate: '2025-11-14',
    deadline: '2025-11-28',
  },
  {
    id: '4',
    title: 'Market Research Report',
    description: 'Conduct market research on sustainable packaging trends. Deliver a 5-page report with data, insights, and recommendations.',
    category: 'Research',
    difficulty: 'Intermediate',
    points: 100,
    duration: '5-7 hours',
    businessId: 'b4',
    businessName: 'EcoPackage Co.',
    skills: ['Market Research', 'Data Analysis', 'Report Writing'],
    status: 'open',
    postedDate: '2025-11-17',
    deadline: '2025-12-01',
  },
  {
    id: '5',
    title: 'Social Media Content Calendar',
    description: 'Create a 30-day content calendar for our Instagram account with post ideas, captions, and hashtag suggestions.',
    category: 'Marketing',
    difficulty: 'Beginner',
    points: 60,
    duration: '3-4 hours',
    businessId: 'b5',
    businessName: 'FitLife Studio',
    skills: ['Social Media Marketing', 'Content Planning', 'Copywriting'],
    status: 'open',
    postedDate: '2025-11-18',
    deadline: '2025-11-27',
  },
  {
    id: '6',
    title: 'Data Entry and Cleaning',
    description: 'Clean and organize 500 customer records in our database. Remove duplicates and standardize formatting.',
    category: 'Data Entry',
    difficulty: 'Beginner',
    points: 40,
    duration: '2-3 hours',
    businessId: 'b1',
    businessName: 'TechStart Inc.',
    skills: ['Excel', 'Data Entry', 'Attention to Detail'],
    status: 'open',
    postedDate: '2025-11-17',
    deadline: '2025-11-26',
  },
  {
    id: '7',
    title: 'Create Educational Video Script',
    description: 'Write a 5-minute video script explaining blockchain technology to beginners. Include visual cues and talking points.',
    category: 'Content Writing',
    difficulty: 'Intermediate',
    points: 120,
    duration: '4-5 hours',
    businessId: 'b6',
    businessName: 'EduTech Platform',
    skills: ['Script Writing', 'Educational Content', 'Blockchain'],
    status: 'open',
    postedDate: '2025-11-16',
    deadline: '2025-11-29',
  },
  {
    id: '8',
    title: 'UI/UX Design for Mobile App',
    description: 'Design 5 key screens for a fitness tracking mobile app. Provide Figma file with interactive prototype.',
    category: 'Design',
    difficulty: 'Advanced',
    points: 200,
    duration: '8-10 hours',
    businessId: 'b5',
    businessName: 'FitLife Studio',
    skills: ['UI/UX Design', 'Figma', 'Mobile Design'],
    status: 'open',
    postedDate: '2025-11-15',
    deadline: '2025-12-05',
  },
];

export const mockSubmissions: Submission[] = [
  {
    id: 's1',
    taskId: '1',
    internId: 'i1',
    internName: 'Sarah Johnson',
    submittedDate: '2025-11-18',
    description: 'Created a vibrant banner using the brand colors. Included both Instagram and Facebook versions.',
    status: 'pending',
  },
  {
    id: 's2',
    taskId: '2',
    internId: 'i2',
    internName: 'Michael Chen',
    submittedDate: '2025-11-17',
    description: 'Completed all 10 product descriptions with SEO keywords and engaging copy.',
    status: 'approved',
    rating: 5,
    feedback: 'Excellent work! Very professional and engaging descriptions.',
  },
];

export const mockBadges: Badge[] = [
  {
    id: 'b1',
    name: 'First Task',
    description: 'Complete your first task',
    icon: '🎯',
    unlocked: true,
  },
  {
    id: 'b2',
    name: 'Fast Learner',
    description: 'Complete 5 tasks',
    icon: '⚡',
    unlocked: true,
  },
  {
    id: 'b3',
    name: 'Point Master',
    description: 'Earn 500 points',
    icon: '💎',
    unlocked: false,
  },
  {
    id: 'b4',
    name: 'Top Rated',
    description: 'Maintain 4.5+ average rating',
    icon: '⭐',
    unlocked: true,
  },
  {
    id: 'b5',
    name: 'Specialist',
    description: 'Complete 10 tasks in one category',
    icon: '🏆',
    unlocked: false,
  },
  {
    id: 'b6',
    name: 'Team Player',
    description: 'Work with 5 different businesses',
    icon: '🤝',
    unlocked: false,
  },
];

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    internId: 'i1',
    name: 'Sarah Johnson',
    points: 850,
    level: 5,
    tasksCompleted: 17,
    badges: 6,
  },
  {
    rank: 2,
    internId: 'i2',
    name: 'Michael Chen',
    points: 720,
    level: 4,
    tasksCompleted: 14,
    badges: 5,
  },
  {
    rank: 3,
    internId: 'i3',
    name: 'Emily Rodriguez',
    points: 680,
    level: 4,
    tasksCompleted: 13,
    badges: 4,
  },
  {
    rank: 4,
    internId: 'i4',
    name: 'David Kim',
    points: 550,
    level: 3,
    tasksCompleted: 11,
    badges: 4,
  },
  {
    rank: 5,
    internId: 'i5',
    name: 'Jessica Brown',
    points: 490,
    level: 3,
    tasksCompleted: 10,
    badges: 3,
  },
  {
    rank: 6,
    internId: 'i6',
    name: 'Alex Turner',
    points: 420,
    level: 3,
    tasksCompleted: 8,
    badges: 3,
  },
  {
    rank: 7,
    internId: 'i7',
    name: 'Rachel Green',
    points: 380,
    level: 2,
    tasksCompleted: 7,
    badges: 2,
  },
  {
    rank: 8,
    internId: 'i8',
    name: 'James Wilson',
    points: 320,
    level: 2,
    tasksCompleted: 6,
    badges: 2,
  },
];

export const mockPortfolio: PortfolioItem[] = [
  {
    id: 'p1',
    taskTitle: 'Design a Social Media Banner',
    businessName: 'TechStart Inc.',
    completedDate: '2025-11-10',
    description: 'Created professional social media banners for product launch campaign. Delivered in multiple formats optimized for different platforms.',
    skills: ['Graphic Design', 'Canva', 'Adobe Photoshop'],
    rating: 5,
    points: 50,
  },
  {
    id: 'p2',
    taskTitle: 'Market Research Report',
    businessName: 'EcoPackage Co.',
    completedDate: '2025-11-05',
    description: 'Conducted comprehensive market research on sustainable packaging trends. Delivered detailed report with actionable insights and data visualization.',
    skills: ['Market Research', 'Data Analysis', 'Report Writing'],
    rating: 4,
    points: 100,
  },
  {
    id: 'p3',
    taskTitle: 'Social Media Content Calendar',
    businessName: 'FitLife Studio',
    completedDate: '2025-10-28',
    description: 'Developed 30-day content strategy for Instagram including post ideas, captions, and hashtag research targeting fitness enthusiasts.',
    skills: ['Social Media Marketing', 'Content Planning', 'Copywriting'],
    rating: 5,
    points: 60,
  },
];
