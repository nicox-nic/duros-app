import type { Property } from '../types';

export const mockProperties: Property[] = [
  {
    id: 'prop-001',
    name: 'Duros Prime Residences',
    address: 'Bonifacio Global City, Taguig',
    type: 'condominium',
    towers: 3,
    totalUnits: 412,
  },
  {
    id: 'prop-002',
    name: 'Duros Skyview',
    address: 'Ortigas Center, Pasig',
    type: 'condominium',
    towers: 2,
    totalUnits: 280,
  },
];

export const DEFAULT_PROPERTY_ID = 'prop-001';
