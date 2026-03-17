import { useState } from "react";
import { useStore, ShiftType, Shift } from "@/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent, useDraggable, useDroppable } from '@dnd-kit/core';
import { ChevronLeft, ChevronRight, Wand2, GripVertical, Trash2, CalendarDays } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

const DraggableShiftType = ({ shiftType }: { shiftType: ShiftType }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `shifttype-${shiftType.id}`,
    data: { type: 'ShiftType', shiftType }
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  return (
    <div ref={setNodeRef} style={{...style, backgroundColor: shiftType.color}} {...listeners} {...attributes} className="text-white p-2 rounded-md shadow-sm text-xs flex flex-col gap-1 cursor-grab active:cursor-grabbing border border-white/20 hover:scale-105 transition-transform w-32 shrink-0 touch-none">
      <span className="font-semibold truncate">{shiftType.name}</span>
      <span className="opacity-90">{shiftType.startTime} - {shiftType.endTime}</span>
    </div>
  );
};

const DroppableCell = ({ id, children }: { id: string, children: React.ReactNode }) => {
  const { isOver, setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`p-2 border-r last:border-r-0 min-h-[80px] transition-colors ${isOver ? 'bg-primary/10 ring-2 ring-inset ring-primary' : 'bg-background hover:bg-muted/5'}`}>
      {children}
    </div>
  );
};

const DraggableShift = ({ shift, shiftType, onDelete }: { shift: Shift, shiftType: ShiftType, onDelete: (id: string) => void }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ 
    id: shift.id,
    data: { type: 'Shift', shift }
  });
  
  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
    backgroundColor: shiftType.color,
    opacity: isDragging ? 0.5 : 1,
  } : {
    backgroundColor: shiftType.color,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group text-white p-2 rounded-md shadow-sm mb-2 text-xs flex flex-col gap-1 border border-white/20 touch-none">
      <div className="flex justify-between items-start">
        <span className="font-semibold truncate pr-4">{shiftType.name}</span>
        <button 
          onClick={(e) => { e.stopPropagation(); onDelete(shift.id); }}
          className="opacity-0 group-hover:opacity-100 absolute top-1 right-1 text-white/80 hover:text-white hover:bg-white/20 p-0.5 rounded transition-all z-10"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex items-center justify-between mt-1 opacity-90">
         <span>{shiftType.startTime} - {shiftType.endTime}</span>
         <div {...attributes} {...listeners} className="cursor-grab hover:text-white p-0.5 rounded hover:bg-white/20 z-10">
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
  const updateShift = useStore(state => state.updateShift);
  const deleteShift = useStore(state => state.deleteShift);
  const autoSchedule = useStore(state => state.autoSchedule);
  
  const employees = users.filter(u => u.role === 'EMPLOYEE');
  
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
    if (!over) return;

    const overId = String(over.id); 
    if (!overId.includes('|')) return; 
    
    const [targetUserId, targetDate] = overId.split('|');
    const activeData = active.data.current;
    
    if (activeData?.type === 'ShiftType') {
      const shiftType = activeData.shiftType as ShiftType;
      addShift({
        userId: targetUserId,
        date: targetDate,
        shiftTypeId: shiftType.id
      });
    } else if (activeData?.type === 'Shift') {
      const shift = activeData.shift as Shift;
      if (shift.userId !== targetUserId || shift.date !== targetDate) {
        updateShift(shift.id, { userId: targetUserId, date: targetDate });
      }
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Weekly Schedule</h2>
          <p className="text-muted-foreground mt-2">Manage the Thursday - Wednesday rotation.</p>
        </div>
        <Button onClick={() => autoSchedule(weekStart.toISOString())} className="bg-primary shadow-md hover:bg-primary/90">
          <Wand2 className="mr-2 h-4 w-4" /> Auto-Fill Schedule
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {/* Calendar Grid */}
        <Card className="border-border/50 shadow-sm overflow-hidden mb-6">
          <div className="flex items-center justify-between p-4 border-b bg-muted/10">
            <Button variant="outline" size="sm" onClick={handlePrevWeek}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Prev Week
            </Button>
            <div className="font-semibold text-lg flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
            </div>
            <Button variant="outline" size="sm" onClick={handleNextWeek}>
              Next Week <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <div className="min-w-[1000px]">
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
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold shrink-0">
                        {employee.name.charAt(0)}
                      </div>
                      <span className="truncate">{employee.name}</span>
                    </div>
                    
                    {weekDays.map(date => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      const cellId = `${employee.id}|${dateStr}`;
                      const cellShifts = shifts.filter(s => s.userId === employee.id && s.date === dateStr);
                      
                      return (
                        <DroppableCell key={cellId} id={cellId}>
                           {cellShifts.map(shift => {
                              const shiftType = shiftTypes.find(st => st.id === shift.shiftTypeId);
                              if (!shiftType) return null;
                              return <DraggableShift key={shift.id} shift={shift} shiftType={shiftType} onDelete={deleteShift} />;
                            })}
                        </DroppableCell>
                      );
                    })}
                  </div>
                ))}
            </div>
          </div>
        </Card>

        {/* Shift Bank */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 z-40 bg-background/95 backdrop-blur-md border-t shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="max-w-[1400px] mx-auto p-4 flex gap-4 overflow-x-auto items-center">
             <div className="font-semibold text-sm mr-4 shrink-0 text-muted-foreground flex flex-col">
               Shift Bank
               <span className="text-xs font-normal">Drag to assign</span>
             </div>
             {shiftTypes.map(st => (
               <DraggableShiftType key={st.id} shiftType={st} />
             ))}
             {shiftTypes.length === 0 && (
               <div className="text-sm text-muted-foreground italic p-2">No shift types created. Go to Shift Bank to add some.</div>
             )}
          </div>
        </div>
      </DndContext>
    </div>
  );
}