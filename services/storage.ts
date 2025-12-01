

import { User, Agent, ElementData, MaintenanceRecord, FaultRecord, MonthlyList, UserRole, InstallationType, Roster } from '../types';

// Mock Data Keys
const KEYS = {
  USERS: 'sigma_users',
  AGENTS: 'sigma_agents',
  ELEMENTS: 'sigma_elements',
  MAINTENANCE: 'sigma_maintenance',
  FAULTS: 'sigma_faults',
  LISTS: 'sigma_lists',
  SESSION: 'sigma_session',
  ROSTER: 'sigma_roster'
};

// Check if we should use real backend (Environment Variable)
// Safely access env to prevent crashes in some preview environments
const env = (import.meta as any).env || {};
const USE_BACKEND = env.VITE_USE_BACKEND === 'true';
const API_URL = env.VITE_API_URL || 'http://localhost:3000/api';

// --- INITIALIZATION (Local Only) ---

const initData = () => {
  if (USE_BACKEND) return; // Skip if using real backend

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
            pk: '10.500',
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
        data: { pk: '10.550' }
      }
    ];
    localStorage.setItem(KEYS.ELEMENTS, JSON.stringify(dummyElements));
  }
};

initData();

// --- HELPER FOR HTTP REQUESTS ---
async function fetchAPI(endpoint: string, method: string = 'GET', body?: any) {
    if (!USE_BACKEND) return null;
    try {
        const options: RequestInit = {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: body ? JSON.stringify(body) : undefined
        };
        const res = await fetch(`${API_URL}${endpoint}`, options);
        if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || `API Error: ${res.statusText}`);
        }
        return await res.json();
    } catch (err) {
        console.error(err);
        return { error: err };
    }
}

// --- API IMPLEMENTATION (Hybrid) ---

