import type { Client, Appointment, TimeEntry, TeamMember, Revenue, Content } from './types';

export const clients: Client[] = [
  { id: '1', name: 'Glamour Inc.', contactPerson: 'Jessica Day', email: 'jessica.day@glamour.com', phone: '555-0101', status: 'Active', joinDate: '2023-01-15', monthlyVideos: 5 },
  { id: '2', name: 'Peak Fitness', contactPerson: 'Mike Johnson', email: 'mike.j@peakfitness.com', phone: '555-0102', status: 'Active', joinDate: '2023-03-22', monthlyVideos: 10 },
  { id: '3', name: 'The Coffee House', contactPerson: 'Sarah Lee', email: 'sarah.l@coffeehouse.com', phone: '555-0103', status: 'Inactive', joinDate: '2022-11-10', monthlyVideos: 0 },
  { id: '4', name: 'Innovate Tech', contactPerson: 'David Chen', email: 'david.c@innovate.tech', phone: '555-0104', status: 'Lead', joinDate: '2024-05-01', monthlyVideos: 8 },
  { id: '5', name: 'Artisan Bakes', contactPerson: 'Emily White', email: 'emily.w@artisanbakes.com', phone: '555-0105', status: 'Active', joinDate: '2023-08-01', monthlyVideos: 3 },
];

export const team: TeamMember[] = [
    { id: '1', name: 'Alex Doe', email: 'alex@clientflow.com', phone: '555-0201', role: 'Manager', assignedClients: ['Glamour Inc.', 'Peak Fitness'] },
    { id: '2', name: 'Casey Jordan', email: 'casey@clientflow.com', phone: '555-0202', role: 'Strategist', assignedClients: ['Peak Fitness', 'The Coffee House'] },
    { id: '3', name: 'Taylor Morgan', email: 'taylor@clientflow.com', phone: '555-0203', role: 'Designer', assignedClients: ['Glamour Inc.', 'Artisan Bakes'] },
    { id: '4', name: 'Alex Ray', email: 'ray@clientflow.com', phone: '555-0204', role: 'Designer', assignedClients: ['Innovate Tech', 'The Coffee House'] },
];

const today = new Date();
export const appointments: Appointment[] = [
    { id: '1', title: 'Content Strategy Meeting with Glamour Inc.', date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), type: 'Meeting', clientId: '1', location: 'Online / Google Meet', assignedPersons: ['Alex Doe', 'Casey Jordan'], comments: 'Prepare Q3 content plan.' },
    { id: '2', title: 'Design new posts for Peak Fitness', date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), type: 'Task', clientId: '2', assignedPersons: ['Taylor Morgan'], comments: 'Focus on video content.' },
    { id: '3', title: 'Peak Fitness campaign launch', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), type: 'Deadline', clientId: '2', assignedPersons: ['Casey Jordan', 'Alex Ray'], location: 'Remote' },
    { id: '4', title: 'Follow up with Innovate Tech', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0), type: 'Meeting', clientId: '4', location: 'Client Office', assignedPersons: ['Alex Doe'], comments: 'Discuss contract details.' },
];

export const timeEntries: TimeEntry[] = [
    { id: '1', date: '2024-07-21', teamMember: 'Alex Ray', client: 'Glamour Inc.', task: 'Content Creation', duration: 4 },
    { id: '2', date: '2024-07-21', teamMember: 'Casey Jordan', client: 'Peak Fitness', task: 'Ad Campaign Management', duration: 6.5 },
    { id: '3', date: '2024-07-20', teamMember: 'Alex Ray', client: 'The Coffee House', task: 'Analytics Report', duration: 2.25 },
    { id: '4', date: '2024-07-20', teamMember: 'Taylor Morgan', client: 'Glamour Inc.', task: 'Client Meeting', duration: 1 },
];

export const teamMembers: string[] = team.map(member => member.name);

export const revenues: Revenue[] = [
    { id: '1', revenue: 5000, month: 'July 2024', client: 'Glamour Inc.', comment: 'Monthly Retainer' },
    { id: '2', revenue: 7500, month: 'July 2024', client: 'Peak Fitness', comment: 'Campaign Management Fee' },
    { id: '3', revenue: 4500, month: 'June 2024', client: 'Glamour Inc.', comment: 'Monthly Retainer' },
    { id: '4', revenue: 7000, month: 'June 2024', client: 'Peak Fitness', comment: 'Campaign Management Fee' },
    { id: '5', revenue: 3000, month: 'June 2024', client: 'Artisan Bakes', comment: 'Initial Project Fee' },
];

export const content: Content[] = [
  { id: '1', title: 'Summer Campaign Launch Video', client: 'Glamour Inc.', status: 'In Progress', platform: 'Instagram', deadline: '2024-08-15', owner: 'Casey Jordan', description: 'A vibrant and energetic video showcasing the new summer collection. Aim for a 30-second reel with trending audio.' },
  { id: '2', title: '10 Healthy Breakfast Ideas', client: 'Peak Fitness', status: 'To Do', platform: 'TikTok', deadline: '2024-08-10', owner: 'Alex Ray', link: 'https://example.com/draft1', description: 'Quick-cut video series demonstrating 10 easy and healthy breakfast recipes. Each clip should be 3-5 seconds long.' },
  { id: '3', title: 'Behind the Scenes at the Roastery', client: 'The Coffee House', status: 'Done', platform: 'Instagram', deadline: '2024-07-28', owner: 'Taylor Morgan', link: 'https://instagram.com/p/12345', description: 'A short documentary-style video showing the coffee roasting process and interviews with the staff.' },
  { id: '4', title: 'New Feature Announcement', client: 'Innovate Tech', status: 'In Review', platform: 'X', deadline: '2024-08-05', owner: 'Casey Jordan', description: 'A concise and impactful graphic announcing the latest software update. Highlight the top 3 new features.' },
  { id: '5', title: 'Weekly Special: Croissant-Muffin', client: 'Artisan Bakes', status: 'In Progress', platform: 'Facebook', deadline: '2024-08-01', owner: 'Alex Ray', link: 'https://example.com/draft2', description: 'A delicious-looking carousel post with high-quality photos of the new croissant-muffin hybrid. Include a call-to-action to visit the store.' },
  { id: '6', title: 'Q3 Results Infographic', client: 'Glamour Inc.', status: 'To Do', platform: 'X', deadline: '2024-09-01', owner: 'Taylor Morgan', description: 'An easy-to-read infographic summarizing the key success metrics from the third quarter. Use brand colors and clear data visualizations.' },
];

export const financialData = {
    monthly: {
        revenue: 12500,
        expenses: 4200,
        profit: 8300,
    },
    yearly: {
        revenue: 85000,
        expenses: 32000,
        profit: 53000,
    },
    revenueByClient: [
        { name: 'Glamour Inc.', revenue: 35000, fill: "var(--color-chart-1)" },
        { name: 'Peak Fitness', revenue: 40000, fill: "var(--color-chart-2)" },
        { name: 'The Coffee House', revenue: 10000, fill: "var(--color-chart-4)" },
    ],
    profitTrend: [
        { month: 'Jan', profit: 7000 },
        { month: 'Feb', profit: 7500 },
        { month: 'Mar', profit: 9000 },
        { month: 'Apr', profit: 8200 },
        { month: 'May', profit: 9500 },
        { month: 'Jun', profit: 10200 },
        { month: 'Jul', profit: 8300 },
    ],
};
