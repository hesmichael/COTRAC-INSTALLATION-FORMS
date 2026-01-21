
export enum AppView {
  WELCOME = 'WELCOME',
  SERVICE_SELECTION = 'SERVICE_SELECTION',
  INTAKE_FORM = 'INTAKE_FORM',
  SIGNATURE = 'SIGNATURE',
  SUCCESS = 'SUCCESS',
  STAFF_DASHBOARD = 'STAFF_DASHBOARD'
}

export type Service = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

export type FormField = {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select' | 'textarea' | 'date';
  required: boolean;
  options?: string[];
  placeholder?: string;
};

export type Submission = {
  id: string;
  serviceId: string;
  serviceName: string;
  formData: Record<string, string>;
  signature: string; // base64
  timestamp: string;
};
