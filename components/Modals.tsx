

import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Download, BarChart2, Save, Calendar, Clock, User, AlertTriangle, FileText, Grid, Lock } from 'lucide-react';
import { Agent, Sector, User as UserType, UserRole, MonthlyList, InstallationType, ElementData, MaintenanceRecord, FaultRecord, Roster } from '../types';
import { SECTORS, STATIONS, INSTALLATION_TYPES, MONTH_NAMES, SHIFT_TYPES } from '../constants';
import { api } from '../services/storage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- AGENTS MODAL ---
export const AgentsModal = ({ isOpen, onClose, agents, sectors, onUpdate }: any) => {
  const [draggedAgent, setDraggedAgent] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newAgentName, setNewAgentName] = useState('');

  if (!isOpen) return null;

  const handleDragStart = (e: React.DragEvent, agentId: string) => {
    setDraggedAgent(agentId);
  };

  const handleDrop = async (e: React.DragEvent, sectorId: string | null) => {
    e.preventDefault();
    if (draggedAgent) {
      await api.updateAgentSector(draggedAgent, sectorId);
      onUpdate();
      setDraggedAgent(null);
    }
  };

  const handleAllowDrop = (e: React.DragEvent) => e.preventDefault();

  const handleAddAgent = async () => {
    if (newAgentName.trim()) {
      await api.createAgent(newAgentName);
      setNewAgentName('');
      setIsAdding(false);
      onUpdate();
    }
  };

  const handleDeleteAgent = async (agentId: string) => {
    if(confirm('¿Eliminar agente permanentemente?')) {
        await api.deleteAgent(agentId);
        onUpdate();
    }
  };

  const getAgentsBySector = (sectorId: string | null) => agents.filter((a: Agent) => a.assignedSectorId === sectorId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-lg w-[95vw] h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="bg-[#006338] p-4 flex justify-between items-center text-white">
          <h2 className="text-xl font-bold">Gestión de Agentes</h2>
          <button onClick={onClose}><X /></button>
        </div>
        
        <div className="flex-1 flex overflow-x-auto p-4 gap-4 bg-gray-50">
          {/* Unassigned Column */}
          <div 
            className="min-w-[200px] w-1/6 bg-gray-200 rounded-lg p-3 flex flex-col"
            onDrop={(e) => handleDrop(e, null)}
            onDragOver={handleAllowDrop}
          >
            <h3 className="font-bold text-gray-700 mb-2 text-center">Sin Asignar</h3>
            {!isAdding ? (
              <button onClick={() => setIsAdding(true)} className="bg-[#006338] text-white p-2 rounded w-full mb-4 text-sm hover:bg-green-800 transition">
                + Nuevo Agente
              </button>
            ) : (
              <div className="mb-4 bg-white p-2 rounded shadow">
                <input 
                  autoFocus
                  className="w-full border p-1 mb-2 text-sm uppercase" 
                  placeholder="NOMBRE"
                  value={newAgentName}
                  onChange={(e) => setNewAgentName(e.target.value.toUpperCase())}
                />
                <div className="flex gap-2">
                  <button onClick={handleAddAgent} className="flex-1 bg-green-600 text-white text-xs p-1 rounded">Aceptar</button>
                  <button onClick={() => setIsAdding(false)} className="flex-1 bg-red-500 text-white text-xs p-1 rounded">Cancelar</button>
                </div>
              </div>
            )}
            <div className="flex-1 overflow-y-auto space-y-2">
              {getAgentsBySector(null).map((agent: Agent) => (
                <div 
                  key={agent.id} 
                  draggable 
                  onDragStart={(e) => handleDragStart(e, agent.id)}
                  className="bg-white p-3 rounded shadow cursor-move hover:shadow-md transition text-center font-medium text-gray-800 border-l-4 border-gray-400 relative group"
                >
                  {agent.name}
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteAgent(agent.id); }}
                    className="absolute top-1 right-1 text-red-500 hover:bg-red-100 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Eliminar agente"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Sectors Columns */}
          {sectors.map((sector: Sector) => (
            <div 
              key={sector.id}
              className="min-w-[200px] w-1/6 bg-green-50 rounded-lg p-3 flex flex-col border border-green-100"
              onDrop={(e) => handleDrop(e, sector.id)}
              onDragOver={handleAllowDrop}
            >
              <h3 className="font-bold text-[#006338] mb-4 text-center text-sm">{sector.name}</h3>
              <div className="flex-1 overflow-y-auto space-y-2">
                {getAgentsBySector(sector.id).map((agent: Agent) => (
                  <div 
                    key={agent.id} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, agent.id)}
                    className="bg-white p-3 rounded shadow cursor-move hover:shadow-md transition text-center font-medium text-gray-800 border-l-4 border-[#006338] relative group"
                  >
                    {agent.name}
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteAgent(agent.id); }}
                        className="absolute top-1 right-1 text-red-500 hover:bg-red-100 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Eliminar agente"
                    >
                        <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t flex justify-end gap-4 bg-white">
            <button onClick={onClose} className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Cerrar</button>
        </div>
      </div>
    </div>
  );
};

// --- USER MANAGEMENT MODAL ---
export const UserManagementModal = ({ isOpen, onClose, currentUserRole }: any) => {
  const [users, setUsers] = useState<UserType[]>([]);

  useEffect(() => {
    if (isOpen) {
      api.getUsers().then(setUsers);
    }
  }, [isOpen]);

  const handleDelete = async (id: string) => {
    if(confirm('¿Eliminar usuario?')) {
        await api.deleteUser(id);
        setUsers(await api.getUsers());
    }
  };

  const handleRoleChange = async (id: string, newRole: UserRole) => {
    await api.updateUserRole(id, newRole);
    setUsers(await api.getUsers());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
       <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
          <div className="bg-[#006338] p-4 flex justify-between items-center text-white rounded-t-lg">
            <h2 className="text-xl font-bold">Gestión de Usuarios</h2>
            <button onClick={onClose}><X /></button>
          </div>
          <div className="p-6 overflow-y-auto">
             <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="border-b-2 border-green-700">
                        <th className="p-3 text-[#006338]">Nombre</th>
                        <th className="p-3 text-[#006338]">Matrícula</th>
                        <th className="p-3 text-[#006338]">Rol</th>
                        <th className="p-3 text-[#006338] text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(u => (
                        <tr key={u.id} className="border-b hover:bg-gray-50">
                            <td className="p-3 font-medium">{u.fullName}</td>
                            <td className="p-3 text-gray-600">{u.matricula}</td>
                            <td className="p-3">
                                <select 
                                    disabled={currentUserRole === UserRole.AGENT || u.matricula === 'srchicano'}
                                    value={u.role} 
                                    onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                                    className="border rounded p-1 bg-white"
                                >
                                    <option value={UserRole.AGENT}>Agente</option>
                                    <option value={UserRole.SUPERVISOR}>Supervisor</option>
                                    <option value={UserRole.ADMIN}>Admin</option>
                                </select>
                            </td>
                            <td className="p-3 text-right">
                                {u.matricula !== 'srchicano' && (
                                    <button onClick={() => handleDelete(u.id)} className="text-red-500 hover:text-red-700 p-2"><Trash2 size={18} /></button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

// --- NOTIFICATIONS MODAL ---
export const NotificationsModal = ({ isOpen, onClose }: any) => {
    const [requests, setRequests] = useState<UserType[]>([]);

    useEffect(() => {
        if(isOpen) {
            api.getPendingUsers().then(setRequests);
        }
    }, [isOpen]);

    const handleAction = async (id: string, approved: boolean) => {
        await api.approveUser(id, approved);
        setRequests(await api.getPendingUsers());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed top-16 right-4 z-50 w-96 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-[#006338] p-3 flex justify-between items-center text-white">
                <h3 className="font-bold">Notificaciones</h3>
                <button onClick={onClose}><X size={18} /></button>
            </div>
            <div className="max-h-96 overflow-y-auto">
                {requests.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">No hay solicitudes pendientes.</div>
                ) : (
                    requests.map(req => (
                        <div key={req.id} className="p-4 border-b flex flex-col gap-2">
                            <div>
                                <p className="font-bold text-sm">{req.fullName}</p>
                                <p className="text-xs text-gray-500">{req.matricula} - {req.role}</p>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => handleAction(req.id, true)} className="flex-1 bg-green-600 text-white text-xs py-1 rounded hover:bg-green-700">Aceptar</button>
                                <button onClick={() => handleAction(req.id, false)} className="flex-1 bg-red-500 text-white text-xs py-1 rounded hover:bg-red-600">Rechazar</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

// --- REPORTS MODAL ---
export const ReportsModal = ({ isOpen, onClose }: any) => {
    const [type, setType] = useState('Diario');
    const [date, setDate] = useState('');
    const [turn, setTurn] = useState('Mañana');
    const [month, setMonth] = useState(new Date().getMonth() + 1);

    const generatePDF = async () => {
        const doc = new jsPDF();
        
        doc.setFillColor(0, 99, 56); // #006338
        doc.rect(0, 0, 210, 20, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(16);
        doc.text("Sigma-Sevilla - Informe", 10, 14);

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        
        if (type === 'Diario') {
            doc.text(`Informe de Mantenimiento Diario - Fecha: ${date} Turno: ${turn}`, 10, 30);
            const data = await api.getDailyMaintenance(date, turn);
            const rows = data.map((d: any) => [d.elementName, d.stationId, d.agents.join(', ')]);
            autoTable(doc, {
                startY: 40,
                head: [['Elemento', 'Estación', 'Agentes']],
                body: rows,
            });
            if (rows.length === 0) {
                 doc.text("No se encontraron registros para esta fecha y turno.", 10, 50);
            }
        } else if (type === 'Mensual') {
             doc.text(`Informe de Mantenimiento Mensual - Mes: ${MONTH_NAMES[month-1]}`, 10, 30);
             const data = await api.getMonthlyMaintenance(Number(month), new Date().getFullYear());
             const rows = data.map((d: any) => [d.date, d.elementName, d.stationId]);
             autoTable(doc, {
                 startY: 40,
                 head: [['Fecha', 'Elemento', 'Estación']],
                 body: rows,
             });
        } else if (type === 'Averias') {
             doc.text(`Informe de Averías Diario - Fecha: ${date}`, 10, 30);
             const rows = [['Sin datos', 'Sin datos', 'Sin datos']];
             autoTable(doc, {
                 startY: 40,
                 head: [['Descripción', 'Causa', 'Reparación']],
                 body: rows,
             });
        }

        doc.save(`Informe_${type}_${date || month}.pdf`);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <h3 className="text-xl font-bold text-[#006338] mb-4">Generador de Informes</h3>
                
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Tipo de informe</label>
                        <select className="w-full border p-2 rounded" value={type} onChange={e => setType(e.target.value)}>
                            <option value="Diario">Informe de Mantenimiento Diario</option>
                            <option value="Mensual">Informe de Mantenimiento Mensual</option>
                            <option value="Averias">Informe de Averías Diario</option>
                        </select>
                    </div>

                    {type !== 'Mensual' ? (
                        <div className="flex gap-2">
                             <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Fecha</label>
                                <input type="date" className="w-full border p-2 rounded" value={date} onChange={e => setDate(e.target.value)} />
                             </div>
                             <div className="flex-1">
                                <label className="block text-sm font-medium mb-1">Turno</label>
                                <select className="w-full border p-2 rounded" value={turn} onChange={e => setTurn(e.target.value)}>
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                    <option value="Noche">Noche</option>
                                </select>
                             </div>
                        </div>
                    ) : (
                        <div>
                             <label className="block text-sm font-medium mb-1">Mes</label>
                             <select 
                                className="w-full border p-2 rounded" 
                                value={month} 
                                onChange={e => setMonth(Number(e.target.value))}
                            >
                                {MONTH_NAMES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                            </select>
                        </div>
                    )}
                    
                    <div className="flex gap-2 pt-4">
                         <button onClick={generatePDF} className="flex-1 bg-red-600 text-white py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2"><Download size={16}/> Descargar PDF</button>
                         <button onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- DASHBOARD MODAL ---
export const DashboardModal = ({ isOpen, onClose }: any) => {
    const [activeTab, setActiveTab] = useState('mensual');
    const [listData, setListData] = useState<MonthlyList | null>(null);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [isEditingList, setIsEditingList] = useState(false);
    
    // For editing list
    const [editSector, setEditSector] = useState(SECTORS[0].id);
    const [editStation, setEditStation] = useState(STATIONS.filter(s => s.sectorId === SECTORS[0].id)[0].id);
    const [editType, setEditType] = useState<string>(''); // Filter by Type
    const [availableElements, setAvailableElements] = useState<any[]>([]);
    
    // Staging state for list editing (before saving)
    const [stagedItems, setStagedItems] = useState<any[]>([]);

    // Semester Data
    const [semesterStats, setSemesterStats] = useState<any[]>([]);

    useEffect(() => {
        if(isOpen) {
            if (activeTab === 'mensual') loadList();
            if (activeTab === 'semestral') loadSemesterStats();
        }
    }, [isOpen, activeTab, selectedMonth]);

    useEffect(() => {
        if (isEditingList) {
             const loadElements = async () => {
                 let allEls = [];
                 if (editType) {
                    allEls = await api.getElements(editStation, editType as InstallationType);
                 } else {
                    for(const t of INSTALLATION_TYPES) {
                        const els = await api.getElements(editStation, t);
                        allEls.push(...els);
                    }
                 }
                 setAvailableElements(allEls);
             };
             loadElements();
        }
    }, [isEditingList, editStation, editType]);

    const loadList = async () => {
        const list = await api.getMonthlyList(selectedMonth, new Date().getFullYear());
        setListData(list);
        setStagedItems(list ? [...list.items] : []);
    };
    
    const loadSemesterStats = async () => {
        const currentSem = new Date().getMonth() >= 6 ? 2 : 1;
        const stats = await api.getSemesterStats(currentSem, new Date().getFullYear());
        
        // Transform to array for Recharts
        const data = INSTALLATION_TYPES.map(type => {
            const s = stats[type] || { total: 0, completed: 0 };
            return {
                name: type,
                total: s.total,
                completed: s.completed,
                percent: s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0
            };
        });
        setSemesterStats(data);
    };

    const toggleItemInStaging = (element: any, isChecked: boolean) => {
        if (isChecked) {
            if(!stagedItems.find(i => i.elementId === element.id)) {
                setStagedItems([...stagedItems, {
                    elementId: element.id,
                    elementName: element.name,
                    installationType: element.installationType,
                    stationName: STATIONS.find(s => s.id === element.stationId)?.name || '',
                    completed: element.isCompleted
                }]);
            }
        } else {
            setStagedItems(stagedItems.filter(i => i.elementId !== element.id));
        }
    };

    const saveListChanges = async () => {
        const newList: MonthlyList = {
            id: listData?.id || Date.now().toString(),
            month: selectedMonth,
            year: new Date().getFullYear(),
            items: stagedItems
        };
        await api.saveMonthlyList(newList);
        setListData(newList);
        setIsEditingList(false);
    };

    const isElementInStaging = (id: string) => stagedItems.some(i => i.elementId === id);

    const progress = listData ? (listData.items.filter(i => i.completed).length / (listData.items.length || 1)) * 100 : 0;

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg w-[90vw] h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
                {isEditingList && (
                    <div className="absolute inset-0 bg-white z-20 flex flex-col">
                        <div className="bg-[#006338] p-4 text-white flex justify-between">
                            <h3 className="font-bold">Editor de Lista Mensual</h3>
                            <button onClick={() => setIsEditingList(false)} className="bg-red-500 px-3 rounded text-sm hover:bg-red-600">Cancelar</button>
                        </div>
                        <div className="p-4 border-b flex flex-wrap gap-4 bg-gray-50 items-center">
                            <select className="border p-2 rounded" value={editSector} onChange={e => {setEditSector(e.target.value); setEditStation(STATIONS.filter(s => s.sectorId === e.target.value)[0].id)}}>
                                {SECTORS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <select className="border p-2 rounded" value={editStation} onChange={e => setEditStation(e.target.value)}>
                                {STATIONS.filter(s => s.sectorId === editSector).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <select className="border p-2 rounded" value={editType} onChange={e => setEditType(e.target.value)}>
                                <option value="">Todos los tipos</option>
                                {INSTALLATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4">
                            {availableElements.length === 0 ? <p className="text-gray-500 text-center mt-10">No hay elementos disponibles con los filtros actuales.</p> : (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {availableElements.map(el => (
                                        <div key={el.id} className="border p-3 rounded flex items-center gap-2 hover:bg-green-50 transition cursor-pointer" onClick={() => toggleItemInStaging(el, !isElementInStaging(el.id))}>
                                            <input 
                                                type="checkbox" 
                                                checked={isElementInStaging(el.id)} 
                                                onChange={() => {}} // Handled by div click
                                                className="w-5 h-5 text-green-600 pointer-events-none"
                                            />
                                            <div>
                                                <p className="font-bold text-sm">{el.name}</p>
                                                <p className="text-xs text-gray-500">{el.installationType}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t bg-gray-100 flex justify-end">
                            <button onClick={saveListChanges} className="bg-green-600 text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-green-700">
                                <Save size={18} /> Guardar Cambios
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-[#006338] p-4 flex justify-between items-center text-white">
                    <div className="flex gap-4">
                        <button onClick={() => setActiveTab('mensual')} className={`font-bold pb-1 ${activeTab === 'mensual' ? 'border-b-2 border-white' : 'opacity-70'}`}>Mantenimiento Mensual</button>
                        <button onClick={() => setActiveTab('semestral')} className={`font-bold pb-1 ${activeTab === 'semestral' ? 'border-b-2 border-white' : 'opacity-70'}`}>Dashboard Semestral</button>
                    </div>
                    <button onClick={onClose}><X /></button>
                </div>

                <div className="flex-1 overflow-auto bg-gray-50 p-6">
                    {activeTab === 'mensual' && (
                        <div>
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex gap-4 items-center">
                                    <select value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))} className="border p-2 rounded shadow-sm">
                                        {MONTH_NAMES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                                    </select>
                                    <button onClick={() => setIsEditingList(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 shadow-sm transition">Editar Lista</button>
                                </div>
                                <div className="flex items-center gap-4 bg-white p-2 rounded shadow-sm px-4">
                                    <div className="w-64 h-4 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 transition-all duration-500" style={{width: `${progress}%`}}></div>
                                    </div>
                                    <span className="font-bold text-sm">{progress === 100 ? 'Finalizado' : 'En Curso'} ({Math.round(progress)}%)</span>
                                </div>
                            </div>
                            
                            <table className="w-full bg-white shadow rounded-lg overflow-hidden">
                                <thead className="bg-gray-100 text-left text-gray-600 uppercase text-xs">
                                    <tr>
                                        <th className="p-3">Estación</th>
                                        <th className="p-3">Instalación</th>
                                        <th className="p-3">Elemento</th>
                                        <th className="p-3">Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {listData?.items.map((item, idx) => (
                                        <tr key={idx} className={`border-b transition-colors ${item.completed ? 'bg-green-100' : 'bg-white hover:bg-gray-50'}`}>
                                            <td className="p-3">{item.stationName}</td>
                                            <td className="p-3 text-sm text-gray-600">{item.installationType}</td>
                                            <td className="p-3 font-medium">{item.elementName}</td>
                                            <td className="p-3">
                                                {item.completed ? (
                                                    <span className="inline-flex items-center gap-1 text-green-700 font-bold text-sm"><Check size={14}/> Completado</span>
                                                ) : (
                                                    <span className="text-gray-500 text-sm">Pendiente</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!listData || listData.items.length === 0) && (
                                        <tr><td colSpan={4} className="p-12 text-center text-gray-500">Lista vacía. Pulsa "Editar Lista" para añadir elementos.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {activeTab === 'semestral' && (
                        <div className="h-full flex flex-col">
                             <h3 className="text-xl font-bold mb-6 text-center text-[#006338]">Progreso Semestral (Elementos en Lista)</h3>
                             <div className="flex-1 w-full min-h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={semesterStats} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                                        <XAxis type="number" domain={[0, 100]} />
                                        <YAxis type="category" dataKey="name" width={150} />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="percent" fill="#006338" name="% Completado" radius={[0, 4, 4, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                             </div>
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mt-8">
                                 {semesterStats.map(d => (
                                     <div key={d.name} className="bg-white p-4 rounded-xl shadow-md border-t-4 border-[#006338] text-center">
                                         <p className="font-bold text-gray-700 text-sm mb-1">{d.name}</p>
                                         <p className="text-3xl font-bold text-[#006338]">{d.completed}/{d.total}</p>
                                         <p className="text-sm text-gray-500">{d.percent}% Completado</p>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    )}
                </div>
            </div>
         </div>
    );
};

// --- ROSTER MODAL ---
export const RosterModal = ({ isOpen, onClose, sectorId, agents }: any) => {
    const [activeTab, setActiveTab] = useState('grafico');
    const [month, setMonth] = useState(new Date().getMonth() + 1);
    const [year, setYear] = useState(new Date().getFullYear());
    const [isEditing, setIsEditing] = useState(false);
    const [selectedShift, setSelectedShift] = useState('M');
    
    const [rosterData, setRosterData] = useState<Roster | null>(null);
    const [localData, setLocalData] = useState<Record<string, Record<string, string>>>({}); // AgentId -> Day -> Code
    
    // Stats
    const [monthlyStats, setMonthlyStats] = useState<Record<string, Record<string, number>>>({});
    const [yearlyStats, setYearlyStats] = useState<Record<string, Record<string, number>>>({});

    useEffect(() => {
        if(isOpen && sectorId) {
            loadRoster();
            if(activeTab === 'datos') loadStats();
        }
    }, [isOpen, sectorId, month, year, activeTab]);

    const loadRoster = async () => {
        const roster = await api.getRoster(sectorId, month, year);
        setRosterData(roster);
        setLocalData(roster?.data || {});
    };

    const loadStats = async () => {
        // Calculate Monthly from localData or loaded data
        const mStats: any = {};
        agents.forEach((a: Agent) => {
             mStats[a.id] = {};
             const agentData = (isEditing ? localData : rosterData?.data)?.[a.id] || {};
             Object.values(agentData).forEach((code: any) => {
                 if(code) mStats[a.id][code] = (mStats[a.id][code] || 0) + 1;
             });
        });
        setMonthlyStats(mStats);

        // Fetch Yearly
        const yStats = await api.getRosterStats(sectorId, year);
        setYearlyStats(yStats);
    };

    const handleCellClick = (agentId: string, day: number) => {
        if (!isEditing) return;
        setLocalData(prev => ({
            ...prev,
            [agentId]: {
                ...(prev[agentId] || {}),
                [day]: selectedShift
            }
        }));
    };

    const handleSave = async () => {
        await api.saveRoster({
            id: rosterData?.id || Date.now().toString(),
            sectorId,
            month,
            year,
            data: localData
        });
        setIsEditing(false);
        loadRoster();
    };

    const handleCancel = () => {
        setLocalData(rosterData?.data || {});
        setIsEditing(false);
    };

    const getDaysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate();
    const isWeekend = (d: number, m: number, y: number) => {
        const date = new Date(y, m - 1, d);
        return date.getDay() === 0 || date.getDay() === 6;
    };

    if (!isOpen) return null;

    const days = Array.from({ length: getDaysInMonth(month, year) }, (_, i) => i + 1);

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg w-[95vw] h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="bg-[#006338] p-4 flex justify-between items-center text-white">
                     <div className="flex gap-4">
                        <button onClick={() => setActiveTab('grafico')} className={`font-bold pb-1 ${activeTab === 'grafico' ? 'border-b-2 border-white' : 'opacity-70'}`}>Gráfico Mensual</button>
                        <button onClick={() => setActiveTab('datos')} className={`font-bold pb-1 ${activeTab === 'datos' ? 'border-b-2 border-white' : 'opacity-70'}`}>Datos Gráfico</button>
                    </div>
                    <button onClick={onClose}><X /></button>
                </div>

                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div className="flex items-center gap-4">
                        <select className="border p-2 rounded" value={month} onChange={e => setMonth(Number(e.target.value))}>
                            {MONTH_NAMES.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
                        </select>
                        <span className="font-bold text-gray-700">{year}</span>
                    </div>
                    {activeTab === 'grafico' && (
                        isEditing ? (
                            <div className="flex items-center gap-4">
                                <select className="border p-2 rounded bg-white shadow-sm" value={selectedShift} onChange={e => setSelectedShift(e.target.value)}>
                                    {Object.entries(SHIFT_TYPES).map(([code, config]) => (
                                        <option key={code} value={code}>{config.label} ({code})</option>
                                    ))}
                                </select>
                                <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700">Guardar</button>
                                <button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-600">Cancelar</button>
                            </div>
                        ) : (
                            <button onClick={() => setIsEditing(true)} className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700">Editar</button>
                        )
                    )}
                </div>

                <div className="flex-1 overflow-auto p-4">
                    {activeTab === 'grafico' && (
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr>
                                    <th className="border p-2 bg-gray-100 sticky left-0 z-10 w-40">Agente</th>
                                    {days.map(d => (
                                        <th key={d} className={`border p-1 w-8 text-center ${isWeekend(d, month, year) ? 'bg-gray-200' : 'bg-white'}`}>{d}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {agents.map((agent: Agent) => (
                                    <tr key={agent.id}>
                                        <td className="border p-2 font-bold sticky left-0 bg-white z-10">{agent.name}</td>
                                        {days.map(d => {
                                            const code = localData[agent.id]?.[d] || '';
                                            const config = SHIFT_TYPES[code] || SHIFT_TYPES[''];
                                            const isWe = isWeekend(d, month, year);
                                            return (
                                                <td 
                                                    key={d} 
                                                    onClick={() => handleCellClick(agent.id, d)}
                                                    className={`border p-1 text-center font-bold cursor-pointer transition-colors border-gray-300
                                                        ${config.color} 
                                                        ${!code && isWe ? 'bg-gray-200' : ''}
                                                        ${isEditing ? 'hover:ring-2 hover:ring-inset hover:ring-blue-500' : ''}
                                                    `}
                                                >
                                                    {code}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {activeTab === 'datos' && (
                        <div className="grid grid-cols-2 gap-8 h-full">
                            <div className="bg-white rounded shadow p-4 overflow-auto">
                                <h3 className="font-bold text-center mb-4 text-[#006338]">Datos Mensuales ({MONTH_NAMES[month-1]})</h3>
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border p-2 bg-gray-100">Agente</th>
                                            {Object.keys(SHIFT_TYPES).filter(k => k).map(k => <th key={k} className="border p-1">{k}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agents.map((a: Agent) => (
                                            <tr key={a.id}>
                                                <td className="border p-2 font-medium">{a.name}</td>
                                                {Object.keys(SHIFT_TYPES).filter(k => k).map(k => (
                                                    <td key={k} className="border p-1 text-center bg-gray-50">{monthlyStats[a.id]?.[k] || 0}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="bg-white rounded shadow p-4 overflow-auto">
                                <h3 className="font-bold text-center mb-4 text-[#006338]">Datos Anuales ({year})</h3>
                                <table className="w-full text-xs border-collapse">
                                    <thead>
                                        <tr>
                                            <th className="border p-2 bg-gray-100">Agente</th>
                                            {Object.keys(SHIFT_TYPES).filter(k => k).map(k => <th key={k} className="border p-1">{k}</th>)}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {agents.map((a: Agent) => (
                                            <tr key={a.id}>
                                                <td className="border p-2 font-medium">{a.name}</td>
                                                {Object.keys(SHIFT_TYPES).filter(k => k).map(k => (
                                                    <td key={k} className="border p-1 text-center bg-gray-50">{yearlyStats[a.id]?.[k] || 0}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- ELEMENT FORM MODAL (ADD / MAINTENANCE) ---
const FormField = ({ label, value, onChange, placeholder = '' }: any) => (
    <div className="mb-2">
        <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
        <input 
            className="w-full border rounded p-2 text-sm focus:ring-1 focus:ring-green-600 focus:outline-none"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
        />
    </div>
);

// Helper for checkboxes in form
const FormCheckbox = ({ label, checked, onChange }: any) => (
    <div className="mb-2 flex items-center justify-between">
        <label className="block text-xs font-bold text-gray-700">{label}</label>
        <input 
            type="checkbox"
            className="w-5 h-5 text-green-600 rounded focus:ring-green-600"
            checked={!!checked}
            onChange={(e) => onChange(e.target.checked)}
        />
    </div>
);

export const ElementFormModal = ({ isOpen, onClose, type, stationId, existingElement, isMaintenance = false, onSubmit }: any) => {
    const [name, setName] = useState('');
    const [data, setData] = useState<any>({});
    const [turn, setTurn] = useState('Mañana'); // Added Turn State
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Added Date State for Maintenance

    useEffect(() => {
        if(isOpen) {
            if (existingElement) {
                setName(existingElement.name);
                setData(existingElement.data || {});
            } else {
                setName('');
                setData({});
            }
            setTurn('Mañana'); // Reset default
            setDate(new Date().toISOString().split('T')[0]); // Reset date to today
        }
    }, [isOpen, existingElement]);

    const handleDataChange = (path: string, value: any) => {
        const keys = path.split('.');
        const newData = { ...data };
        let current: any = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) current[keys[i]] = {};
            current = current[keys[i]];
        }
        current[keys[keys.length - 1]] = value;
        setData(newData);
    };
    
    // Helper to get nested value safely
    const getValue = (path: string) => {
        const keys = path.split('.');
        let val = data;
        for (const k of keys) val = val?.[k];
        return val;
    };

    const handleSave = async () => {
        if (!name) return alert('El nombre es obligatorio');
        
        if (isMaintenance && existingElement) {
            await api.addMaintenance({
                id: Date.now().toString(),
                elementId: existingElement.id,
                date: date, // Use selected date instead of current date
                turn: turn,
                agents: data.lastAgents ? [data.lastAgents] : [],
                dataSnapshot: data
            });
            await api.updateElement({ ...existingElement, data, lastMaintenanceDate: date });
        } else {
            await api.createElement({
                id: Date.now().toString(),
                stationId: stationId,
                installationType: type,
                name: name.toUpperCase(),
                isCompleted: false,
                data: data
            });
        }
        onSubmit();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                <div className="bg-[#006338] p-4 text-white flex justify-between">
                    <h3 className="font-bold">{isMaintenance ? 'Informe de Mantenimiento' : 'Añadir Nuevo Elemento'} - {type}</h3>
                    <button onClick={onClose}><X /></button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-4">
                        <label className="block font-bold text-gray-700">Nombre Elemento</label>
                        <input 
                            className="w-full border p-2 rounded bg-gray-50 focus:ring-1 focus:ring-green-600 focus:outline-none"
                            value={name}
                            onChange={(e) => setName(e.target.value.toUpperCase())}
                            disabled={isMaintenance} 
                        />
                    </div>
                    
                    {/* PK Field - New */}
                    <div className="mb-4">
                        <label className="block font-bold text-gray-700">Punto Kilométrico (PK)</label>
                        <input 
                            className="w-full border p-2 rounded bg-gray-50 focus:ring-1 focus:ring-green-600 focus:outline-none"
                            value={getValue('pk')}
                            onChange={(e) => handleDataChange('pk', e.target.value)}
                            placeholder="Ej: 10.500"
                        />
                    </div>

                    {/* Date and Turno Selector only for Maintenance */}
                    {isMaintenance && (
                        <div className="flex gap-4 mb-4">
                            <div className="flex-1">
                                <label className="block font-bold text-gray-700 mb-1">Fecha</label>
                                <input 
                                    type="date"
                                    className="w-full border p-2 rounded focus:ring-1 focus:ring-green-600 focus:outline-none"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block font-bold text-gray-700 mb-1">Turno</label>
                                <select 
                                    className="w-full border p-2 rounded focus:ring-1 focus:ring-green-600 focus:outline-none"
                                    value={turn}
                                    onChange={(e) => setTurn(e.target.value)}
                                >
                                    <option value="Mañana">Mañana</option>
                                    <option value="Tarde">Tarde</option>
                                    <option value="Noche">Noche</option>
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="mb-4">
                         <FormField label="Agentes (Nombre, Apellidos)" value={getValue('lastAgents')} onChange={(v: string) => handleDataChange('lastAgents', v)} placeholder="Ej: Chicano, Pérez" />
                         {type === InstallationType.CIRCUITOS && <FormField label="Frecuencia" value={getValue('frecuencia')} onChange={(v: string) => handleDataChange('frecuencia', v)} placeholder="Ej: 13.5 kHz" />}
                         {type === InstallationType.PN && <FormField label="Contrata" value={getValue('contrata')} onChange={(v: string) => handleDataChange('contrata', v)} placeholder="Ej: Simpe SA" />}
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-bold text-gray-600 mb-4">Parámetros Técnicos</h4>
                        
                        {type === InstallationType.CIRCUITOS && (
                            <div className="grid grid-cols-2 gap-4">
                                <div><h5 className="font-bold text-orange-600 text-sm">Filtro</h5><FormField label="3/4" value={getValue('filtro')} onChange={(v: string) => handleDataChange('filtro', v)} /></div>
                                <div><h5 className="font-bold text-blue-600 text-sm">Receptores</h5>
                                    <FormField label="I1/2 ⊕1" value={getValue('receptores.i1')} onChange={(v: string) => handleDataChange('receptores.i1', v)} />
                                    <FormField label="I1/2 ⊕2" value={getValue('receptores.i2')} onChange={(v: string) => handleDataChange('receptores.i2', v)} />
                                    <FormField label="I1/2 ⊕3" value={getValue('receptores.i3')} onChange={(v: string) => handleDataChange('receptores.i3', v)} />
                                </div>
                                <div><h5 className="font-bold text-green-600 text-sm">Relés</h5>
                                    <FormField label="I5/II8 ⊕1" value={getValue('reles.i1')} onChange={(v: string) => handleDataChange('reles.i1', v)} />
                                    <FormField label="I5/II8 ⊕2" value={getValue('reles.i2')} onChange={(v: string) => handleDataChange('reles.i2', v)} />
                                    <FormField label="I5/II8 ⊕3" value={getValue('reles.i3')} onChange={(v: string) => handleDataChange('reles.i3', v)} />
                                </div>
                                <div><h5 className="font-bold text-red-600 text-sm">Colaterales</h5>
                                    <FormField label="Col 1" value={getValue('colaterales.c1')} onChange={(v: string) => handleDataChange('colaterales.c1', v)} />
                                    <FormField label="Col 2" value={getValue('colaterales.c2')} onChange={(v: string) => handleDataChange('colaterales.c2', v)} />
                                    <FormField label="Col 3" value={getValue('colaterales.c3')} onChange={(v: string) => handleDataChange('colaterales.c3', v)} />
                                    <FormField label="Col Up" value={getValue('colaterales.c4')} onChange={(v: string) => handleDataChange('colaterales.c4', v)} />
                                </div>
                                <div><h5 className="font-bold text-purple-600 text-sm">Shunt</h5>
                                    <FormField label="ASU" value={getValue('shunt.asu')} onChange={(v: string) => handleDataChange('shunt.asu', v)} />
                                    <FormField label="Parásitas" value={getValue('shunt.parasitas')} onChange={(v: string) => handleDataChange('shunt.parasitas', v)} />
                                </div>
                            </div>
                        )}

                        {type === InstallationType.MOTORES && (
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-green-50 p-3 rounded">
                                    <h5 className="font-bold text-green-800 text-sm mb-2">Mov. NORMAL</h5>
                                    <FormField label="Tiempo + CG" value={getValue('normal.tcg')} onChange={(v: string) => handleDataChange('normal.tcg', v)} />
                                    <FormField label="Tiempo + SG" value={getValue('normal.tsg')} onChange={(v: string) => handleDataChange('normal.tsg', v)} />
                                    <FormField label="Intensidad + CG" value={getValue('normal.icg')} onChange={(v: string) => handleDataChange('normal.icg', v)} />
                                    <FormField label="Intensidad + SG" value={getValue('normal.isg')} onChange={(v: string) => handleDataChange('normal.isg', v)} />
                                    <FormField label="Tensión +" value={getValue('normal.v')} onChange={(v: string) => handleDataChange('normal.v', v)} />
                                </div>
                                <div className="bg-red-50 p-3 rounded">
                                    <h5 className="font-bold text-red-800 text-sm mb-2">Mov. INVERTIDO</h5>
                                    <FormField label="Tiempo - CG" value={getValue('invertido.tcg')} onChange={(v: string) => handleDataChange('invertido.tcg', v)} />
                                    <FormField label="Tiempo - SG" value={getValue('invertido.tsg')} onChange={(v: string) => handleDataChange('invertido.tsg', v)} />
                                    <FormField label="Intensidad - CG" value={getValue('invertido.icg')} onChange={(v: string) => handleDataChange('invertido.icg', v)} />
                                    <FormField label="Intensidad - SG" value={getValue('invertido.isg')} onChange={(v: string) => handleDataChange('invertido.isg', v)} />
                                    <FormField label="Tensión -" value={getValue('invertido.v')} onChange={(v: string) => handleDataChange('invertido.v', v)} />
                                </div>
                            </div>
                        )}
                        
                        {type === InstallationType.SENALES && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* FOCOS */}
                                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                                    <h5 className="font-bold text-blue-800 text-sm mb-2 bg-blue-200 p-1 rounded text-center">FOCOS</h5>
                                    <div className="mb-2">
                                        <label className="block text-xs font-bold text-blue-900 mb-1">TIPO</label>
                                        <select 
                                            value={getValue('focos.tipo')} 
                                            onChange={e => handleDataChange('focos.tipo', e.target.value)}
                                            className="w-full border rounded p-1 text-sm"
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="Modular">Modular</option>
                                            <option value="Ind. Normal">Ind. Normal</option>
                                            <option value="LED">LED</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-red-100 p-1 rounded">
                                            <h6 className="text-[10px] font-bold text-red-800">ROJO</h6>
                                            <FormField label="Ve" value={getValue('focos.rojo.ve')} onChange={(v: string) => handleDataChange('focos.rojo.ve', v)} />
                                            <FormField label="Vlamp" value={getValue('focos.rojo.vlamp')} onChange={(v: string) => handleDataChange('focos.rojo.vlamp', v)} />
                                        </div>
                                        <div className="bg-gray-200 p-1 rounded">
                                            <h6 className="text-[10px] font-bold text-gray-700">BLANCO</h6>
                                            <FormField label="Ve" value={getValue('focos.blanco.ve')} onChange={(v: string) => handleDataChange('focos.blanco.ve', v)} />
                                            <FormField label="Vlamp" value={getValue('focos.blanco.vlamp')} onChange={(v: string) => handleDataChange('focos.blanco.vlamp', v)} />
                                        </div>
                                        <div className="bg-green-100 p-1 rounded">
                                            <h6 className="text-[10px] font-bold text-green-800">VERDE</h6>
                                            <FormField label="Ve" value={getValue('focos.verde.ve')} onChange={(v: string) => handleDataChange('focos.verde.ve', v)} />
                                            <FormField label="Vlamp" value={getValue('focos.verde.vlamp')} onChange={(v: string) => handleDataChange('focos.verde.vlamp', v)} />
                                        </div>
                                        <div className="bg-yellow-100 p-1 rounded">
                                            <h6 className="text-[10px] font-bold text-yellow-800">AMARILLO</h6>
                                            <FormField label="Ve" value={getValue('focos.amarillo.ve')} onChange={(v: string) => handleDataChange('focos.amarillo.ve', v)} />
                                            <FormField label="Vlamp" value={getValue('focos.amarillo.vlamp')} onChange={(v: string) => handleDataChange('focos.amarillo.vlamp', v)} />
                                        </div>
                                    </div>
                                </div>

                                {/* UC */}
                                <div className="bg-green-50 p-3 rounded border border-green-800">
                                    <h5 className="font-bold text-white text-sm mb-2 bg-[#004d2c] p-1 rounded text-center">UNIDAD DE CONEXIÓN</h5>
                                    {/* UC Input is generic here, ElementCard has the dropdown for display/edit inline */}
                                    <div className="mb-2">
                                        <label className="block text-xs font-bold text-gray-700 mb-1">UC</label>
                                        <select 
                                            value={getValue('uc.uc')} 
                                            onChange={e => handleDataChange('uc.uc', e.target.value)}
                                            className="w-full border rounded p-1 text-sm"
                                        >
                                            <option value="">Seleccione...</option>
                                            <option value="UCS">UCS</option>
                                            <option value="UCD">UCD</option>
                                            <option value="UCT">UCT</option>
                                        </select>
                                    </div>
                                    <div className="mt-2 bg-green-100 p-2 rounded">
                                        <h6 className="text-xs font-bold text-green-900 mb-1">SALIDA VERDE</h6>
                                        <FormField label="TSB" value={getValue('uc.verde.tsb')} onChange={(v: string) => handleDataChange('uc.verde.tsb', v)} />
                                        <FormField label="CompAlt" value={getValue('uc.verde.compAlt')} onChange={(v: string) => handleDataChange('uc.verde.compAlt', v)} />
                                        <FormField label="Baliza" value={getValue('uc.verde.baliza')} onChange={(v: string) => handleDataChange('uc.verde.baliza', v)} />
                                        <FormCheckbox label="Reparto" checked={getValue('uc.verde.reparto')} onChange={(v: boolean) => handleDataChange('uc.verde.reparto', v)} />
                                    </div>
                                    <div className="mt-2 bg-green-100 p-2 rounded">
                                        <h6 className="text-xs font-bold text-green-900 mb-1">SALIDA AMARILLO</h6>
                                        <FormField label="TSB" value={getValue('uc.amarillo.tsb')} onChange={(v: string) => handleDataChange('uc.amarillo.tsb', v)} />
                                        <FormField label="CompAlt" value={getValue('uc.amarillo.compAlt')} onChange={(v: string) => handleDataChange('uc.amarillo.compAlt', v)} />
                                        <FormField label="Baliza" value={getValue('uc.amarillo.baliza')} onChange={(v: string) => handleDataChange('uc.amarillo.baliza', v)} />
                                        <FormCheckbox label="Reparto" checked={getValue('uc.amarillo.reparto')} onChange={(v: boolean) => handleDataChange('uc.amarillo.reparto', v)} />
                                    </div>
                                </div>

                                {/* BALIZA PIE SEÑAL */}
                                <div className="bg-orange-50 p-3 rounded border border-orange-700">
                                    <h5 className="font-bold text-white text-sm mb-2 bg-orange-700 p-1 rounded text-center">BALIZA PIE SEÑAL</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><h6 className="text-[10px] font-bold">L8</h6>
                                            <FormField label="Desv F" value={getValue('balizaPie.l8.desvF')} onChange={(v: string) => handleDataChange('balizaPie.l8.desvF', v)} />
                                            <FormField label="Desv %" value={getValue('balizaPie.l8.desvP')} onChange={(v: string) => handleDataChange('balizaPie.l8.desvP', v)} />
                                            <FormField label="Altura" value={getValue('balizaPie.l8.altura')} onChange={(v: string) => handleDataChange('balizaPie.l8.altura', v)} />
                                        </div>
                                        <div><h6 className="text-[10px] font-bold">L3</h6>
                                            <FormField label="Desv F" value={getValue('balizaPie.l3.desvF')} onChange={(v: string) => handleDataChange('balizaPie.l3.desvF', v)} />
                                            <FormField label="Desv %" value={getValue('balizaPie.l3.desvP')} onChange={(v: string) => handleDataChange('balizaPie.l3.desvP', v)} />
                                            <FormField label="Altura" value={getValue('balizaPie.l3.altura')} onChange={(v: string) => handleDataChange('balizaPie.l3.altura', v)} />
                                        </div>
                                        <div><h6 className="text-[10px] font-bold">L1</h6>
                                            <FormField label="Desv F" value={getValue('balizaPie.l1.desvF')} onChange={(v: string) => handleDataChange('balizaPie.l1.desvF', v)} />
                                            <FormField label="Desv %" value={getValue('balizaPie.l1.desvP')} onChange={(v: string) => handleDataChange('balizaPie.l1.desvP', v)} />
                                            <FormField label="Altura" value={getValue('balizaPie.l1.altura')} onChange={(v: string) => handleDataChange('balizaPie.l1.altura', v)} />
                                        </div>
                                        <div><h6 className="text-[10px] font-bold">Carril</h6>
                                            <FormField label="Dist" value={getValue('balizaPie.carril.dist')} onChange={(v: string) => handleDataChange('balizaPie.carril.dist', v)} />
                                            <FormField label="Altura" value={getValue('balizaPie.carril.altura')} onChange={(v: string) => handleDataChange('balizaPie.carril.altura', v)} />
                                        </div>
                                    </div>
                                </div>

                                {/* BALIZA PREVIA */}
                                <div className="bg-purple-50 p-3 rounded border border-purple-800">
                                    <h5 className="font-bold text-white text-sm mb-2 bg-purple-900 p-1 rounded text-center">BALIZA PREVIA</h5>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div><h6 className="text-[10px] font-bold">L7</h6>
                                            <FormField label="Desv F" value={getValue('balizaPrevia.l7.desvF')} onChange={(v: string) => handleDataChange('balizaPrevia.l7.desvF', v)} />
                                            <FormField label="Desv %" value={getValue('balizaPrevia.l7.desvP')} onChange={(v: string) => handleDataChange('balizaPrevia.l7.desvP', v)} />
                                            <FormField label="Altura" value={getValue('balizaPrevia.l7.altura')} onChange={(v: string) => handleDataChange('balizaPrevia.l7.altura', v)} />
                                        </div>
                                        <div><h6 className="text-[10px] font-bold">L3</h6>
                                            <FormField label="Desv F" value={getValue('balizaPrevia.l3.desvF')} onChange={(v: string) => handleDataChange('balizaPrevia.l3.desvF', v)} />
                                            <FormField label="Desv %" value={getValue('balizaPrevia.l3.desvP')} onChange={(v: string) => handleDataChange('balizaPrevia.l3.desvP', v)} />
                                            <FormField label="Altura" value={getValue('balizaPrevia.l3.altura')} onChange={(v: string) => handleDataChange('balizaPrevia.l3.altura', v)} />
                                        </div>
                                        <div><h6 className="text-[10px] font-bold">L1</h6>
                                            <FormField label="Desv F" value={getValue('balizaPrevia.l1.desvF')} onChange={(v: string) => handleDataChange('balizaPrevia.l1.desvF', v)} />
                                            <FormField label="Desv %" value={getValue('balizaPrevia.l1.desvP')} onChange={(v: string) => handleDataChange('balizaPrevia.l1.desvP', v)} />
                                            <FormField label="Altura" value={getValue('balizaPrevia.l1.altura')} onChange={(v: string) => handleDataChange('balizaPrevia.l1.altura', v)} />
                                        </div>
                                        <div><h6 className="text-[10px] font-bold">Carril</h6>
                                            <FormField label="Dist" value={getValue('balizaPrevia.carril.dist')} onChange={(v: string) => handleDataChange('balizaPrevia.carril.dist', v)} />
                                            <FormField label="Altura" value={getValue('balizaPrevia.carril.altura')} onChange={(v: string) => handleDataChange('balizaPrevia.carril.altura', v)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {![InstallationType.CIRCUITOS, InstallationType.MOTORES, InstallationType.SENALES].includes(type) && (
                            <p className="text-gray-500 italic text-sm">Formulario genérico. Añada datos adicionales en un futuro.</p>
                        )}
                    </div>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
                    <button onClick={handleSave} className="bg-[#006338] text-white px-6 py-2 rounded hover:bg-green-800">Guardar</button>
                    <button onClick={onClose} className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">Cancelar</button>
                </div>
            </div>
        </div>
    );
};

// --- FAULT FORM MODAL ---
export const FaultFormModal = ({ isOpen, onClose, element, onSubmit }: any) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [description, setDescription] = useState('');
    const [agents, setAgents] = useState('');
    const [times, setTimes] = useState({
        inicio: '', llegada: '', solAutTrabajos: '', concesion: '',
        enServicio: '', finTrabajos: '', salida: '', llegadaDest: ''
    });
    const [causes, setCauses] = useState('');
    const [repair, setRepair] = useState('');

    useEffect(() => {
        if(isOpen) {
            setDate(new Date().toISOString().split('T')[0]);
            setDescription('');
            setAgents('');
            setTimes({ inicio: '', llegada: '', solAutTrabajos: '', concesion: '', enServicio: '', finTrabajos: '', salida: '', llegadaDest: '' });
            setCauses('');
            setRepair('');
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (!element) return;
        
        const record: FaultRecord = {
            id: Date.now().toString(),
            elementId: element.id,
            date,
            stationName: STATIONS.find(s => s.id === element.stationId)?.name || '',
            agents: agents.split(',').map(a => a.trim()).filter(a => a),
            description,
            times,
            causes,
            repair
        };
        await api.addFault(record);
        onSubmit();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg w-[90vw] max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
                 <div className="bg-red-600 p-4 text-white flex justify-between">
                    <h3 className="font-bold">Nueva Avería - {element?.name}</h3>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-4">
                    <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-700">Fecha</label>
                            <input type="date" className="w-full border p-2 rounded" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                         <div className="flex-1">
                            <label className="block text-xs font-bold text-gray-700">Agentes (separados por coma)</label>
                            <input className="w-full border p-2 rounded" value={agents} onChange={e => setAgents(e.target.value)} placeholder="Ej: Chicano, Pérez" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700">Descripción</label>
                        <textarea className="w-full border p-2 rounded h-20" value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded border">
                        <h4 className="font-bold text-sm mb-2 text-gray-600">Cronología</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.keys(times).map((key) => (
                                <div key={key}>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase">{key}</label>
                                    <input type="time" className="w-full border p-1 text-sm rounded bg-white" value={(times as any)[key]} onChange={e => setTimes({...times, [key]: e.target.value})} />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700">Causas</label>
                            <textarea className="w-full border p-2 rounded h-24" value={causes} onChange={e => setCauses(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700">Reparación</label>
                            <textarea className="w-full border p-2 rounded h-24" value={repair} onChange={e => setRepair(e.target.value)} />
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t flex justify-end gap-3 bg-gray-50">
                    <button onClick={handleSubmit} className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700 flex items-center gap-2"><Save size={16}/> Guardar</button>
                    <button onClick={onClose} className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400">Cancelar</button>
                </div>
            </div>
        </div>
    );
};

// --- GENERIC HISTORY MODAL ---
const HistoryModal = ({ isOpen, onClose, title, elements, type }: any) => {
    const [selectedId, setSelectedId] = useState('');
    const [history, setHistory] = useState<any[]>([]);

    useEffect(() => {
        if (isOpen && elements.length > 0) {
             // If selectedId is invalid or empty, default to first element
             if (!selectedId || !elements.find((e: any) => e.id === selectedId)) {
                setSelectedId(elements[0].id);
             }
        }
    }, [isOpen, elements, selectedId]);

    useEffect(() => {
        const fetchHistory = async () => {
            if (selectedId) {
                const data = type === 'maintenance' 
                    ? await api.getMaintenanceHistory(selectedId)
                    : await api.getFaultHistory(selectedId);
                setHistory(data);
            } else {
                setHistory([]);
            }
        };
        fetchHistory();
    }, [selectedId, type, isOpen]);
    
    const handleDelete = async (id: string) => {
        if(confirm('¿Eliminar registro permanentemente?')) {
             if (type === 'maintenance') await api.deleteMaintenance(id);
             else await api.deleteFault(id);
             
             // Refresh
             const data = type === 'maintenance' 
                    ? await api.getMaintenanceHistory(selectedId)
                    : await api.getFaultHistory(selectedId);
             setHistory(data);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
             <div className="bg-white rounded-lg w-[95vw] max-w-4xl h-[80vh] flex flex-col shadow-2xl overflow-hidden">
                <div className={`p-4 text-white flex justify-between items-center ${type === 'maintenance' ? 'bg-[#006338]' : 'bg-red-600'}`}>
                    <h3 className="font-bold">{title}</h3>
                    <button onClick={onClose}><X /></button>
                </div>
                <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
                    <label className="font-bold text-sm text-gray-700">Seleccionar Elemento:</label>
                    <select 
                        className="border p-2 rounded flex-1 max-w-md bg-white shadow-sm" 
                        value={selectedId} 
                        onChange={e => setSelectedId(e.target.value)}
                    >
                        {elements.map((el: any) => <option key={el.id} value={el.id}>{el.name}</option>)}
                    </select>
                </div>
                <div className="flex-1 overflow-auto p-4 bg-gray-50">
                    <div className="bg-white rounded shadow overflow-hidden">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-700 border-b">
                                <tr>
                                    <th className="p-3 w-32">Fecha</th>
                                    <th className="p-3 w-40">Agentes</th>
                                    <th className="p-3">Detalles</th>
                                    <th className="p-3 w-16 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {history.length === 0 ? 
                                    <tr><td colSpan={4} className="p-8 text-center text-gray-400 italic">No hay registros para este elemento</td></tr> 
                                : 
                                    history.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50 transition">
                                            <td className="p-3 align-top">
                                                <div className="font-bold">{item.date}</div>
                                                {type === 'maintenance' && <div className="text-xs text-gray-500 uppercase">{item.turn}</div>}
                                            </td>
                                            <td className="p-3 align-top text-gray-600">{item.agents.join(', ')}</td>
                                            <td className="p-3 align-top">
                                                {type === 'maintenance' 
                                                    ? <div className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                                                        {Object.entries(item.dataSnapshot || {}).map(([k,v]) => {
                                                            if (typeof v === 'object') return null; // Skip nested objects for summary
                                                            return <div key={k}><span className="font-semibold text-gray-500">{k}:</span> {String(v)}</div>
                                                        })}
                                                      </div>
                                                    : <div className="space-y-1">
                                                        <p className="font-medium text-gray-900">{item.description}</p>
                                                        {item.causes && <p className="text-xs text-gray-600"><span className="font-bold">Causa:</span> {item.causes}</p>}
                                                        {item.repair && <p className="text-xs text-gray-600"><span className="font-bold">Reparación:</span> {item.repair}</p>}
                                                        <div className="flex flex-wrap gap-2 mt-2">
                                                            {Object.entries(item.times || {}).map(([k,v]) => (
                                                                v ? <span key={k} className="text-[10px] bg-gray-100 px-1 rounded border border-gray-200 uppercase">{k}: {String(v)}</span> : null
                                                            ))}
                                                        </div>
                                                      </div>
                                                }
                                            </td>
                                            <td className="p-3 align-top text-right">
                                                <button onClick={() => handleDelete(item.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded transition"><Trash2 size={16}/></button>
                                            </td>
                                        </tr>
                                    ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>
             </div>
        </div>
    );
};

export const MaintenanceHistoryModal = (props: any) => <HistoryModal {...props} title="Historial de Mantenimiento" type="maintenance" />;
export const FaultHistoryModal = (props: any) => <HistoryModal {...props} title="Historial de Averías" type="faults" />;

// --- CHANGE PASSWORD MODAL ---
export const ChangePasswordModal = ({ isOpen, onClose, userId }: any) => {
    const [oldPass, setOldPass] = useState('');
    const [newPass, setNewPass] = useState('');
    const [confirmPass, setConfirmPass] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if(isOpen) {
            setOldPass('');
            setNewPass('');
            setConfirmPass('');
            setError('');
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        setError('');
        if (!oldPass || !newPass || !confirmPass) {
            setError('Todos los campos son obligatorios');
            return;
        }
        if (newPass !== confirmPass) {
            setError('Las contraseñas nuevas no coinciden');
            return;
        }

        const success = await api.changePassword(userId, oldPass, newPass);
        if (success) {
            alert('Contraseña cambiada correctamente');
            onClose();
        } else {
            setError('La contraseña antigua es incorrecta');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                     <h3 className="text-xl font-bold text-[#006338]">Cambiar Contraseña</h3>
                     <button onClick={onClose}><X size={20}/></button>
                </div>

                <div className="space-y-4">
                    {error && <div className="text-red-500 text-xs bg-red-50 p-2 rounded border border-red-200">{error}</div>}
                    <div>
                        <label className="block text-sm font-medium mb-1">Contraseña Antigua</label>
                        <div className="relative">
                            <input type="password" className="w-full border p-2 rounded pl-8" value={oldPass} onChange={e => setOldPass(e.target.value)} />
                            <Lock className="absolute left-2 top-2.5 text-gray-400" size={16} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Contraseña Nueva</label>
                        <input type="password" className="w-full border p-2 rounded" value={newPass} onChange={e => setNewPass(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Confirmar Contraseña</label>
                        <input type="password" className="w-full border p-2 rounded" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} />
                    </div>
                    
                    <div className="flex gap-2 pt-4">
                         <button onClick={handleSubmit} className="flex-1 bg-[#006338] text-white py-2 rounded hover:bg-green-800">Aceptar</button>
                         <button onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded hover:bg-gray-400">Cancelar</button>
                    </div>
                </div>
            </div>
        </div>
    );
};
