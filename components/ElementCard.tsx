import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Edit2, AlertTriangle, FileText } from 'lucide-react';
import { ElementData, InstallationType } from '../types';
import { api } from '../services/storage';

interface ElementCardProps {
  element: ElementData;
  onUpdate: () => void;
  onOpenFaults: (element: ElementData) => void;
  onOpenMaintenance: (element: ElementData) => void;
  isAdminOrSupervisor: boolean;
}

const ElementCard: React.FC<ElementCardProps> = ({ element, onUpdate, onOpenFaults, onOpenMaintenance, isAdminOrSupervisor }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [localData, setLocalData] = useState(element.data);

  const toggleCheck = async (e: React.MouseEvent) => {
    e.stopPropagation();
    // Toggle completion status in backend
    const updated = { ...element, isCompleted: !element.isCompleted };
    await api.updateElement(updated);
    onUpdate();
  };

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...element, data: localData };
    await api.updateElement(updated);
    setIsEditing(false);
    onUpdate();
  };

  const handleInputChange = (path: string, value: string) => {
    // Simple deep update for nested objects in localData
    const keys = path.split('.');
    const newData = { ...localData };
    let current: any = newData;
    for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
    setLocalData(newData);
  };

  // --- RENDERERS FOR DIFFERENT TYPES ---

  const renderInput = (label: string, path: string, placeholder: string) => {
      const keys = path.split('.');
      let val: any = localData;
      for (const k of keys) val = val?.[k];

      const safeVal = (typeof val === 'string' || typeof val === 'number') ? val : '';

      return isEditing ? (
        <input 
            className="w-full border p-1 rounded text-sm bg-yellow-50"
            value={safeVal}
            onChange={(e) => handleInputChange(path, e.target.value)}
            placeholder={placeholder}
            onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="font-medium text-gray-800">{safeVal || '-'}</span>
      );
  };

  const renderCircuitos = () => (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm mt-4">
          <div className="bg-orange-100 p-2 rounded">
              <h4 className="text-orange-800 font-bold mb-2">FILTRO</h4>
              <div className="flex justify-between"><span>3/4:</span> {renderInput('3/4', 'filtro', 'V')}</div>
          </div>
          <div className="bg-blue-100 p-2 rounded">
              <h4 className="text-blue-800 font-bold mb-2">RECEPTORES</h4>
              <div className="flex flex-col gap-1">
                  <div className="flex justify-between"><span>I1/2 ⊕1:</span> {renderInput('I1/2 ⊕1', 'receptores.i1', 'V')}</div>
                  <div className="flex justify-between"><span>I1/2 ⊕2:</span> {renderInput('I1/2 ⊕2', 'receptores.i2', 'V')}</div>
                  <div className="flex justify-between"><span>I1/2 ⊕3:</span> {renderInput('I1/2 ⊕3', 'receptores.i3', 'V')}</div>
              </div>
          </div>
          <div className="bg-green-100 p-2 rounded">
              <h4 className="text-green-800 font-bold mb-2">RELÉS</h4>
              <div className="flex flex-col gap-1">
                  <div className="flex justify-between"><span>I5/II8 ⊕1:</span> {renderInput('I5/II8 ⊕1', 'reles.i1', 'V')}</div>
                  <div className="flex justify-between"><span>I5/II8 ⊕2:</span> {renderInput('I5/II8 ⊕2', 'reles.i2', 'V')}</div>
                  <div className="flex justify-between"><span>I5/II8 ⊕3:</span> {renderInput('I5/II8 ⊕3', 'reles.i3', 'V')}</div>
              </div>
          </div>
          <div className="bg-purple-100 p-2 rounded">
              <h4 className="text-purple-800 font-bold mb-2">SHUNT</h4>
               <div className="flex flex-col gap-1">
                  <div className="flex justify-between"><span>ASU:</span> {renderInput('ASU', 'shunt.asu', 'V')}</div>
                  <div className="flex justify-between"><span>Parásitas:</span> {renderInput('Parásitas', 'shunt.parasitas', 'V')}</div>
              </div>
          </div>
          <div className="bg-red-100 p-2 rounded">
              <h4 className="text-red-800 font-bold mb-2">COLATERALES</h4>
               <div className="flex flex-col gap-1">
                  <div className="flex justify-between"><span>Col. ⊕1:</span> {renderInput('Col 1', 'colaterales.c1', 'V')}</div>
                  <div className="flex justify-between"><span>Col. ⊕2:</span> {renderInput('Col 2', 'colaterales.c2', 'V')}</div>
                  <div className="flex justify-between"><span>Col. ⊕3:</span> {renderInput('Col 3', 'colaterales.c3', 'V')}</div>
                  <div className="flex justify-between"><span>Col. ⭡:</span> {renderInput('Col Up', 'colaterales.c4', 'V')}</div>
              </div>
          </div>
      </div>
  );

  const renderMotores = () => (
      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <div className="bg-green-50 p-3 rounded border border-green-200">
              <h4 className="text-green-800 font-bold mb-2 text-center">Mov. a NORMAL</h4>
              <div className="space-y-2">
                 <div className="flex justify-between"><span>Tiempo + CG:</span> {renderInput('', 'normal.tcg', 'ms')}</div>
                 <div className="flex justify-between"><span>Tiempo + SG:</span> {renderInput('', 'normal.tsg', 'ms')}</div>
                 <div className="flex justify-between"><span>Intensidad + CG:</span> {renderInput('', 'normal.icg', 'A')}</div>
                 <div className="flex justify-between"><span>Intensidad + SG:</span> {renderInput('', 'normal.isg', 'A')}</div>
                 <div className="flex justify-between"><span>Tensión +:</span> {renderInput('', 'normal.v', 'V')}</div>
              </div>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
              <h4 className="text-red-800 font-bold mb-2 text-center">Mov. a INVERTIDO</h4>
              <div className="space-y-2">
                 <div className="flex justify-between"><span>Tiempo - CG:</span> {renderInput('', 'invertido.tcg', 'ms')}</div>
                 <div className="flex justify-between"><span>Tiempo - SG:</span> {renderInput('', 'invertido.tsg', 'ms')}</div>
                 <div className="flex justify-between"><span>Intensidad - CG:</span> {renderInput('', 'invertido.icg', 'A')}</div>
                 <div className="flex justify-between"><span>Intensidad - SG:</span> {renderInput('', 'invertido.isg', 'A')}</div>
                 <div className="flex justify-between"><span>Tensión -:</span> {renderInput('', 'invertido.v', 'V')}</div>
              </div>
          </div>
      </div>
  );

  const renderGeneric = () => (
      <div className="p-4 text-gray-500 italic text-center bg-gray-50 mt-4 rounded">
          Parámetros detallados disponibles en versión completa.
      </div>
  );

  const renderSummary = () => {
     return (
        <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600 w-full">
           <div>
              <span className="font-semibold text-gray-800">Fecha Mant.:</span> {element.lastMaintenanceDate || 'Pendiente'}
           </div>
           <div>
              <span className="font-semibold text-gray-800">Agentes:</span> {localData?.lastAgents || '-'}
           </div>
           {element.installationType === InstallationType.CIRCUITOS && (
               <div><span className="font-semibold text-gray-800">Frecuencia:</span> {localData?.frecuencia || '-'}</div>
           )}
           {element.installationType === InstallationType.PN && (
               <div><span className="font-semibold text-gray-800">Contrata:</span> {localData?.contrata || '-'}</div>
           )}
        </div>
     );
  };

  return (
    <div 
        onClick={() => !isEditing && setIsExpanded(!isExpanded)} 
        className={`bg-white rounded-lg shadow-md border-l-4 transition-all duration-200 cursor-pointer overflow-hidden
            ${element.isCompleted ? 'border-green-500' : 'border-gray-300'}
            ${isExpanded ? 'ring-2 ring-green-100' : 'hover:shadow-lg'}
        `}
    >
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
            <button 
                onClick={toggleCheck}
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
                    ${element.isCompleted ? 'bg-green-500 border-green-500 text-white' : 'border-gray-300 text-transparent hover:border-green-400'}
                `}
            >
                <Check size={16} strokeWidth={3} />
            </button>
            <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">{element.name}</h3>
                {renderSummary()}
            </div>
        </div>

        <div className="flex flex-col gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
            {isAdminOrSupervisor && (
                isEditing ? (
                    <button onClick={handleSave} className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700">Guardar</button>
                ) : (
                    <button onClick={() => {setIsEditing(true); setIsExpanded(true);}} className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-xs hover:bg-gray-200 border flex items-center gap-1">
                        <Edit2 size={12}/> Editar
                    </button>
                )
            )}
            <button onClick={() => onOpenFaults(element)} className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs hover:bg-red-100 border border-red-200 flex items-center gap-1">
                <AlertTriangle size={12}/> Avería
            </button>
            <button onClick={() => onOpenMaintenance(element)} className="bg-green-50 text-green-600 px-3 py-1 rounded text-xs hover:bg-green-100 border border-green-200 flex items-center gap-1">
                <FileText size={12}/> Mant.
            </button>
        </div>

        <div className="ml-4 text-gray-400">
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 cursor-default" onClick={(e) => isEditing && e.stopPropagation()}>
            {element.installationType === InstallationType.CIRCUITOS && renderCircuitos()}
            {element.installationType === InstallationType.MOTORES && renderMotores()}
            {![InstallationType.CIRCUITOS, InstallationType.MOTORES].includes(element.installationType) && renderGeneric()}
        </div>
      )}
    </div>
  );
};

export default ElementCard;