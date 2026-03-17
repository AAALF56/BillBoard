import { useState } from "react";
import { useStore } from "@/store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

const WEEK_DAYS = ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];
const DAY_OFFSETS = [4, 5, 6, 0, 1, 2, 3]; // JS getDay() mapping

export default function EmployeeAvailability() {
  const currentUser = useStore(state => state.currentUser);
  const addRequest = useStore(state => state.addAvailabilityRequest);

  const [daysState, setDaysState] = useState(
    WEEK_DAYS.map((name, i) => ({
      dayOfWeek: DAY_OFFSETS[i],
      name,
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
      type: 'TEMPLATE',
      days: daysState,
      reason
    });
    
    setReason("");
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Availability Template</h2>
        <p className="text-muted-foreground mt-2">Set your long-term recurring availability preferences for each day.</p>
      </div>

      <Card className="border-border/50 shadow-sm overflow-hidden mb-8">
        <form onSubmit={handleSubmit}>
          <div className="divide-y">
              {daysState.map((state, index) => {
                  return (
                      <div key={state.name} className={`flex flex-col sm:flex-row p-6 transition-colors hover:bg-muted/20`}>
                          <div className="w-full sm:w-48 mb-4 sm:mb-0 shrink-0 flex items-center">
                              <div className="text-2xl font-light tracking-tight">{state.name}</div>
                          </div>
                          
                          <div className="flex-1 flex flex-col gap-4 justify-center">
                              <div className="flex items-center space-x-3">
                                <Checkbox 
                                  id={`off-${state.name}`} 
                                  checked={state.isOff}
                                  className="w-5 h-5"
                                  onCheckedChange={(c) => {
                                    const newDays = [...daysState];
                                    newDays[index].isOff = c === true;
                                    setDaysState(newDays);
                                  }}
                                />
                                <Label htmlFor={`off-${state.name}`} className="text-base font-medium cursor-pointer">
                                  I am unavailable on this day
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
              <Label className="text-base font-semibold">General Comments</Label>
              <Textarea 
                placeholder="Any additional notes about your typical availability..."
                className="min-h-[100px]"
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
            <Button type="submit" size="lg" className="w-full sm:w-auto px-8">Save Template Request</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}