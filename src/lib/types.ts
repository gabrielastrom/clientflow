export type Client = {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive' | 'Lead';
  joinDate: string;
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
    duration: string;
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
