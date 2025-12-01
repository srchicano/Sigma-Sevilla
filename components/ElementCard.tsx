
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Check, Edit2, AlertTriangle, FileText, X } from 'lucide-react';
import { ElementData, InstallationType } from '../types';
import { api } from '../services/storage';

interface ElementCardProps {
  element: ElementData;
  onUpdate: () => void;
  onOpenFaults: (element: ElementData) => void;
  onOpenMaintenance: (element: ElementData) => void;
  onDelete: (element: ElementData) => void;
  isAdminOrSupervisor: boolean;
}

const ElementCard: React.FC<ElementCardProps> = ({ element, onUpdate, onOpenFaults, onOpenMaintenance, onDelete, isAdminOrSupervisor }) => {
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

  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      onDelete(element);
  };

  const handleInputChange = (path: string, value: any) => {
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

  const renderInput = (label: string, path: string, unit: string = '') => {
      const keys = path.split('.');
      let val: any = localData;
      for (const k of keys) val = val?.[k];

      const safeVal = (typeof val === 'string' || typeof val === 'number') ? val : '';

      return isEditing ? (
        <div className="flex items-center gap-1 w-full">
            {label && <span className="text-xs font-semibold whitespace-nowrap">{label}:</span>}
            <input 
                className="w-full border p-1 rounded text-xs bg-yellow-50 focus:outline-none focus:ring-1 focus:ring-green-500"
                value={safeVal}
                onChange={(e) => handleInputChange(path, e.target.value)}
                onClick={(e) => e.stopPropagation()}
            />
            {unit && <span className="text-xs text-gray-500">{unit}</span>}
        </div>
      ) : (
        <div className="flex justify-between items-center text-xs w-full">
            {label && <span className="font-semibold text-gray-700">{label}:</span>}
            <span className="font-mono text-gray-900 ml-1">{safeVal || '-'}{safeVal ? unit : ''}</span>
        </div>
      );
  };

  const renderCheckbox = (label: string, path: string) => {
      const keys = path.split('.');
      let val: any = localData;
      for (const k of keys) val = val?.[k];
      const isChecked = !!val;

      return (
          <div className="flex justify-between items-center text-xs w-full py-1">
              <span className="font-semibold text-gray-700">{label}:</span>
              <input 
                  type="checkbox" 
                  checked={isChecked}
                  disabled={!isEditing}
                  onChange={(e) => handleInputChange(path, e.target.checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 text-green-600 rounded focus:ring-green-500 disabled:opacity-50"
              />
          </div>
      );
  };

  const renderCircuitos = () => (
      <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-sm mt-4">
          <div className="bg-orange-100 p-2 rounded">
              <h4 className="text-orange-800 font-bold mb-2 text-xs uppercase">FILTRO</h4>
              {renderInput('3/4', 'filtro', 'V')}
          </div>
          <div className="bg-blue-100 p-2 rounded">
              <h4 className="text-blue-800 font-bold mb-2 text-xs uppercase">RECEPTORES</h4>
              <div className="flex flex-col gap-1">
                  {renderInput('I1/2 ⊕1', 'receptores.i1', 'V')}
                  {renderInput('I1/2 ⊕2', 'receptores.i2', 'V')}
                  {renderInput('I1/2 ⊕3', 'receptores.i3', 'V')}
              </div>
          </div>
          <div className="bg-green-100 p-2 rounded">
              <h4 className="text-green-800 font-bold mb-2 text-xs uppercase">RELÉS</h4>
              <div className="flex flex-col gap-1">
                  {renderInput('I5/II8 ⊕1', 'reles.i1', 'V')}
                  {renderInput('I5/II8 ⊕2', 'reles.i2', 'V')}
                  {renderInput('I5/II8 ⊕3', 'reles.i3', 'V')}
              </div>
          </div>
          <div className="bg-purple-100 p-2 rounded">
              <h4 className="text-purple-800 font-bold mb-2 text-xs uppercase">SHUNT</h4>
               <div className="flex flex-col gap-1">
                  {renderInput('ASU', 'shunt.asu', 'V')}
                  {renderInput('Parásitas', 'shunt.parasitas', 'V')}
              </div>
          </div>
          <div className="bg-red-100 p-2 rounded">
              <h4 className="text-red-800 font-bold mb-2 text-xs uppercase">COLATERALES</h4>
               <div className="flex flex-col gap-1">
                  {renderInput('Col. ⊕1', 'colaterales.c1', 'V')}
                  {renderInput('Col. ⊕2', 'colaterales.c2', 'V')}
                  {renderInput('Col. ⊕3', 'colaterales.c3', 'V')}
                  {renderInput('Col. ⭡', 'colaterales.c4', 'V')}
              </div>
          </div>
      </div>
  );

  const renderMotores = () => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-4">
          <div className="bg-green-50 p-3 rounded border border-green-200">
              <h4 className="text-green-800 font-bold mb-2 text-center text-xs uppercase">Mov. a NORMAL</h4>
              <div className="space-y-1">
                 {renderInput('Tiempo + CG', 'normal.tcg', 'ms')}
                 {renderInput('Tiempo + SG', 'normal.tsg', 'ms')}
                 {renderInput('Intensidad + CG', 'normal.icg', 'A')}
                 {renderInput('Intensidad + SG', 'normal.isg', 'A')}
                 {renderInput('Tensión +', 'normal.v', 'V')}
              </div>
          </div>
          <div className="bg-red-50 p-3 rounded border border-red-200">
              <h4 className="text-red-800 font-bold mb-2 text-center text-xs uppercase">Mov. a INVERTIDO</h4>
              <div className="space-y-1">
                 {renderInput('Tiempo - CG', 'invertido.tcg', 'ms')}
                 {renderInput('Tiempo - SG', 'invertido.tsg', 'ms')}
                 {renderInput('Intensidad - CG', 'invertido.icg', 'A')}
                 {renderInput('Intensidad - SG', 'invertido.isg', 'A')}
                 {renderInput('Tensión -', 'invertido.v', 'V')}
              </div>
          </div>
      </div>
  );

  const renderSenales = () => (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm mt-4">
          {/* FOCOS */}
          <div className="border border-blue-200 rounded overflow-hidden">
              <div className="bg-blue-600 text-white p-1 text-center font-bold text-xs uppercase">FOCOS</div>
              <div className="p-2 space-y-2 bg-blue-50 h-full">
                  <div className="bg-blue-100 p-1 rounded">
                      <h5 className="text-blue-800 text-[10px] font-bold uppercase mb-1">TIPO</h5>
                      <select 
                        disabled={!isEditing}
                        value={localData?.focos?.tipo || ''}
                        onChange={(e) => handleInputChange('focos.tipo', e.target.value)}
                        className={`w-full text-xs p-1 rounded border ${isEditing ? 'bg-white' : 'bg-transparent border-none appearance-none'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                          <option value="">Sel...</option>
                          <option value="Modular">Modular</option>
                          <option value="Ind. Normal">Ind. Normal</option>
                          <option value="LED">LED</option>
                      </select>
                  </div>
                  <div className="bg-red-100 p-1 rounded">
                      <h5 className="text-red-800 text-[10px] font-bold uppercase mb-1">ROJO</h5>
                      {renderInput('Ve rojo', 'focos.rojo.ve')}
                      {renderInput('V lamp R', 'focos.rojo.vlamp')}
                  </div>
                  <div className="bg-gray-200 p-1 rounded">
                      <h5 className="text-gray-700 text-[10px] font-bold uppercase mb-1">BLANCO</h5>
                      {renderInput('Ve blanco', 'focos.blanco.ve')}
                      {renderInput('V lamp B', 'focos.blanco.vlamp')}
                  </div>
                  <div className="bg-green-100 p-1 rounded">
                      <h5 className="text-green-800 text-[10px] font-bold uppercase mb-1">VERDE</h5>
                      {renderInput('Ve verde', 'focos.verde.ve')}
                      {renderInput('V lamp V', 'focos.verde.vlamp')}
                  </div>
                  <div className="bg-yellow-100 p-1 rounded">
                      <h5 className="text-yellow-800 text-[10px] font-bold uppercase mb-1">AMARILLO</h5>
                      {renderInput('Ve Amar', 'focos.amarillo.ve')}
                      {renderInput('V lamp A', 'focos.amarillo.vlamp')}
                  </div>
              </div>
          </div>

          {/* UNIDAD DE CONEXIÓN */}
          <div className="border border-green-800 rounded overflow-hidden">
              <div className="bg-[#004d2c] text-white p-1 text-center font-bold text-xs uppercase">UNIDAD DE CONEXIÓN</div>
              <div className="p-2 space-y-2 bg-green-50 h-full">
                  <div className="bg-green-200 p-1 rounded">
                      <h5 className="text-green-900 text-[10px] font-bold uppercase mb-1">UD CONEXIÓN</h5>
                      {/* Changed to Dropdown */}
                      <select 
                        disabled={!isEditing}
                        value={localData?.uc?.uc || ''}
                        onChange={(e) => handleInputChange('uc.uc', e.target.value)}
                        className={`w-full text-xs p-1 rounded border ${isEditing ? 'bg-white' : 'bg-transparent border-none appearance-none'}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                          <option value="">Sel...</option>
                          <option value="UCS">UCS</option>
                          <option value="UCD">UCD</option>
                          <option value="UCT">UCT</option>
                      </select>
                  </div>
                  <div className="bg-green-100 p-1 rounded border border-green-200">
                      <h5 className="text-green-800 text-[10px] font-bold uppercase mb-1">SALIDA VERDE</h5>
                      {renderInput('TSB Verde', 'uc.verde.tsb')}
                      {renderInput('CompAlt V', 'uc.verde.compAlt')}
                      {renderInput('Baliza V', 'uc.verde.baliza')}
                      {renderCheckbox('Reparto', 'uc.verde.reparto')}
                  </div>
                  <div className="bg-green-100 p-1 rounded border border-green-200">
                      <h5 className="text-green-800 text-[10px] font-bold uppercase mb-1">SALIDA AMARILLO</h5>
                      {renderInput('TSB Amar', 'uc.amarillo.tsb')}
                      {renderInput('CompAlt A', 'uc.amarillo.compAlt')}
                      {renderInput('Baliza A', 'uc.amarillo.baliza')}
                      {renderCheckbox('Reparto', 'uc.amarillo.reparto')}
                  </div>
              </div>
          </div>

          {/* BALIZA PIE SEÑAL */}
          <div className="border border-orange-700 rounded overflow-hidden">
              <div className="bg-orange-700 text-white p-1 text-center font-bold text-xs uppercase">BALIZA PIE SEÑAL</div>
              <div className="p-2 space-y-2 bg-orange-50 h-full">
                  <div className="bg-orange-100 p-1 rounded">
                      <h5 className="text-orange-900 text-[10px] font-bold uppercase mb-1">L8</h5>
                      {renderInput('Desv F', 'balizaPie.l8.desvF')}
                      {renderInput('Desv %', 'balizaPie.l8.desvP')}
                      {renderInput('Altura', 'balizaPie.l8.altura')}
                  </div>
                  <div className="bg-orange-100 p-1 rounded">
                      <h5 className="text-orange-900 text-[10px] font-bold uppercase mb-1">L3</h5>
                      {renderInput('Desv F', 'balizaPie.l3.desvF')}
                      {renderInput('Desv %', 'balizaPie.l3.desvP')}
                      {renderInput('Altura', 'balizaPie.l3.altura')}
                  </div>
                  <div className="bg-orange-100 p-1 rounded">
                      <h5 className="text-orange-900 text-[10px] font-bold uppercase mb-1">L1</h5>
                      {renderInput('Desv F', 'balizaPie.l1.desvF')}
                      {renderInput('Desv %', 'balizaPie.l1.desvP')}
                      {renderInput('Altura', 'balizaPie.l1.altura')}
                  </div>
                  <div className="bg-orange-200 p-1 rounded">
                      <h5 className="text-orange-900 text-[10px] font-bold uppercase mb-1">CARRIL</h5>
                      {renderInput('Dist. Carril', 'balizaPie.carril.dist')}
                      {renderInput('Alt. Carril', 'balizaPie.carril.altura')}
                  </div>
              </div>
          </div>

          {/* BALIZA PREVIA */}
          <div className="border border-purple-800 rounded overflow-hidden">
              <div className="bg-purple-900 text-white p-1 text-center font-bold text-xs uppercase">BALIZA PREVIA</div>
              <div className="p-2 space-y-2 bg-purple-50 h-full">
                   <div className="bg-purple-100 p-1 rounded">
                      <h5 className="text-purple-900 text-[10px] font-bold uppercase mb-1">L7</h5>
                      {renderInput('Desv F', 'balizaPrevia.l7.desvF')}
                      {renderInput('Desv %', 'balizaPrevia.l7.desvP')}
                      {renderInput('Altura', 'balizaPrevia.l7.altura')}
                  </div>
                  <div className="bg-purple-100 p-1 rounded">
                      <h5 className="text-purple-900 text-[10px] font-bold uppercase mb-1">L3</h5>
                      {renderInput('Desv F', 'balizaPrevia.l3.desvF')}
                      {renderInput('Desv %', 'balizaPrevia.l3.desvP')}
                      {renderInput('Altura', 'balizaPrevia.l3.altura')}
                  </div>
                  <div className="bg-purple-100 p-1 rounded">
                      <h5 className="text-purple-900 text-[10px] font-bold uppercase mb-1">L1</h5>
                      {renderInput('Desv F', 'balizaPrevia.l1.desvF')}
                      {renderInput('Desv %', 'balizaPrevia.l1.desvP')}
                      {renderInput('Altura', 'balizaPrevia.l1.altura')}
                  </div>
                  <div className="bg-purple-200 p-1 rounded">
                      <h5 className="text-purple-900 text-[10px] font-bold uppercase mb-1">CARRIL</h5>
                      {renderInput('Dist. Carril', 'balizaPrevia.carril.dist')}
                      {renderInput('Alt. Carril', 'balizaPrevia.carril.altura')}
                  </div>
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
        className={`bg-white rounded-lg shadow-md border-l-4 transition-all duration-200 cursor-pointer overflow-hidden relative
            ${element.isCompleted ? 'border-green-500' : 'border-gray-300'}
            ${isExpanded ? 'ring-2 ring-green-100' : 'hover:shadow-lg'}
        `}
    >
      {/* DELETE BUTTON - Top Right */}
      <button 
          onClick={handleDelete}
          className="absolute top-2 right-2 text-gray-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition z-20"
          title="Eliminar elemento"
      >
          <X size={16} />
      </button>

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
            <div className="flex-1 mr-8">
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
            {/* Added PK Display */}
            <div className="mb-2 p-2 bg-gray-50 rounded border border-gray-100">
                {renderInput('P.K.', 'pk')}
            </div>
            
            {element.installationType === InstallationType.CIRCUITOS && renderCircuitos()}
            {element.installationType === InstallationType.MOTORES && renderMotores()}
            {element.installationType === InstallationType.SENALES && renderSenales()}
            {![InstallationType.CIRCUITOS, InstallationType.MOTORES, InstallationType.SENALES].includes(element.installationType) && renderGeneric()}
        </div>
      )}
    </div>
  );
};

export default ElementCard;
