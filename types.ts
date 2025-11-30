export enum UserRole {
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  AGENT = 'AGENTE'
}

export interface User {
  id: string;
  matricula: string;
  password?: string;
  fullName: string;
  role: UserRole;
  isApproved: boolean;
}

export interface Agent {
  id: string;
  name: string;
  assignedSectorId: string | null;
}

export interface Sector {
  id: string;
  name: string;
}

export interface Station {
  id: string;
  name: string;
  sectorId: string;
}

export enum InstallationType {
  CIRCUITOS = 'CIRCUITOS DE VÍA',
  MOTORES = 'MOTORES',
  PN = 'PN',
  SENALES = 'SEÑALES Y ASFA',
  BATERIAS = 'BATERIAS',
  ENCLAVAMIENTO = 'ENCLAVAMIENTO'
}

export interface ElementData {
  id: string;
  stationId: string;
  installationType: InstallationType;
  name: string;
  isCompleted: boolean;
  lastMaintenanceDate?: string;
  
  // Dynamic fields based on type
  data: Record<string, any>; 
}

export interface MaintenanceRecord {
  id: string;
  elementId: string;
  date: string;
  turn: string; // Added turn
  agents: string[];
  dataSnapshot: Record<string, any>; // Snapshot of element data at time of maintenance
}

export interface FaultRecord {
  id: string;
  elementId: string;
  date: string;
  stationName: string;
  agents: string[];
  description: string;
  times: {
    inicio: string;
    llegada: string;
    solAutTrabajos: string;
    concesion: string;
    enServicio: string;
    finTrabajos: string;
    salida: string;
    llegadaDest: string;
  };
  causes: string;
  repair: string;
}

export interface MonthlyList {
  id: string;
  month: number;
  year: number;
  items: {
    elementId: string;
    stationName: string;
    installationType: InstallationType;
    elementName: string;
    completed: boolean;
  }[];
}

export interface Roster {
  id: string;
  sectorId: string;
  month: number;
  year: number;
  // Map agentId -> day (1-31) -> Shift Code
  data: Record<string, Record<string, string>>; 
}