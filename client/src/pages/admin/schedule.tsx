import { useState } from "react";
import { useStore, ShiftType, Shift } from "@/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronLeft, ChevronRight, Wand2, Plus, GripVertical, Trash2 } from "lucide-react";
import { format, addDays, startOfWeek, parseISO, isSameDay } from "date-fns";

const SortableShift = ({ shift, shiftType, onDelete }: { shift: Shift, shiftType: ShiftType, onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: shift.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: shiftType.color,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group text-white p-2 rounded-md shadow-sm mb-2 text-xs flex flex-col gap-1 border border-white/20">
      <div className="flex justify-between items-start">
        <span className="font-semibold truncate pr-4">{shiftType.name}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(shift.id); }}
          className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 text-white/80 hover:text-white hover:bg-white/20 p-0.5 rounded transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex items-center justify-between mt-1 opacity-90">
         <span>{shiftType.startTime} - {shiftType.endTime}</span>
         <div {...attributes} {...listeners} className="cursor-grab hover:text-white p-0.5 rounded hover:bg-white/20">
           <GripVertical size={12} />
         </div>
      </div>
    </div>
  );
};

export default function AdminSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const users = useStore(state => state.users);
  const shiftTypes = useStore(state => state.shiftTypes);
  const shifts = useStore(state => state.shifts);
  const addShift = useStore(state => state.addShift);
  const deleteShift = useStore(state => state.deleteShift);
  const autoSchedule = useStore(state => state.autoSchedule);
  
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedShiftType, setSelectedShiftType] = useState<string>("");

  const employees = users.filter(u => u.role === 'EMPLOYEE');
  
  // Thursday to Wednesday week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 4 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // In a real app, this would update the shift's date/user based on where it was dropped
      // Requires more complex DndKit setup with multiple containers (one per cell)
      console.log(`Moved ${active.id} to ${over.id}`);
    }
  };

  const handleAddShiftSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser && selectedDate && selectedShiftType) {
      addShift({
        userId: selectedUser,
        date: selectedDate,
        shiftTypeId: selectedShiftType
      });
      setIsAddOpen(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Weekly Schedule</h2>
          <p className="text-muted-foreground mt-2">Manage the Thursday - Wednesday rotation.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => autoSchedule(weekStart.toISOString())}>
            <Wand2 className="mr-2 h-4 w-4 text-purple-500" /> Auto-Fill
          </Button>
          <Button onClick={() => setIsAddOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Shift
          </Button>
        </div>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-muted/10">
          <Button variant="ghost" size="icon" onClick={handlePrevWeek}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="font-semibold text-lg">
            {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
          </div>
          <Button variant="ghost" size="icon" onClick={handleNextWeek}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <div className="min-w-[1000px]">
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-[200px_repeat(7,1fr)] bg-muted/20 border-b">
                <div className="p-4 font-semibold text-muted-foreground border-r">Employee</div>
                {weekDays.map(date => (
                  <div key={date.toISOString()} className="p-3 text-center border-r last:border-r-0">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{format(date, "EEE")}</div>
                    <div className="font-semibold text-foreground">{format(date, "d")}</div>
                  </div>
                ))}
              </div>

              {employees.map(employee => (
                <div key={employee.id} className="grid grid-cols-[200px_repeat(7,1fr)] border-b last:border-b-0 group">
                  <div className="p-4 font-medium flex items-center gap-3 border-r bg-background group-hover:bg-muted/10 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                      {employee.name.charAt(0)}
                    </div>
                    <span className="truncate">{employee.name}</span>
                  </div>
                  
                  {weekDays.map(date => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const cellShifts = shifts.filter(s => s.userId === employee.id && s.date === dateStr);
                    
                    return (
                      <div key={dateStr} className="p-2 border-r last:border-r-0 min-h-[100px] bg-background group-hover:bg-muted/5 transition-colors relative"
                           onClick={() => {
                             setSelectedUser(employee.id);
                             setSelectedDate(dateStr);
                             setIsAddOpen(true);
                           }}>
                        <SortableContext items={cellShifts.map(s => s.id)} strategy={horizontalListSortingStrategy}>
                          {cellShifts.map(shift => {
                            const shiftType = shiftTypes.find(st => st.id === shift.shiftTypeId);
                            if (!shiftType) return null;
                            return <SortableShift key={shift.id} shift={shift} shiftType={shiftType} onDelete={deleteShift} />;
                          })}
                        </SortableContext>
                        <div className="absolute inset-0 opacity-0 hover:opacity-100 flex items-center justify-center bg-muted/10 cursor-pointer pointer-events-none transition-opacity">
                           <Plus className="text-muted-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </DndContext>
          </div>
        </div>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Shift</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddShiftSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Employee</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger><SelectValue placeholder="Select employee" /></SelectTrigger>
                <SelectContent>
                  {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input 
                type="date" 
                value={selectedDate} 
                onChange={(e) => setSelectedDate(e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <Label>Shift Type</Label>
              <Select value={selectedShiftType} onValueChange={setSelectedShiftType}>
                <SelectTrigger><SelectValue placeholder="Select shift block" /></SelectTrigger>
                <SelectContent>
                  {shiftTypes.map(st => (
                    <SelectItem key={st.id} value={st.id}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }} />
                        {st.name} ({st.startTime} - {st.endTime})
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button type="submit">Assign</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}