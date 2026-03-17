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

export interface DayTimeRange {
  date?: string; // For WEEKLY
  dayOfWeek?: number; // 0-6 for TEMPLATE
  startTime: string;
  endTime: string;
  isOff: boolean; // if true, requesting whole day off
}

export interface AvailabilityRequest {
  id: string;
  userId: string;
  type: 'WEEKLY' | 'TEMPLATE';
  startDate?: string; // For WEEKLY
  endDate?: string;   // For WEEKLY
  days: DayTimeRange[];
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
  { id: '4', name: 'Mike Johnson', username: 'mike', role: 'EMPLOYEE' },
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
        const state = get();
        const employees = state.users.filter(u => u.role === 'EMPLOYEE');
        if (employees.length === 0 || state.shiftTypes.length === 0) return;

        const newShifts: Shift[] = [];
        
        // Generate the 7 days array using local time correctly to avoid timezone shifting issues
        const weekDays: {dateString: string, dayOfWeek: number, isWeekend: boolean}[] = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date(weekStartDate);
          date.setDate(date.getDate() + i);
          
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          const d = String(date.getDate()).padStart(2, '0');
          const localDateString = `${y}-${m}-${d}`;
          
          weekDays.push({
             dateString: localDateString,
             dayOfWeek: date.getDay(),
             isWeekend: date.getDay() === 0 || date.getDay() === 6
          });
        }
        
        // Track off days safely as an array of indices per employee
        const employeeDaysOff = new Map<string, number[]>();
        
        // Ensure everyone gets at least 2 days off
        employees.forEach(emp => {
           let offIndices: number[] = [];
           
           // 1. If they have approved time off, use those first
           weekDays.forEach((day, index) => {
              const hasTimeOff = state.availabilityRequests.some(req => {
                if (req.status !== 'APPROVED' || req.userId !== emp.id) return false;
                return req.days.some(d => {
                  if (req.type === 'WEEKLY' && d.date === day.dateString && d.isOff) return true;
                  if (req.type === 'TEMPLATE' && d.dayOfWeek === day.dayOfWeek && d.isOff) return true;
                  return false;
                });
              });
              
              if (hasTimeOff) {
                 offIndices.push(index);
              }
           });
           
           // 2. Fill the rest with random days if they don't have enough requested days off
           while (offIndices.length < 2) {
              const r = Math.floor(Math.random() * 7);
              if (!offIndices.includes(r)) {
                 offIndices.push(r);
              }
           }
           
           employeeDaysOff.set(emp.id, offIndices);
        });

        // Loop through the 7 days to assign shifts
        weekDays.forEach((day, dayIndex) => {
          employees.forEach((emp, empIndex) => {
             // 1. Check if it's their designated day off
             const offIndices = employeeDaysOff.get(emp.id) || [];
             if (offIndices.includes(dayIndex)) return; // Skip scheduling

             // 2. Check if they already have a shift today
             const hasShiftAlready = state.shifts.some(s => s.userId === emp.id && s.date === day.dateString) || newShifts.some(s => s.userId === emp.id && s.date === day.dateString);
             if (hasShiftAlready) return;

             // 3. Find a valid shift type that respects the 10-hour gap from yesterday
             let assignedShiftType: ShiftType | null = null;
             const sortedShiftTypes = [...state.shiftTypes];
             const shiftTypeStartIndex = (dayIndex + empIndex) % sortedShiftTypes.length;
             
             for (let i = 0; i < sortedShiftTypes.length; i++) {
                const potentialShift = sortedShiftTypes[(shiftTypeStartIndex + i) % sortedShiftTypes.length];
                
                if (dayIndex > 0) {
                   const prevDay = weekDays[dayIndex - 1].dateString;
                   const prevShiftData = newShifts.find(s => s.userId === emp.id && s.date === prevDay) || 
                                         state.shifts.find(s => s.userId === emp.id && s.date === prevDay);
                   
                   if (prevShiftData) {
                      const prevShiftType = state.shiftTypes.find(st => st.id === prevShiftData.shiftTypeId);
                      if (prevShiftType) {
                         const prevEndHour = parseInt(prevShiftType.endTime.split(':')[0]);
                         const actualPrevEndHour = prevEndHour < parseInt(prevShiftType.startTime.split(':')[0]) ? prevEndHour + 24 : prevEndHour;
                         
                         const nextStartHour = parseInt(potentialShift.startTime.split(':')[0]);
                         const actualNextStartHour = nextStartHour + 24; // It's the next day
                         
                         const gapHours = actualNextStartHour - actualPrevEndHour;
                         
                         if (gapHours >= 10) {
                            assignedShiftType = potentialShift;
                            break; 
                         }
                      }
                   } else {
                      assignedShiftType = potentialShift;
                      break;
                   }
                } else {
                   assignedShiftType = potentialShift;
                   break;
                }
             }

             if (assignedShiftType) {
               newShifts.push({
                 id: uuidv4(),
                 userId: emp.id,
                 shiftTypeId: assignedShiftType.id,
                 date: day.dateString
               });
             }
          });
        });
        
        set((state) => {
          return { shifts: [...state.shifts, ...newShifts] }
        });
      }
    }),
    {
      name: 'billboard-storage',
    }
  )
);