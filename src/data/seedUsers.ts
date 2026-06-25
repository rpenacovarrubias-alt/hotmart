// Initial seed users — passwords are plaintext here only for first-run hashing.
// After hashing, only passwordHash is stored in localStorage; plaintext is never persisted.

import type { UserRole } from '../types';

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;           // Used once to compute hash, then discarded
  propertyAccess: string[];   // [] = access to all properties
  status: 'active' | 'inactive';
  createdAt: string;
}

export const SEED_USERS: SeedUser[] = [
  {
    id: 'u_admin_001',
    name: 'Ricardo Peña',
    email: 'rpenacovarrubias@gmail.com',
    phone: '442 131 4203',
    role: 'admin',
    password: '260912',
    propertyAccess: [],
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'u_mgr_002',
    name: 'María González',
    email: 'maria.g@cohost.mx',
    phone: '442 555 0102',
    role: 'manager',
    password: 'Gerente#2024',
    propertyAccess: [],
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'u_cohost_003',
    name: 'Carlos Ruiz',
    email: 'carlos.r@cohost.mx',
    phone: '442 555 0103',
    role: 'cohost',
    password: 'CoHost#2024',
    propertyAccess: [],
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'u_host_004',
    name: 'Ana Torres',
    email: 'ana.t@cohost.mx',
    phone: '442 555 0104',
    role: 'host',
    password: 'Anfitri0n#2024',
    propertyAccess: ['1', '2'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'u_clean_005',
    name: 'Jorge Limpieza',
    email: 'jorge.l@cohost.mx',
    phone: '442 555 0105',
    role: 'cleaning_staff',
    password: 'Limp!eza2024',
    propertyAccess: ['1', '2', '3'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'u_maint_006',
    name: 'Roberto Mantenimiento',
    email: 'roberto.m@cohost.mx',
    phone: '442 555 0106',
    role: 'maintenance_staff',
    password: 'Mant3nim!2024',
    propertyAccess: ['1', '2', '3', '4'],
    status: 'active',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];
