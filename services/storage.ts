import { User, Agent, ElementData, MaintenanceRecord, FaultRecord, MonthlyList, UserRole, InstallationType } from '../types';

// Mock Data Keys
const KEYS = {
  USERS: 'sigma_users',
  AGENTS: 'sigma_agents',
  ELEMENTS: 'sigma_elements',
  MAINTENANCE: 'sigma_maintenance',
  FAULTS: 'sigma_faults',
  LISTS: 'sigma_lists',
  SESSION: 'sigma_session'
};

// --- INITIALIZATION ---

const initData = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    const admin: User = {
      id: 'admin-001',
      matricula: 'srchicano',
      password: 'admin',
      fullName: 'SR CHICANO',
      role: UserRole.ADMIN,
      isApproved: true
    };
    localStorage.setItem(KEYS.USERS, JSON.stringify([admin]));
  }
  if (!localStorage.getItem(KEYS.AGENTS)) {
    localStorage.setItem(KEYS.AGENTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.ELEMENTS)) {
    // Seeding some dummy data for demonstration
    const dummyElements: ElementData[] = [
      {
        id: 'cv-001',
        stationId: 'dos-hermanas',
        installationType: InstallationType.CIRCUITOS,
        name: 'CV 1',
        isCompleted: false,
        data: {
            frecuencia: '13.5 kHz',
            filtro: '56 V',
            receptores: { i1: '0.965 V', i2: '0.965 V', i3: '0.965 V' },
            reles: { i1: '13.25 V', i2: '13.25 V', i3: '13.25 V' },
            shunt: { asu: '0.115 V', parasitas: '0.115 V' },
            colaterales: { c1: '9.65 V', c2: '9.65 V', c3: '9.65 V', c4: '9.65 V' }
        }
      },
       {
        id: 'mot-001',
        stationId: 'dos-hermanas',
        installationType: InstallationType.MOTORES,
        name: 'AGUJA 1',
        isCompleted: true,
        data: {}
      }
    ];
    localStorage.setItem(KEYS.ELEMENTS, JSON.stringify(dummyElements));
  }
};

initData();

// --- API SIMULATION ---

