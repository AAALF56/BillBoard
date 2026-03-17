import { useState } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { format, addDays, startOfWeek } from "date-fns";

export default function EmployeeWeeklyRequests() {
  const currentUser = useStore(state => state.currentUser);
  const addRequest = useStore(state => state.addAvailabilityRequest);
  
  const [currentDate] = useState(new Date());
  // Requesting for the next complete Thursday-to-Wednesday period
  const weekStart = addDays(startOfWeek(currentDate, { weekStartsOn: 4 }), 7);
  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));

  const [daysState, setDaysState] = useState(
    weekDays.map(d => ({
      date: format(d, 'yyyy-MM-dd'),
      isOff: false,
      startTime: "09:00",
      endTime: "17:00"
    }))
  );
  const [reason, setReason] = useState("");

  if (!currentUser) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addRequest({
      userId: currentUser.id,
      type: 'WEEKLY',
      startDate: format(weekDays[0], 'yyyy-MM-dd'),
      endDate: format(weekDays[6], 'yyyy-MM-dd'),
      days: daysState,
      reason
    });
    
    setReason("");
    setDaysState(weekDays.map(d => ({
      date: format(d, 'yyyy-MM-dd'),
      isOff: false,
      startTime: "09:00",
      endTime: "17:00"
    })));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Weekly Request</h2>
        <p className="text-muted-foreground mt-2">Submit your time-off or availability for the specific upcoming week.</p>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden mb-8">
        <div className="p-4 border-b bg-muted/10 font-semibold text-lg flex items-center justify-center">
            {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
        </div>
        <form onSubmit={handleSubmit}>
          <div className="divide-y">
              {weekDays.map((date, index) => {
                  const state = daysState[index];
                  return (
                      <div key={state.date} className={`flex flex-col sm:flex-row p-6 transition-colors hover:bg-muted/20`}>
                          <div className="w-full sm:w-48 mb-4 sm:mb-0 shrink-0">
                              <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{format(date, "EEEE")}</div>
                              <div className="text-3xl font-light">
                                  {format(date, "d")} <span className="text-lg text-muted-foreground">{format(date, "MMM")}</span>
                              </div>
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-4 justify-center">
                              <div className="flex items-center space-x-3">
                                <Checkbox 
                                  id={`off-${state.date}`} 
                                  checked={state.isOff}
                                  className="w-5 h-5"
                                  onCheckedChange={(c) => {
                                    const newDays = [...daysState];
                                    newDays[index].isOff = c === true;
                                    setDaysState(newDays);
                                  }}
                                />
                                <Label htmlFor={`off-${state.date}`} className="text-base font-medium cursor-pointer">
                                  I need this day off
                                </Label>
                              </div>
                              
                              {!state.isOff && (
                                <div className="grid grid-cols-2 gap-4 max-w-sm bg-background p-4 rounded-lg border shadow-sm">
                                  <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground">Available From</Label>
                                    <Input 
                                      type="time" 
                                      className="h-10"
                                      value={state.startTime}
                                      onChange={e => {
                                        const newDays = [...daysState];
                                        newDays[index].startTime = e.target.value;
                                        setDaysState(newDays);
                                      }}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label className="text-xs font-semibold text-muted-foreground">Available To</Label>
                                    <Input 
                                      type="time" 
                                      className="h-10"
                                      value={state.endTime}
                                      onChange={e => {
                                        const newDays = [...daysState];
                                        newDays[index].endTime = e.target.value;
                                        setDaysState(newDays);
                                      }}
                                    />
                                  </div>
                                </div>
                              )}
                          </div>
                      </div>
                  );
              })}
          </div>
          
          <div className="p-6 border-t bg-muted/5 space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-semibold">Reason / Comments</Label>
              <Textarea 
                placeholder="Briefly explain any context for this week's requests (optional)"
                className="min-h-[100px]"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto px-8">Submit Weekly Request</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}