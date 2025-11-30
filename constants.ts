import { Sector, Station, InstallationType } from './types';

export const SECTORS: Sector[] = [
  { id: 'sevilla-santa-justa', name: 'SEVILLA-SANTA JUSTA' },
  { id: 'sevilla-san-pablo', name: 'SEVILLA-SAN PABLO' },
  { id: 'utrera', name: 'UTRERA' },
  { id: 'jerez', name: 'JEREZ' },
  { id: 'huelva', name: 'HUELVA' },
];

export const STATIONS: Station[] = [
  // SEVILLA-SANTA JUSTA
  { id: 'dos-hermanas', name: 'DOS HERMANAS', sectorId: 'sevilla-santa-justa' },
  { id: 'la-salud', name: 'LA SALUD', sectorId: 'sevilla-santa-justa' },
  { id: 'sevilla-santa-justa-est', name: 'SEVILLA SANTA JUSTA', sectorId: 'sevilla-santa-justa' },
  { id: 'la-negrilla', name: 'LA NEGRILLA', sectorId: 'sevilla-santa-justa' },
  { id: 'triangulo-tamarguillo', name: 'TRIÁNGULO TAMARGUILLO', sectorId: 'sevilla-santa-justa' },
  { id: 'majarabique', name: 'MAJARABIQUE', sectorId: 'sevilla-santa-justa' },
  { id: 'cartuja', name: 'CARTUJA', sectorId: 'sevilla-santa-justa' },
  { id: 'alamillo', name: 'ALAMILLO', sectorId: 'sevilla-santa-justa' },
  { id: 'valencina', name: 'VALENCINA-SANTIPONCE', sectorId: 'sevilla-santa-justa' },
  { id: 'salteras', name: 'SALTERAS', sectorId: 'sevilla-santa-justa' },
  { id: 'vva-ariscal', name: 'VVA DEL ARISCAL Y OLIVARES', sectorId: 'sevilla-santa-justa' },
  { id: 'benacazon', name: 'BENACAZÓN', sectorId: 'sevilla-santa-justa' },

  // SEVILLA-SAN PABLO
  { id: 'ctt', name: 'CTT', sectorId: 'sevilla-san-pablo' },
  { id: 'brenes', name: 'BRENES', sectorId: 'sevilla-san-pablo' },
  { id: 'los-rosales', name: 'LOS ROSALES', sectorId: 'sevilla-san-pablo' },
  { id: 'lora-del-rio', name: 'LORA DEL RIO', sectorId: 'sevilla-san-pablo' },
  { id: 'vva-rio-minas', name: 'VVA DEL RIO Y MINAS', sectorId: 'sevilla-san-pablo' },
  { id: 'pedroso', name: 'PEDROSO', sectorId: 'sevilla-san-pablo' },
  { id: 'cazalla', name: 'CAZALLA-CONSTANTINA', sectorId: 'sevilla-san-pablo' },
  { id: 'guadalcanal', name: 'GUADALCANAL', sectorId: 'sevilla-san-pablo' },

  // UTRERA
  { id: 'utrera-est', name: 'UTRERA', sectorId: 'utrera' },
  { id: 'bif-utrera', name: 'BIF. UTRERA', sectorId: 'utrera' },
  { id: 'el-sorbito', name: 'EL SORBITO', sectorId: 'utrera' },
  { id: 'arahal', name: 'ARAHAL', sectorId: 'utrera' },
  { id: 'marchena', name: 'MARCHENA', sectorId: 'utrera' },
  { id: 'osuna', name: 'OSUNA', sectorId: 'utrera' },
  { id: 'pedrera', name: 'PEDRERA', sectorId: 'utrera' },
  { id: 'fuente-piedra', name: 'FUENTE DE PIEDRA', sectorId: 'utrera' },
  { id: 'las-cabezas', name: 'LAS CABEZAS DE S. JUAN', sectorId: 'utrera' },
  { id: 'lebrija', name: 'LEBRIJA', sectorId: 'utrera' },

  // JEREZ
  { id: 'aeropuerto-jerez', name: 'AEROPUERTO DE JEREZ', sectorId: 'jerez' },
  { id: 'jerez-mercancias', name: 'JEREZ MERCANCIAS', sectorId: 'jerez' },
  { id: 'jerez-frontera', name: 'JEREZ DE LA FRONTERA', sectorId: 'jerez' },
  { id: 'puerto-sta-maria', name: 'PUERTO DE STA MARIA', sectorId: 'jerez' },
  { id: 'las-aletas', name: 'LAS ALETAS', sectorId: 'jerez' },
  { id: 'universidad-cadiz', name: 'UNIVERSIDAD DE CADIZ', sectorId: 'jerez' },
  { id: 'san-fernando', name: 'SAN FERNANDO-BAHIA SUR', sectorId: 'jerez' },
  { id: 'rio-arillo', name: 'RIO ARILLO', sectorId: 'jerez' },
  { id: 'cortadura', name: 'CORTADURA', sectorId: 'jerez' },
  { id: 'cadiz', name: 'CADIZ', sectorId: 'jerez' },

  // HUELVA
  { id: 'huelva-mercancias', name: 'HUELVA MERCANCIAS', sectorId: 'huelva' },
  { id: 'gibraleon', name: 'GIBRALEON', sectorId: 'huelva' },
  { id: 'calanas', name: 'CALAÑAS', sectorId: 'huelva' },
  { id: 'valdelamusa', name: 'VALDELAMUSA', sectorId: 'huelva' },
  { id: 'jabugo', name: 'JABUGO-GALAROZA', sectorId: 'huelva' },
  { id: 'san-juan-puerto', name: 'S. JUAN DEL PUERTO', sectorId: 'huelva' },
  { id: 'niebla', name: 'NIEBLA', sectorId: 'huelva' },
  { id: 'la-palma', name: 'LA PALMA DEL CONDADO', sectorId: 'huelva' },
  { id: 'escacena', name: 'ESCACENA', sectorId: 'huelva' },
  { id: 'carrion', name: 'CARRION DE LOS CESPEDES', sectorId: 'huelva' },
  { id: 'aznalcazar', name: 'AZNALCAZAR-PILAS', sectorId: 'huelva' },
];

