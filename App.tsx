
import React, { useState, useEffect } from 'react';
import { User, UserRole } from './types';
import { SECTORS, STATIONS, INSTALLATION_TYPES } from './constants';
import { api, checkSemesterReset } from './services/storage';
import { LogOut, Bell, User as UserIcon, Users, FileText, LayoutDashboard, ArrowLeft, Search, AlertTriangle, History, Grid } from 'lucide-react';
import { AgentsModal, UserManagementModal, NotificationsModal, ReportsModal, DashboardModal, ElementFormModal, FaultFormModal, FaultHistoryModal, MaintenanceHistoryModal, RosterModal } from './components/Modals';
import ElementCard from './components/ElementCard';

type View = 'LOGIN' | 'SECTORS' | 'ESTACIONES' | 'INSTALACIONES' | 'ELEMENTOS';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<View>('LOGIN');
  const [
    navState, 
    setNavState
  ] = useState<{ sectorId?: string; stationId?: string; installationType?: any }>({});
  
  // Modals State
  const [showAgents, setShowAgents] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showDash, setShowDash] = useState(false);
  const [showRoster, setShowRoster] = useState(false); // Added Roster State
  
  // New Modals State
  const [showAddElement, setShowAddElement] = useState(false);
  const [showMaintenance, setShowMaintenance] = useState(false);
  const [showFault, setShowFault] = useState(false);
  const [showFaultHistory, setShowFaultHistory] = useState(false);
  const [showMaintenanceHistory, setShowMaintenanceHistory] = useState(false);
  const [selectedElement, setSelectedElement] = useState<any>(null);

  // Data State
  const [agentsList, setAgentsList] = useState<any[]>([]);
  const [elementsList, setElementsList] = useState<any[]>([]);
  const [elementCounts, setElementCounts] = useState<Record<string, number>>({});
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sort State
  const [sortOption, setSortOption] = useState<'ALPHA_ASC' | 'ALPHA_DESC' | 'PK_ASC' | 'PK_DESC'>('ALPHA_ASC');
  
  // Login Form
  const [loginData, setLoginData] = useState({ matricula: '', password: '' });
  const [regData, setRegData] = useState({ fullName: '', matricula: '', password: '', cargo: '' });
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    checkSemesterReset();
    if (user) {
      loadAgents();
    }
  }, [user]);

  const loadAgents = async () => setAgentsList(await api.getAgents());
  
  const loadElements = async () => {
    if (navState.stationId && navState.installationType) {
        const els = await api.getElements(navState.stationId, navState.installationType);
        setElementsList(els);
    }
  };

  const loadCounts = async () => {
      if(navState.stationId) {
          const counts = await api.getElementCounts(navState.stationId);
          setElementCounts(counts);
      }
  };

  useEffect(() => {
    if (view === 'ELEMENTOS') loadElements();
    if (view === 'INSTALACIONES') loadCounts();
  }, [view, navState]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const u = await api.login(loginData.matricula, loginData.password);
    if (u) {
      setUser(u);
      setView('SECTORS');
    } else {
      alert('Credenciales incorrectas o usuario no aprobado.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.register({
        matricula: regData.matricula,
        password: regData.password,
        fullName: regData.fullName,
        role: UserRole.AGENT // Default
    });
    alert('Solicitud enviada. Espere aprobación del administrador.');
    setIsRegistering(false);
  };

  const handleLogout = () => {
    setUser(null);
    setView('LOGIN');
    setNavState({});
  };

  const goBack = () => {
    setSearchQuery('');
    if (view === 'ELEMENTOS') { setView('INSTALACIONES'); setNavState({ ...navState, installationType: undefined }); }
    else if (view === 'INSTALACIONES') { setView('ESTACIONES'); setNavState({ ...navState, stationId: undefined }); }
    else if (view === 'ESTACIONES') { setView('SECTORS'); setNavState({}); }
  };

  const handleDeleteElement = async (element: any) => {
      if(confirm(`¿Estás seguro de que quieres eliminar el elemento ${element.name}?`)) {
          await api.deleteElement(element.id);
          loadElements();
      }
  };

  // Filter and Sort elements based on search and sort option
  const filteredElements = elementsList
      .filter(el => el.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .sort((a, b) => {
          if (sortOption === 'ALPHA_ASC') return a.name.localeCompare(b.name);
          if (sortOption === 'ALPHA_DESC') return b.name.localeCompare(a.name);
          
          const pkA = parseFloat(a.data?.pk?.replace(',', '.') || '0');
          const pkB = parseFloat(b.data?.pk?.replace(',', '.') || '0');
          
          if (sortOption === 'PK_ASC') return pkA - pkB;
          if (sortOption === 'PK_DESC') return pkB - pkA;
          
          return 0;
      });
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  useEffect(() => {
      if (view === 'INSTALACIONES' && searchQuery.length > 0 && navState.stationId) {
           const search = async () => {
               // Inefficient search for demo (searching all types)
               let results: any[] = [];
               for(const t of INSTALLATION_TYPES) {
                   const els = await api.getElements(navState.stationId!, t);
                   results.push(...els);
               }
               setSearchResults(results.filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase())));
           };
           search();
      } else {
          setSearchResults([]);
      }
  }, [searchQuery, view, navState.stationId]);

  // Installation Colors Config
  const INSTALLATION_COLORS = [
      'bg-orange-500', // Circuitos
      'bg-blue-600',   // Motores
      'bg-purple-600', // PN
      'bg-emerald-600', // Señales
      'bg-yellow-500', // Baterias
      'bg-red-600'     // Enclavamiento
  ];

  // --- RENDERERS ---

  if (!user || view === 'LOGIN') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#006338] to-[#004d2c] flex items-center justify-center p-4 font-sans">
         <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-[#006338]"></div>
            <div className="flex justify-center mb-8 relative">
               <img src="https://www.adif.es/documents/20124/811001/Logo+Adif.png/" alt="Adif" className="h-20 drop-shadow-xl p-2" />
            </div>
            
            {!isRegistering ? (
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Matrícula</label>
                        <input className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#006338] focus:border-transparent transition" type="text" value={loginData.matricula} onChange={e => setLoginData({...loginData, matricula: e.target.value})} required />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label>
                        <input className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-[#006338] focus:border-transparent transition" type="password" value={loginData.password} onChange={e => setLoginData({...loginData, password: e.target.value})} required />
                    </div>
                    <button type="submit" className="w-full bg-[#006338] hover:bg-green-800 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition duration-200">
                        Iniciar Sesión
                    </button>
                    <p className="text-center text-sm mt-4 text-gray-600">
                        ¿No tienes cuenta? <button type="button" onClick={() => setIsRegistering(true)} className="text-[#006338] font-bold hover:underline">Regístrate</button>
                    </p>
                </form>
            ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                    <h3 className="text-xl font-bold text-center text-[#006338]">Solicitud de Registro</h3>
                    <input className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-[#006338]" placeholder="Nombre Completo" value={regData.fullName} onChange={e => setRegData({...regData, fullName: e.target.value})} required />
                    <input className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-[#006338]" placeholder="Matrícula" value={regData.matricula} onChange={e => setRegData({...regData, matricula: e.target.value})} required />
                    <input className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-[#006338]" type="password" placeholder="Contraseña" value={regData.password} onChange={e => setRegData({...regData, password: e.target.value})} required />
                    <input className="border border-gray-300 rounded-lg w-full p-3 focus:ring-2 focus:ring-[#006338]" placeholder="Cargo" value={regData.cargo} onChange={e => setRegData({...regData, cargo: e.target.value})} required />
                    <div className="flex gap-3 pt-2">
                        <button type="submit" className="flex-1 bg-[#006338] hover:bg-green-800 text-white p-3 rounded-lg shadow font-medium transition">Enviar</button>
                        <button type="button" onClick={() => setIsRegistering(false)} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 p-3 rounded-lg font-medium transition">Volver</button>
                    </div>
                </form>
            )}
         </div>
      </div>
    );
  }

  // --- HEADER & LAYOUT ---
  const currentSector = SECTORS.find(s => s.id === navState.sectorId);
  const currentStation = STATIONS.find(s => s.id === navState.stationId);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans">
        {/* HEADER */}
        <header className="bg-gradient-to-r from-[#006338] to-[#004d2c] text-white shadow-xl sticky top-0 z-40">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                
                {/* LEFT: Navigation */}
                <div className="flex items-center gap-4">
                    {view !== 'SECTORS' && (
                        <button onClick={goBack} className="p-2 hover:bg-white/20 rounded-full transition">
                            <ArrowLeft size={24} />
                        </button>
                    )}
                    <div className="flex flex-col">
                        <h2 className="text-2xl font-bold tracking-tight uppercase flex items-center gap-2">
                             {view === 'SECTORS' ? (
                                 'SECTORES'
                             ) : (
                                 <div className="flex items-center gap-2">
                                     {view === 'ESTACIONES' && currentSector && <span>{currentSector.name}</span>}
                                     {view === 'INSTALACIONES' && currentSector && currentStation && (
                                         <>
                                            <span 
                                                onClick={() => { setView('ESTACIONES'); setNavState({sectorId: currentSector.id}); }} 
                                                className="cursor-pointer hover:text-green-200 transition"
                                            >
                                                {currentSector.name}
                                            </span>
                                            <span className="text-green-300">&gt;</span>
                                            <span>{currentStation.name}</span>
                                         </>
                                     )}
                                     {view === 'ELEMENTOS' && currentSector && currentStation && (
                                         <>
                                            <span className="opacity-70">{currentSector.name}</span>
                                            <span className="text-green-300">&gt;</span>
                                            <span 
                                                onClick={() => { setView('INSTALACIONES'); setNavState({sectorId: currentSector.id, stationId: currentStation.id}); }}
                                                className="cursor-pointer hover:text-green-200 transition"
                                            >
                                                {currentStation.name}
                                            </span>
                                            <span className="text-green-300">&gt;</span>
                                            <span>{navState.installationType}</span>
                                         </>
                                     )}
                                 </div>
                             )}
                        </h2>
                    </div>
                </div>

                {/* RIGHT: Title, Actions & Profile */}
                <div className="flex items-center gap-6">
                    {/* Element View Specific Buttons */}
                    {view === 'ELEMENTOS' && (
                        <div className="hidden lg:flex gap-3">
                             <button onClick={() => setShowFaultHistory(true)} className="flex items-center gap-2 bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded-lg transition text-sm font-medium backdrop-blur-sm shadow-md">
                                <AlertTriangle size={16}/> Datos Averías
                             </button>
                             <button onClick={() => setShowMaintenanceHistory(true)} className="flex items-center gap-2 bg-green-500/80 hover:bg-green-500 px-4 py-2 rounded-lg transition text-sm font-medium backdrop-blur-sm shadow-md">
                                <History size={16}/> Datos Mantenimiento
                             </button>
                        </div>
                    )}

                    <h1 className="text-lg font-medium opacity-80 hidden md:block tracking-wide">Sigma-Sevilla</h1>

                    {/* Action Buttons */}
                    {(view === 'SECTORS' || view === 'ESTACIONES' || view === 'INSTALACIONES') && (
                        <div className="hidden lg:flex gap-3">
                            {view === 'ESTACIONES' && (
                                <button onClick={() => setShowRoster(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-sm font-medium backdrop-blur-sm">
                                    <Grid size={16}/> Gráfico
                                </button>
                            )}
                            <button onClick={() => setShowAgents(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-sm font-medium backdrop-blur-sm">
                                <Users size={16}/> Agentes
                            </button>
                            {view === 'SECTORS' && (
                                <button onClick={() => setShowUsers(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-sm font-medium backdrop-blur-sm">
                                    <UserIcon size={16}/> Usuarios
                                </button>
                            )}
                            {view !== 'SECTORS' && (
                                <>
                                    <button onClick={() => setShowReports(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-sm font-medium backdrop-blur-sm">
                                        <FileText size={16}/> Informes
                                    </button>
                                    <button onClick={() => setShowDash(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition text-sm font-medium backdrop-blur-sm">
                                        <LayoutDashboard size={16}/> Dashboard
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                    
                    {/* User Controls */}
                    <div className="flex items-center gap-4 border-l border-green-600/50 pl-6">
                        <div className="relative">
                            <button onClick={() => setShowNotifs(!showNotifs)} className="relative hover:bg-white/10 p-2 rounded-full transition">
                                <Bell size={20} />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-pulse"></span>
                            </button>
                            <NotificationsModal isOpen={showNotifs} onClose={() => setShowNotifs(false)} />
                        </div>
                        <div className="text-right hidden sm:block">
                            <div className="font-bold text-sm leading-tight">{user.fullName}</div>
                            <div className="text-xs text-green-200">{user.role}</div>
                        </div>
                        <button onClick={handleLogout} className="flex flex-col items-center text-green-100 hover:text-red-300 transition" title="Salir">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
            
            {/* SECTORS VIEW */}
            {view === 'SECTORS' && (
                <div className="flex-1 flex flex-col h-full">
                    {SECTORS.map(sector => (
                        <div 
                            key={sector.id}
                            onClick={() => { setNavState({ sectorId: sector.id }); setView('ESTACIONES'); }}
                            className="flex-1 w-full bg-white border-b border-gray-100 relative group cursor-pointer overflow-hidden flex items-center justify-center transition-all duration-300"
                        >
                            {/* Fill Animation Layer */}
                            <div className="absolute top-0 left-0 h-full bg-[#006338] w-0 group-hover:w-full transition-all duration-500 ease-out z-0"></div>
                            
                            <div className="relative z-10 text-center pointer-events-none">
                                <h2 className="text-3xl font-bold text-gray-800 group-hover:text-white transition-colors tracking-widest uppercase duration-300">
                                    {sector.name}
                                </h2>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* STATIONS VIEW */}
            {view === 'ESTACIONES' && (
                <div className="container mx-auto px-4 py-8 h-full overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {STATIONS.filter(s => s.sectorId === navState.sectorId).map(station => (
                            <button 
                                key={station.id}
                                onClick={() => { setNavState({ ...navState, stationId: station.id }); setView('INSTALACIONES'); }}
                                className="bg-white aspect-video rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col items-center justify-center p-6 border border-gray-100 group relative overflow-hidden"
                            >
                                {/* Fill Animation for Stations */}
                                <div className="absolute bottom-0 left-0 w-full h-0 bg-[#006338] group-hover:h-full transition-all duration-500 ease-out z-0"></div>
                                
                                <span className="font-bold text-xl text-center text-gray-700 group-hover:text-white transition-colors z-10">{station.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* INSTALLATIONS VIEW */}
            {view === 'INSTALACIONES' && (
                <div className="flex-1 flex flex-col h-full bg-gray-50">
                     {/* Search Bar */}
                     <div className="p-4 bg-white shadow-sm z-10 relative">
                        <div className="max-w-4xl mx-auto relative">
                            <input 
                                type="text" 
                                placeholder="Buscar elemento en esta estación..." 
                                className="w-full p-4 pl-12 rounded-xl shadow-inner bg-gray-100 border-none focus:ring-2 focus:ring-[#006338] focus:bg-white transition"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-4 top-4 text-gray-400" />
                            
                            {/* Search Results Overlay */}
                            {searchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 border border-gray-100">
                                    {searchResults.map(res => (
                                        <div 
                                            key={res.id} 
                                            className="p-3 hover:bg-green-50 cursor-pointer border-b last:border-0 flex justify-between items-center"
                                            onClick={() => {
                                                setNavState({ ...navState, installationType: res.installationType });
                                                setSearchQuery(''); // Clear logic or pass as filter?
                                                setView('ELEMENTOS');
                                            }}
                                        >
                                            <span className="font-bold text-gray-700">{res.name}</span>
                                            <span className="text-xs bg-gray-200 px-2 py-1 rounded text-gray-600">{res.installationType}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                     </div>

                     {/* Full Height Grid */}
                     <div className="flex-1 grid grid-rows-6 gap-1 p-2">
                        {INSTALLATION_TYPES.map((type, idx) => (
                             <button 
                                key={type}
                                onClick={() => { setNavState({ ...navState, installationType: type }); setSearchQuery(''); setView('ELEMENTOS'); }}
                                className={`
                                    relative w-full h-full bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 flex justify-between items-center px-8 group overflow-hidden
                                `}
                            >
                                {/* Color Fill Animation */}
                                <div className={`absolute top-0 left-0 h-full w-0 group-hover:w-full transition-all duration-500 ease-out z-0 ${INSTALLATION_COLORS[idx]}`}></div>

                                <div className="flex items-center gap-6 z-10">
                                    <div className={`
                                        w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md transform group-hover:scale-110 transition-transform duration-300 group-hover:bg-white group-hover:text-gray-800
                                        ${INSTALLATION_COLORS[idx]}
                                    `}>
                                        <LayoutDashboard size={28} />
                                    </div>
                                    <span className="font-bold text-2xl text-gray-700 group-hover:text-white transition-colors duration-300 tracking-tight">{type}</span>
                                </div>
                                <span className="z-10 bg-gray-100 text-gray-600 px-4 py-2 rounded-full font-bold shadow-inner group-hover:bg-white/20 group-hover:text-white transition-colors">
                                    {elementCounts[type] || 0} Elementos
                                </span>
                            </button>
                        ))}
                     </div>
                </div>
            )}

            {/* ELEMENTS VIEW */}
            {view === 'ELEMENTOS' && (
                <div className="container mx-auto px-4 py-8 flex flex-col gap-6 h-full overflow-y-auto">
                     <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm gap-4">
                        <div className="flex-1 max-w-lg relative">
                             <input 
                                type="text" 
                                placeholder="Filtrar elementos..." 
                                className="w-full p-2 pl-10 rounded border border-gray-200 focus:border-green-500 focus:outline-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18}/>
                        </div>

                        <div className="flex items-center gap-2">
                             <select 
                                className="border border-gray-200 rounded p-2 focus:ring-1 focus:ring-green-500"
                                value={sortOption}
                                onChange={(e: any) => setSortOption(e.target.value)}
                             >
                                 <option value="ALPHA_ASC">A-Z</option>
                                 <option value="ALPHA_DESC">Z-A</option>
                                 <option value="PK_ASC">PK Asc</option>
                                 <option value="PK_DESC">PK Desc</option>
                             </select>

                            <button 
                                onClick={() => { setSelectedElement(null); setShowAddElement(true); }}
                                className="bg-[#006338] text-white px-6 py-2 rounded-lg shadow hover:bg-green-800 transition flex items-center gap-2"
                            >
                                <span className="text-xl font-bold">+</span> Añadir Elemento
                            </button>
                        </div>
                     </div>

                     <div className="space-y-4 pb-12">
                        {filteredElements.length === 0 ? (
                            <div className="text-center p-16 text-gray-400 bg-white rounded-xl border-2 border-dashed border-gray-200">
                                {searchQuery ? 'No se encontraron elementos con ese nombre.' : 'No hay elementos registrados en esta instalación.'}
                            </div>
                        ) : (
                            filteredElements.map(el => (
                                <ElementCard 
                                    key={el.id} 
                                    element={el} 
                                    onUpdate={() => { loadElements(); }}
                                    onOpenFaults={(el) => { setSelectedElement(el); setShowFault(true); }}
                                    onOpenMaintenance={(el) => { setSelectedElement(el); setShowMaintenance(true); }}
                                    onDelete={handleDeleteElement}
                                    isAdminOrSupervisor={user.role !== UserRole.AGENT}
                                />
                            ))
                        )}
                     </div>
                </div>
            )}

        </main>

        {/* MODALS */}
        <AgentsModal 
            isOpen={showAgents} 
            onClose={() => setShowAgents(false)} 
            agents={agentsList} 
            sectors={SECTORS} 
            onUpdate={loadAgents} 
        />
        <UserManagementModal isOpen={showUsers} onClose={() => setShowUsers(false)} currentUserRole={user.role} />
        <ReportsModal isOpen={showReports} onClose={() => setShowReports(false)} />
        <DashboardModal isOpen={showDash} onClose={() => setShowDash(false)} />
        
        {/* ROSTER MODAL */}
        <RosterModal 
            isOpen={showRoster}
            onClose={() => setShowRoster(false)}
            sectorId={navState.sectorId}
            agents={agentsList.filter(a => a.assignedSectorId === navState.sectorId)}
        />
        
        {/* ADD ELEMENT MODAL */}
        <ElementFormModal 
            isOpen={showAddElement}
            onClose={() => setShowAddElement(false)}
            type={navState.installationType}
            stationId={navState.stationId}
            existingElement={null}
            onSubmit={loadElements}
        />

        {/* MAINTENANCE MODAL */}
        <ElementFormModal 
            isOpen={showMaintenance}
            onClose={() => setShowMaintenance(false)}
            type={navState.installationType}
            stationId={navState.stationId}
            existingElement={selectedElement}
            isMaintenance={true}
            onSubmit={loadElements}
        />

        {/* FAULT MODAL */}
        <FaultFormModal
            isOpen={showFault}
            onClose={() => setShowFault(false)}
            element={selectedElement}
            onSubmit={loadElements}
        />

        {/* HISTORY MODALS */}
        <FaultHistoryModal
            isOpen={showFaultHistory}
            onClose={() => setShowFaultHistory(false)}
            elements={elementsList}
        />
        <MaintenanceHistoryModal 
             isOpen={showMaintenanceHistory}
             onClose={() => setShowMaintenanceHistory(false)}
             elements={elementsList}
        />
    </div>
  );
}

export default App;
