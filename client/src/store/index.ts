import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export type Role = 'ADMIN' | 'EMPLOYEE';

export interface User {
  id: string;
  name: string;
  username: string;
  role: Role;
  password?: string;
}

export interface ShiftType {
  id: string;
  name: string;
  color: string;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

export interface Shift {
  id: string;
  userId: string;
  shiftTypeId: string;
  date: string; // YYYY-MM-DD
}

export type RequestStatus = 'PENDING' | 'APPROVED' | 'DENIED';

export interface AvailabilityRequest {
  id: string;
  userId: string;
  type: 'WEEKLY' | 'TEMPLATE';
  startDate?: string; // For WEEKLY
  endDate?: string;   // For WEEKLY
  dayOfWeek?: number; // 0-6 for TEMPLATE
  startTime: string;
  endTime: string;
  reason: string;
  status: RequestStatus;
}

export interface SwapRequest {
  id: string;
  requesterId: string;
  requesterShiftId: string;
  targetUserId: string;
  targetShiftId: string;
  status: RequestStatus;
}

interface AppState {
  currentUser: User | null;
  users: User[];
  shiftTypes: ShiftType[];
  shifts: Shift[];
  availabilityRequests: AvailabilityRequest[];
  swapRequests: SwapRequest[];

  // Actions
  login: (username: string) => void;
  logout: () => void;
  
  // Admin actions
  addUser: (user: Omit<User, 'id'>) => void;
  deleteUser: (id: string) => void;
  addShiftType: (shiftType: Omit<ShiftType, 'id'>) => void;
  updateShiftType: (id: string, shiftType: Partial<ShiftType>) => void;
  deleteShiftType: (id: string) => void;
  
  // Schedule
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (id: string, shift: Partial<Shift>) => void;
  deleteShift: (id: string) => void;
  autoSchedule: (weekStartDate: string) => void;

  // Requests
  addAvailabilityRequest: (req: Omit<AvailabilityRequest, 'id' | 'status'>) => void;
  updateRequestStatus: (id: string, status: RequestStatus) => void;
  deleteAvailabilityRequest: (id: string) => void;
  
  addSwapRequest: (req: Omit<SwapRequest, 'id' | 'status'>) => void;
  updateSwapStatus: (id: string, status: RequestStatus) => void;
}

const mockUsers: User[] = [
  { id: '1', name: 'Admin User', username: 'admin', role: 'ADMIN' },
  { id: '2', name: 'John Doe', username: 'john', role: 'EMPLOYEE' },
  { id: '3', name: 'Jane Smith', username: 'jane', role: 'EMPLOYEE' },
];

const mockShiftTypes: ShiftType[] = [
  { id: '1', name: 'Morning', color: '#3b82f6', startTime: '09:00', endTime: '17:00' },
  { id: '2', name: 'Evening', color: '#8b5cf6', startTime: '17:00', endTime: '01:00' },
  { id: '3', name: 'Night', color: '#1e3a8a', startTime: '01:00', endTime: '09:00' },
];

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      users: mockUsers,
      shiftTypes: mockShiftTypes,
      shifts: [],
      availabilityRequests: [],
      swapRequests: [],

      login: (username) => set((state) => ({ 
        currentUser: state.users.find(u => u.username === username) || null 
      })),
      logout: () => set({ currentUser: null }),

      addUser: (user) => set((state) => ({ 
        users: [...state.users, { ...user, id: uuidv4() }] 
      })),
      deleteUser: (id) => set((state) => ({ 
        users: state.users.filter(u => u.id !== id) 
      })),

      addShiftType: (st) => set((state) => ({ 
        shiftTypes: [...state.shiftTypes, { ...st, id: uuidv4() }] 
      })),
      updateShiftType: (id, st) => set((state) => ({
        shiftTypes: state.shiftTypes.map(s => s.id === id ? { ...s, ...st } : s)
      })),
      deleteShiftType: (id) => set((state) => ({
        shiftTypes: state.shiftTypes.filter(s => s.id !== id)
      })),

      addShift: (shift) => set((state) => ({
        shifts: [...state.shifts, { ...shift, id: uuidv4() }]
      })),
      updateShift: (id, shift) => set((state) => ({
        shifts: state.shifts.map(s => s.id === id ? { ...s, ...shift } : s)
      })),
      deleteShift: (id) => set((state) => ({
        shifts: state.shifts.filter(s => s.id !== id)
      })),

      addAvailabilityRequest: (req) => set((state) => ({
        availabilityRequests: [...state.availabilityRequests, { ...req, id: uuidv4(), status: 'PENDING' }]
      })),
      updateRequestStatus: (id, status) => set((state) => ({
        availabilityRequests: state.availabilityRequests.map(r => r.id === id ? { ...r, status } : r)
      })),
      deleteAvailabilityRequest: (id) => set((state) => ({
        availabilityRequests: state.availabilityRequests.filter(r => r.id !== id)
      })),

      addSwapRequest: (req) => set((state) => ({
        swapRequests: [...state.swapRequests, { ...req, id: uuidv4(), status: 'PENDING' }]
      })),
      updateSwapStatus: (id, status) => set((state) => ({
        swapRequests: state.swapRequests.map(r => r.id === id ? { ...r, status } : r)
      })),

      autoSchedule: (weekStartDate) => {
        // Very basic auto-schedule logic for demo
        // In a real app, this would respect 10-hour gaps, requests, etc.
        const state = get();
        const employees = state.users.filter(u => u.role === 'EMPLOYEE');
        if (employees.length === 0 || state.shiftTypes.length === 0) return;

        const newShifts: Shift[] = [];
        // Loop through 7 days (Thu - Wed)
        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStartDate);
          date.setDate(date.getDate() + i);
          const dateString = date.toISOString().split('T')[0];

          // Assign one random shift to each employee (simplified demo logic)
          employees.forEach((emp, index) => {
             const shiftType = state.shiftTypes[index % state.shiftTypes.length];
             newShifts.push({
               id: uuidv4(),
               userId: emp.id,
               shiftTypeId: shiftType.id,
               date: dateString
             });
          });
        }
        
        set((state) => ({ shifts: [...state.shifts, ...newShifts] }));
      }
    }),
    {
      name: 'billboard-storage',
    }
  )
);