export const INSTALLATION_TYPES = [
  InstallationType.CIRCUITOS,
  InstallationType.MOTORES,
  InstallationType.PN,
  InstallationType.SENALES,
  InstallationType.BATERIAS,
  InstallationType.ENCLAVAMIENTO
];

export const MONTH_NAMES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

export const THEME_COLOR = '#006338';

export const SHIFT_TYPES: Record<string, { label: string, color: string }> = {
    'M': { label: 'Mañana', color: 'bg-green-200 text-green-900 border-green-300' },
    'T': { label: 'Tarde', color: 'bg-orange-200 text-orange-900 border-orange-300' },
    'N': { label: 'Noche', color: 'bg-blue-200 text-blue-900 border-blue-300' },
    'G': { label: 'Guardia', color: 'bg-orange-300 text-orange-900 border-orange-400' },
    'G.': { label: 'Guardia Festivo', color: 'bg-orange-300 text-orange-900 border-orange-400' },
    'RJ': { label: 'Red. Jornada', color: 'bg-purple-200 text-purple-900 border-purple-300' },
    'LZ': { label: 'Asuntos Propios', color: 'bg-purple-200 text-purple-900 border-purple-300' },
    'H': { label: 'Licencia Médica', color: 'bg-purple-200 text-purple-900 border-purple-300' },
    'Re': { label: 'Reemplazo', color: 'bg-red-200 text-red-900 border-red-300' },
    'VB': { label: 'Vacaciones', color: 'bg-purple-200 text-purple-900 border-purple-300' },
    'VBA': { label: 'Conv. Vacaciones', color: 'bg-purple-200 text-purple-900 border-purple-300' },
    'Ge': { label: 'Gerencia', color: 'bg-red-200 text-red-900 border-red-300' },
    '': { label: 'Vacío', color: 'bg-white' }
};