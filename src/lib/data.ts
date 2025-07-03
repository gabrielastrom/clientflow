import type { Client, Appointment, TimeEntry } from './types';

export const clients: Client[] = [
  { id: '1', name: 'Glamour Inc.', contactPerson: 'Jessica Day', email: 'jessica.day@glamour.com', phone: '555-0101', status: 'Active', joinDate: '2023-01-15' },
  { id: '2', name: 'Peak Fitness', contactPerson: 'Mike Johnson', email: 'mike.j@peakfitness.com', phone: '555-0102', status: 'Active', joinDate: '2023-03-22' },
  { id: '3', name: 'The Coffee House', contactPerson: 'Sarah Lee', email: 'sarah.l@coffeehouse.com', phone: '555-0103', status: 'Inactive', joinDate: '2022-11-10' },
  { id: '4', name: 'Innovate Tech', contactPerson: 'David Chen', email: 'david.c@innovate.tech', phone: '555-0104', status: 'Lead', joinDate: '2024-05-01' },
  { id: '5', name: 'Artisan Bakes', contactPerson: 'Emily White', email: 'emily.w@artisanbakes.com', phone: '555-0105', status: 'Active', joinDate: '2023-08-01' },
];

const today = new Date();
export const appointments: Appointment[] = [
    { id: '1', title: 'Content Strategy Meeting with Glamour Inc.', date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0), type: 'Meeting', clientId: '1' },
    { id: '2', title: 'Design new posts for Peak Fitness', date: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 14, 0), type: 'Task', clientId: '2' },
    { id: '3', title: 'Peak Fitness campaign launch', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2), type: 'Deadline', clientId: '2' },
    { id: '4', title: 'Follow up with Innovate Tech', date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1, 11, 0), type: 'Meeting', clientId: '4'},
];

export const timeEntries: TimeEntry[] = [
    { id: '1', date: '2024-07-21', teamMember: 'Alex Ray', client: 'Glamour Inc.', task: 'Content Creation', duration: '4h 0m' },
    { id: '2', date: '2024-07-21', teamMember: 'Casey Jordan', client: 'Peak Fitness', task: 'Ad Campaign Management', duration: '6h 30m' },
    { id: '3', date: '2024-07-20', teamMember: 'Alex Ray', client: 'The Coffee House', task: 'Analytics Report', duration: '2h 15m' },
    { id: '4', date: '2024-07-20', teamMember: 'Taylor Morgan', client: 'Glamour Inc.', task: 'Client Meeting', duration: '1h 0m' },
];

export const teamMembers: string[] = ['Alex Ray', 'Casey Jordan', 'Taylor Morgan', 'Alex Doe'];

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
        { name: 'Coffee House', revenue: 10000, fill: "var(--color-chart-3)" },
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
