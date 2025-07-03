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
