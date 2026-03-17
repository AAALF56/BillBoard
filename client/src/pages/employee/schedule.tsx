import { useState } from "react";
import { useStore, ShiftType, Shift } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, User as UserIcon } from "lucide-react";
import { format, addDays, startOfWeek } from "date-fns";

export default function EmployeeSchedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const users = useStore(state => state.users);
  const shiftTypes = useStore(state => state.shiftTypes);
  const shifts = useStore(state => state.shifts);
  
  const employees = users.filter(u => u.role === 'EMPLOYEE');
  
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 4 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Full Schedule</h2>
        <p className="text-muted-foreground mt-2">View the team schedule for the week.</p>
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
        
        <div className="overflow-x-auto touch-pan-x">
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
                <div key={employee.id} className="grid grid-cols-[200px_repeat(7,1fr)] border-b last:border-b-0 hover:bg-muted/5 transition-colors">
                  <div className="p-4 font-medium flex items-center gap-3 border-r bg-background">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">
                      {employee.name.charAt(0)}
                    </div>
                    <span className="truncate">{employee.name}</span>
                  </div>
                  
                  {weekDays.map(date => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const cellShifts = shifts.filter(s => s.userId === employee.id && s.date === dateStr);
                    
                    return (
                      <div key={dateStr} className="p-2 border-r last:border-r-0 min-h-[80px] bg-background">
                          {cellShifts.map(shift => {
                            const shiftType = shiftTypes.find(st => st.id === shift.shiftTypeId);
                            if (!shiftType) return null;
                            return (
                               <div key={shift.id} style={{ backgroundColor: shiftType.color }} className="text-white p-2 rounded-md shadow-sm mb-2 text-xs flex flex-col gap-1 border border-white/20">
                                  <span className="font-semibold truncate">{shiftType.name}</span>
                                  <span className="opacity-90">{shiftType.startTime} - {shiftType.endTime}</span>
                               </div>
                            );
                          })}
                      </div>
                    );
                  })}
                </div>
              ))}
          </div>
        </div>
      </Card>
    </div>
  );
}