export const api = {
  // Users
  login: async (matricula: string, pass: string): Promise<User | null> => {
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const user = users.find((u: User) => u.matricula === matricula && u.password === pass);
    if (user && user.isApproved) return user;
    return null;
  },
  register: async (userData: Partial<User>) => {
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const newUser = { 
        ...userData, 
        id: Date.now().toString(), 
        isApproved: false, 
        role: userData.role || UserRole.AGENT 
    } as User;
    users.push(newUser);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return newUser;
  },
  getPendingUsers: async (): Promise<User[]> => {
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    return users.filter((u: User) => !u.isApproved);
  },
  approveUser: async (id: string, approve: boolean) => {
    let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    if (approve) {
        users = users.map((u: User) => u.id === id ? { ...u, isApproved: true } : u);
    } else {
        users = users.filter((u: User) => u.id !== id);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  getUsers: async (): Promise<User[]> => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  deleteUser: async (id: string) => {
    let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    users = users.filter((u: User) => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  updateUserRole: async (id: string, role: UserRole) => {
     let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
     users = users.map((u: User) => u.id === id ? {...u, role} : u);
     localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  // Agents
  getAgents: async (): Promise<Agent[]> => JSON.parse(localStorage.getItem(KEYS.AGENTS) || '[]'),
  createAgent: async (name: string) => {
    const agents = JSON.parse(localStorage.getItem(KEYS.AGENTS) || '[]');
    const newAgent = { id: Date.now().toString(), name: name.toUpperCase(), assignedSectorId: null };
    agents.push(newAgent);
    localStorage.setItem(KEYS.AGENTS, JSON.stringify(agents));
  },
  updateAgentSector: async (agentId: string, sectorId: string | null) => {
    const agents = JSON.parse(localStorage.getItem(KEYS.AGENTS) || '[]');
    const updated = agents.map((a: Agent) => a.id === agentId ? { ...a, assignedSectorId: sectorId } : a);
    localStorage.setItem(KEYS.AGENTS, JSON.stringify(updated));
  },

  // Elements
  getElements: async (stationId: string, type: InstallationType): Promise<ElementData[]> => {
    const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
    return elements.filter((e: ElementData) => e.stationId === stationId && e.installationType === type);
  },
  getElementCounts: async (stationId: string): Promise<Record<string, number>> => {
      const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
      const counts: Record<string, number> = {};
      elements.forEach((e: ElementData) => {
          if (e.stationId === stationId) {
              counts[e.installationType] = (counts[e.installationType] || 0) + 1;
          }
      });
      return counts;
  },
  createElement: async (element: ElementData) => {
    const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
    elements.push(element);
    localStorage.setItem(KEYS.ELEMENTS, JSON.stringify(elements));
  },
  updateElement: async (element: ElementData) => {
    const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
    const updated = elements.map((e: ElementData) => e.id === element.id ? element : e);
    localStorage.setItem(KEYS.ELEMENTS, JSON.stringify(updated));
  },
  
  // Maintenance & Faults
  addMaintenance: async (record: MaintenanceRecord) => {
    const records = JSON.parse(localStorage.getItem(KEYS.MAINTENANCE) || '[]');
    records.push(record);
    localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(records));
    
    // Update last maintenance date on element
    const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
    const updated = elements.map((e: ElementData) => 
      e.id === record.elementId ? { ...e, lastMaintenanceDate: record.date } : e
    );
    localStorage.setItem(KEYS.ELEMENTS, JSON.stringify(updated));
  },
  getMaintenanceHistory: async (elementId: string): Promise<MaintenanceRecord[]> => {
    const records = JSON.parse(localStorage.getItem(KEYS.MAINTENANCE) || '[]');
    return records.filter((r: MaintenanceRecord) => r.elementId === elementId).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  addFault: async (record: FaultRecord) => {
    const records = JSON.parse(localStorage.getItem(KEYS.FAULTS) || '[]');
    records.push(record);
    localStorage.setItem(KEYS.FAULTS, JSON.stringify(records));
  },
  getFaultHistory: async (elementId: string): Promise<FaultRecord[]> => {
    const records = JSON.parse(localStorage.getItem(KEYS.FAULTS) || '[]');
    return records.filter((r: FaultRecord) => r.elementId === elementId).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  getDailyMaintenance: async (date: string, turn?: string) => {
      // Simplification: Turn ignored for mock, filtering by date
      const records = JSON.parse(localStorage.getItem(KEYS.MAINTENANCE) || '[]');
      const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
      return records.filter((r: MaintenanceRecord) => r.date === date).map((r: MaintenanceRecord) => {
          const el = elements.find((e: ElementData) => e.id === r.elementId);
          return { ...r, elementName: el?.name, stationId: el?.stationId };
      });
  },
  getMonthlyMaintenance: async (month: number, year: number) => {
       const records = JSON.parse(localStorage.getItem(KEYS.MAINTENANCE) || '[]');
       const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
       return records.filter((r: MaintenanceRecord) => {
           const d = new Date(r.date);
           return d.getMonth() + 1 === month && d.getFullYear() === year;
       }).map((r: MaintenanceRecord) => {
           const el = elements.find((e: ElementData) => e.id === r.elementId);
           return { ...r, elementName: el?.name };
       });
  },

  // Lists & Stats
  saveMonthlyList: async (list: MonthlyList) => {
      let lists = JSON.parse(localStorage.getItem(KEYS.LISTS) || '[]');
      // remove existing if update
      lists = lists.filter((l: MonthlyList) => !(l.month === list.month && l.year === list.year));
      lists.push(list);
      localStorage.setItem(KEYS.LISTS, JSON.stringify(lists));
  },
  getMonthlyList: async (month: number, year: number): Promise<MonthlyList | null> => {
      const lists = JSON.parse(localStorage.getItem(KEYS.LISTS) || '[]');
      const list = lists.find((l: MonthlyList) => l.month === month && l.year === year);
      
      if (list) {
          // Hydrate with current completion status from Elements
          const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
          const updatedItems = list.items.map((item: any) => {
              const liveElement = elements.find((e: ElementData) => e.id === item.elementId);
              return {
                  ...item,
                  completed: liveElement ? liveElement.isCompleted : item.completed
              };
          });
          return { ...list, items: updatedItems };
      }
      return null;
  },
  getSemesterStats: async (semester: 1 | 2, year: number) => {
      const lists = JSON.parse(localStorage.getItem(KEYS.LISTS) || '[]');
      const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
      
      // Filter lists belonging to the semester
      const startMonth = semester === 1 ? 1 : 7;
      const endMonth = semester === 1 ? 6 : 12;
      
      const semLists = lists.filter((l: MonthlyList) => l.year === year && l.month >= startMonth && l.month <= endMonth);

      // Aggregate data by installation type
      const stats: Record<string, { total: number, completed: number }> = {};
      
      semLists.forEach((list: MonthlyList) => {
          list.items.forEach((item: any) => {
             if(!stats[item.installationType]) stats[item.installationType] = { total: 0, completed: 0 };
             stats[item.installationType].total++;
             
             // Check live status
             const liveEl = elements.find((e: ElementData) => e.id === item.elementId);
             if (liveEl && liveEl.isCompleted) {
                 stats[item.installationType].completed++;
             }
          });
      });

      return stats;
  }
};

// Check reset logic (Jan 1 / Jul 1)
export const checkSemesterReset = () => {
    const lastReset = localStorage.getItem('sigma_last_reset');
    const now = new Date();
    const currentSemStart = new Date(now.getFullYear(), now.getMonth() >= 6 ? 6 : 0, 1);
    
    if (!lastReset || new Date(lastReset) < currentSemStart) {
        const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
        const updated = elements.map((e: ElementData) => ({...e, isCompleted: false}));
        localStorage.setItem(KEYS.ELEMENTS, JSON.stringify(updated));
        localStorage.setItem('sigma_last_reset', now.toISOString());
    }
};