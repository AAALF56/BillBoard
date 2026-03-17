import { useState } from "react";
import { useStore, ShiftType, Shift, User } from "@/store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Clock, CalendarDays, RefreshCw } from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

export default function EmployeeMyShifts() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentUser = useStore(state => state.currentUser);
  const users = useStore(state => state.users);
  const shiftTypes = useStore(state => state.shiftTypes);
  const shifts = useStore(state => state.shifts);
  const addSwapRequest = useStore(state => state.addSwapRequest);
  
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [selectedMyShift, setSelectedMyShift] = useState<Shift | null>(null);
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>("");
  const [targetShiftId, setTargetShiftId] = useState<string>("");
  
  if (!currentUser) return null;

  const employees = users.filter(u => u.role === 'EMPLOYEE' && u.id !== currentUser.id);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 4 });
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const handlePrevWeek = () => setCurrentDate(addDays(currentDate, -7));
  const handleNextWeek = () => setCurrentDate(addDays(currentDate, 7));

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMyShift && targetEmployeeId && targetShiftId) {
      addSwapRequest({
        requesterId: currentUser.id,
        requesterShiftId: selectedMyShift.id,
        targetUserId: targetEmployeeId,
        targetShiftId: targetShiftId
      });
      setIsSwapOpen(false);
      setSelectedMyShift(null);
      setTargetEmployeeId("");
      setTargetShiftId("");
    }
  };

  const getTargetEmployeeShifts = () => {
    if (!targetEmployeeId) return [];
    // Only show shifts in the future for swapping
    const todayStr = format(new Date(), "yyyy-MM-dd");
    return shifts.filter(s => s.userId === targetEmployeeId && s.date >= todayStr);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">My Shifts</h2>
        <p className="text-muted-foreground mt-2">Your upcoming schedule for this period.</p>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden mb-8">
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
        
        <div className="divide-y">
            {weekDays.map(date => {
                const dateStr = format(date, "yyyy-MM-dd");
                const dayShifts = shifts.filter(s => s.userId === currentUser.id && s.date === dateStr);
                const isToday = isSameDay(date, new Date());
                
                return (
                    <div key={dateStr} className={`flex flex-col sm:flex-row p-6 transition-colors ${isToday ? 'bg-primary/5' : 'hover:bg-muted/20'}`}>
                        <div className="w-full sm:w-48 mb-4 sm:mb-0 shrink-0">
                            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{format(date, "EEEE")}</div>
                            <div className={`text-3xl font-light ${isToday ? 'text-primary font-medium' : ''}`}>
                                {format(date, "d")} <span className="text-lg text-muted-foreground">{format(date, "MMM")}</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex flex-col gap-3">
                            {dayShifts.length === 0 ? (
                                <div className="h-full flex items-center text-muted-foreground italic bg-muted/10 rounded-lg p-4 border border-dashed">
                                    Off Duty
                                </div>
                            ) : (
                                dayShifts.map(shift => {
                                    const shiftType = shiftTypes.find(st => st.id === shift.shiftTypeId);
                                    if (!shiftType) return null;
                                    return (
                                        <div key={shift.id} className="relative overflow-hidden rounded-xl border p-4 shadow-sm bg-background" style={{ borderLeftColor: shiftType.color, borderLeftWidth: '6px' }}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-semibold text-lg">{shiftType.name}</h4>
                                                    <div className="flex items-center text-muted-foreground mt-2 gap-4 text-sm font-medium">
                                                        <span className="flex items-center bg-muted px-2.5 py-1 rounded-md">
                                                            <Clock className="w-4 h-4 mr-2" />
                                                            {shiftType.startTime} - {shiftType.endTime}
                                                        </span>
                                                    </div>
                                                </div>
                                                {date >= new Date() && (
                                                  <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="hidden sm:flex"
                                                    onClick={() => {
                                                      setSelectedMyShift(shift);
                                                      setIsSwapOpen(true);
                                                    }}
                                                  >
                                                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Swap
                                                  </Button>
                                                )}
                                            </div>
                                            {/* Mobile swap button */}
                                            {date >= new Date() && (
                                              <Button 
                                                variant="outline" 
                                                size="sm" 
                                                className="w-full mt-3 sm:hidden"
                                                onClick={() => {
                                                  setSelectedMyShift(shift);
                                                  setIsSwapOpen(true);
                                                }}
                                              >
                                                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Request Swap
                                              </Button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
      </Card>

      <Dialog open={isSwapOpen} onOpenChange={setIsSwapOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Shift Swap</DialogTitle>
          </DialogHeader>
          {selectedMyShift && (
            <form onSubmit={handleSwapSubmit} className="space-y-4 pt-4">
              <div className="p-3 bg-muted/20 border rounded-lg text-sm mb-4">
                <span className="font-semibold block mb-1">Your Shift to Trade:</span>
                {format(new Date(selectedMyShift.date), "EEEE, MMM d, yyyy")} • {shiftTypes.find(st => st.id === selectedMyShift.shiftTypeId)?.name}
              </div>

              <div className="space-y-2">
                <Label>Select Employee to Swap With</Label>
                <Select value={targetEmployeeId} onValueChange={(v) => {
                  setTargetEmployeeId(v);
                  setTargetShiftId(""); // reset shift when employee changes
                }}>
                  <SelectTrigger><SelectValue placeholder="Select coworker" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              {targetEmployeeId && (
                <div className="space-y-2">
                  <Label>Select Their Shift</Label>
                  <Select value={targetShiftId} onValueChange={setTargetShiftId}>
                    <SelectTrigger><SelectValue placeholder="Select shift to take" /></SelectTrigger>
                    <SelectContent>
                      {getTargetEmployeeShifts().map(shift => {
                        const type = shiftTypes.find(st => st.id === shift.shiftTypeId);
                        return (
                          <SelectItem key={shift.id} value={shift.id}>
                            {format(new Date(shift.date), "MMM d")} - {type?.name} ({type?.startTime}-{type?.endTime})
                          </SelectItem>
                        );
                      })}
                      {getTargetEmployeeShifts().length === 0 && (
                         <SelectItem value="none" disabled>No future shifts available</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsSwapOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={!targetEmployeeId || !targetShiftId}>Submit Request</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}