export const api = {
  // Users
  login: async (matricula: string, pass: string): Promise<User | null> => {
    if (USE_BACKEND) {
        const user = await fetchAPI('/users/login', 'POST', { matricula, password: pass });
        return user && !user.error ? user : null;
    }
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const user = users.find((u: User) => u.matricula === matricula && u.password === pass);
    if (user && user.isApproved) return user;
    return null;
  },
  register: async (userData: Partial<User>) => {
    if (USE_BACKEND) return await fetchAPI('/users/register', 'POST', userData);
    
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
  changePassword: async (userId: string, oldPass: string, newPass: string) => {
    if (USE_BACKEND) {
        const res = await fetchAPI('/users/change-password', 'POST', { userId, oldPassword: oldPass, newPassword: newPass });
        return res && res.success;
    }
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    const userIndex = users.findIndex((u: User) => u.id === userId);
    
    if (userIndex === -1) return false;
    if (users[userIndex].password !== oldPass) return false;

    users[userIndex].password = newPass;
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    return true;
  },
  getPendingUsers: async (): Promise<User[]> => {
    if (USE_BACKEND) {
        const res = await fetchAPI('/users/pending');
        return Array.isArray(res) ? res : [];
    }
    const users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    return users.filter((u: User) => !u.isApproved);
  },
  approveUser: async (id: string, approve: boolean) => {
    if (USE_BACKEND) return await fetchAPI(`/users/${id}/approve`, 'POST', { approve });

    let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    if (approve) {
        users = users.map((u: User) => u.id === id ? { ...u, isApproved: true } : u);
    } else {
        users = users.filter((u: User) => u.id !== id);
    }
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  getUsers: async (): Promise<User[]> => {
      if (USE_BACKEND) {
          const res = await fetchAPI('/users');
          return Array.isArray(res) ? res : [];
      }
      return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
  },
  deleteUser: async (id: string) => {
    if (USE_BACKEND) return await fetchAPI(`/users/${id}`, 'DELETE');

    let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
    users = users.filter((u: User) => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },
  updateUserRole: async (id: string, role: UserRole) => {
     if (USE_BACKEND) return await fetchAPI(`/users/${id}/role`, 'PATCH', { role });

     let users = JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
     users = users.map((u: User) => u.id === id ? {...u, role} : u);
     localStorage.setItem(KEYS.USERS, JSON.stringify(users));
  },

  // Agents
  getAgents: async (): Promise<Agent[]> => {
      if (USE_BACKEND) {
          const res = await fetchAPI('/agents');
          return Array.isArray(res) ? res : [];
      }
      return JSON.parse(localStorage.getItem(KEYS.AGENTS) || '[]');
  },
  createAgent: async (name: string) => {
    if (USE_BACKEND) return await fetchAPI('/agents', 'POST', { name });

    const agents = JSON.parse(localStorage.getItem(KEYS.AGENTS) || '[]');
    const newAgent = { id: Date.now().toString(), name: name.toUpperCase(), assignedSectorId: null };
    agents.push(newAgent);
    localStorage.setItem(KEYS.AGENTS, JSON.stringify(agents));
  },
  updateAgentSector: async (agentId: string, sectorId: string | null) => {
    if (USE_BACKEND) return await fetchAPI(`/agents/${agentId}/sector`, 'PATCH', { sectorId });

    const agents = JSON.parse(localStorage.getItem(KEYS.AGENTS) || '[]');
    const updated = agents.map((a: Agent) => a.id === agentId ? { ...a, assignedSectorId: sectorId } : a);
    localStorage.setItem(KEYS.AGENTS, JSON.stringify(updated));
  },
  deleteAgent: async (id: string) => {
    if (USE_BACKEND) return await fetchAPI(`/agents/${id}`, 'DELETE');

    let agents = JSON.parse(localStorage.getItem(KEYS.AGENTS) || '[]');
    agents = agents.filter((a: Agent) => a.id !== id);
    localStorage.setItem(KEYS.AGENTS, JSON.stringify(agents));
  },

  // Elements
  getElements: async (stationId: string, type: InstallationType): Promise<ElementData[]> => {
    if (USE_BACKEND) {
        const res = await fetchAPI(`/elements?stationId=${stationId}&type=${type}`);
        return Array.isArray(res) ? res : [];
    }
    const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
    return elements.filter((e: ElementData) => e.stationId === stationId && e.installationType === type);
  },
  getElementCounts: async (stationId: string): Promise<Record<string, number>> => {
      if (USE_BACKEND) {
          const res = await fetchAPI(`/elements/counts?stationId=${stationId}`);
          return res && !res.error ? res : {};
      }
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
    if (USE_BACKEND) return await fetchAPI('/elements', 'POST', element);

    const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
    elements.push(element);
    localStorage.setItem(KEYS.ELEMENTS, JSON.stringify(elements));
  },
  updateElement: async (element: ElementData) => {
    if (USE_BACKEND) return await fetchAPI(`/elements/${element.id}`, 'PUT', element);

    const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
    const updated = elements.map((e: ElementData) => e.id === element.id ? element : e);
    localStorage.setItem(KEYS.ELEMENTS, JSON.stringify(updated));
  },
  deleteElement: async (id: string) => {
    if (USE_BACKEND) return await fetchAPI(`/elements/${id}`, 'DELETE');

    let elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
    elements = elements.filter((e: ElementData) => e.id !== id);
    localStorage.setItem(KEYS.ELEMENTS, JSON.stringify(elements));
  },
  
  // Maintenance & Faults
  addMaintenance: async (record: MaintenanceRecord) => {
    if (USE_BACKEND) return await fetchAPI('/maintenance', 'POST', record);

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
    if (USE_BACKEND) {
        const res = await fetchAPI(`/maintenance?elementId=${elementId}`);
        return Array.isArray(res) ? res : [];
    }
    const records = JSON.parse(localStorage.getItem(KEYS.MAINTENANCE) || '[]');
    return records.filter((r: MaintenanceRecord) => r.elementId === elementId).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  deleteMaintenance: async (id: string) => {
    if (USE_BACKEND) return await fetchAPI(`/maintenance/${id}`, 'DELETE');

    let records = JSON.parse(localStorage.getItem(KEYS.MAINTENANCE) || '[]');
    records = records.filter((r: MaintenanceRecord) => r.id !== id);
    localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(records));
  },
  addFault: async (record: FaultRecord) => {
    if (USE_BACKEND) return await fetchAPI('/faults', 'POST', record);

    const records = JSON.parse(localStorage.getItem(KEYS.FAULTS) || '[]');
    records.push(record);
    localStorage.setItem(KEYS.FAULTS, JSON.stringify(records));
  },
  getFaultHistory: async (elementId: string): Promise<FaultRecord[]> => {
    if (USE_BACKEND) {
        const res = await fetchAPI(`/faults?elementId=${elementId}`);
        return Array.isArray(res) ? res : [];
    }
    const records = JSON.parse(localStorage.getItem(KEYS.FAULTS) || '[]');
    return records.filter((r: FaultRecord) => r.elementId === elementId).sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
  deleteFault: async (id: string) => {
    if (USE_BACKEND) return await fetchAPI(`/faults/${id}`, 'DELETE');

    let records = JSON.parse(localStorage.getItem(KEYS.FAULTS) || '[]');
    records = records.filter((r: FaultRecord) => r.id !== id);
    localStorage.setItem(KEYS.FAULTS, JSON.stringify(records));
  },
  getDailyMaintenance: async (date: string, turn?: string) => {
      if (USE_BACKEND) {
          const res = await fetchAPI(`/reports/daily?date=${date}&turn=${turn}`);
          return Array.isArray(res) ? res : [];
      }
      const records = JSON.parse(localStorage.getItem(KEYS.MAINTENANCE) || '[]');
      const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
      
      return records.filter((r: MaintenanceRecord) => {
          const turnMatch = turn ? r.turn === turn : true;
          return r.date === date && turnMatch;
      }).map((r: MaintenanceRecord) => {
          const el = elements.find((e: ElementData) => e.id === r.elementId);
          return { ...r, elementName: el?.name, stationId: el?.stationId };
      });
  },
  getMonthlyMaintenance: async (month: number, year: number) => {
       if (USE_BACKEND) {
           const res = await fetchAPI(`/reports/monthly?month=${month}&year=${year}`);
           return Array.isArray(res) ? res : [];
       }
       const records = JSON.parse(localStorage.getItem(KEYS.MAINTENANCE) || '[]');
       const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
       return records.filter((r: MaintenanceRecord) => {
           let d = new Date(r.date);
           if (isNaN(d.getTime())) {
                const parts = r.date.split('/');
                if(parts.length === 3) d = new Date(Number(parts[2]), Number(parts[1])-1, Number(parts[0]));
           }
           return d.getMonth() + 1 === month && d.getFullYear() === year;
       }).map((r: MaintenanceRecord) => {
           const el = elements.find((e: ElementData) => e.id === r.elementId);
           return { ...r, elementName: el?.name, stationId: el?.stationId };
       });
  },

  // Lists & Stats
  saveMonthlyList: async (list: MonthlyList) => {
      if (USE_BACKEND) return await fetchAPI('/lists', 'POST', list);

      let lists = JSON.parse(localStorage.getItem(KEYS.LISTS) || '[]');
      lists = lists.filter((l: MonthlyList) => !(l.month === list.month && l.year === list.year));
      lists.push(list);
      localStorage.setItem(KEYS.LISTS, JSON.stringify(lists));
  },
  getMonthlyList: async (month: number, year: number): Promise<MonthlyList | null> => {
      if (USE_BACKEND) {
          const res = await fetchAPI(`/lists?month=${month}&year=${year}`);
          return res && !res.error ? res : null;
      }

      const lists = JSON.parse(localStorage.getItem(KEYS.LISTS) || '[]');
      const list = lists.find((l: MonthlyList) => l.month === month && l.year === year);
      
      if (list) {
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
      if (USE_BACKEND) {
          const res = await fetchAPI(`/stats?semester=${semester}&year=${year}`);
          return res && !res.error ? res : {};
      }

      const lists = JSON.parse(localStorage.getItem(KEYS.LISTS) || '[]');
      const elements = JSON.parse(localStorage.getItem(KEYS.ELEMENTS) || '[]');
      
      const startMonth = semester === 1 ? 1 : 7;
      const endMonth = semester === 1 ? 6 : 12;
      
      const semLists = lists.filter((l: MonthlyList) => l.year === year && l.month >= startMonth && l.month <= endMonth);

      const stats: Record<string, { total: number, completed: number }> = {};
      
      semLists.forEach((list: MonthlyList) => {
          list.items.forEach((item: any) => {
             if(!stats[item.installationType]) stats[item.installationType] = { total: 0, completed: 0 };
             stats[item.installationType].total++;
             
             const liveEl = elements.find((e: ElementData) => e.id === item.elementId);
             if (liveEl && liveEl.isCompleted) {
                 stats[item.installationType].completed++;
             }
          });
      });

      return stats;
  },

  // ROSTER METHODS
  getRoster: async (sectorId: string, month: number, year: number): Promise<Roster | null> => {
      if (USE_BACKEND) {
          const res = await fetchAPI(`/roster?sectorId=${sectorId}&month=${month}&year=${year}`);
          return res && !res.error ? res : null;
      }

      const rosters = JSON.parse(localStorage.getItem(KEYS.ROSTER) || '[]');
      const roster = rosters.find((r: Roster) => r.sectorId === sectorId && r.month === month && r.year === year);
      return roster || null;
  },
  saveRoster: async (roster: Roster) => {
      if (USE_BACKEND) return await fetchAPI('/roster', 'POST', roster);

      let rosters = JSON.parse(localStorage.getItem(KEYS.ROSTER) || '[]');
      rosters = rosters.filter((r: Roster) => !(r.sectorId === roster.sectorId && r.month === roster.month && r.year === roster.year));
      rosters.push(roster);
      localStorage.setItem(KEYS.ROSTER, JSON.stringify(rosters));
  },
  getRosterStats: async (sectorId: string, year: number): Promise<Record<string, Record<string, number>>> => {
      if (USE_BACKEND) {
          const res = await fetchAPI(`/roster/stats?sectorId=${sectorId}&year=${year}`);
          return res && !res.error ? res : {};
      }

      const rosters = JSON.parse(localStorage.getItem(KEYS.ROSTER) || '[]');
      const stats: Record<string, Record<string, number>> = {};

      rosters.filter((r: Roster) => r.sectorId === sectorId && r.year === year).forEach((r: Roster) => {
          Object.keys(r.data).forEach(agentId => {
               if(!stats[agentId]) stats[agentId] = {};
               Object.values(r.data[agentId]).forEach((type: string) => {
                   if(type) stats[agentId][type] = (stats[agentId][type] || 0) + 1;
               });
          });
      });
      return stats;
  }
};

export const checkSemesterReset = () => {
    if (USE_BACKEND) return; 

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
