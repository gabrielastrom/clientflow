export type Client = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Lead';
  joinDate: string;
  monthlyVideos: number;
};

export type Appointment = {
  id: string;
  title: string;
  date: Date;
  type: 'Meeting' | 'Deadline' | 'Task';
  clientId?: string;
};

export type TimeEntry = {
    id: string;
    date: string;
    teamMember: string;
    client: string;
    task: string;
    duration: number;
};

export type TeamMember = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: 'Manager' | 'Strategist' | 'Designer';
    assignedClients: string[];
};

export type Revenue = {
    id: string;
    revenue: number;
    month: string;
    client: string;
    comment: string;
};

export type Content = {
  id: string;
  title: string;
  client: string;
  status: 'To Do' | 'In Progress' | 'In Review' | 'Done';
  platform: 'Instagram' | 'TikTok' | 'X' | 'Facebook';
  deadline: string;
  owner: string;
  link?: string;
};
