import { useState } from "react";
import { useStore, Shift } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RefreshCw, Plus } from "lucide-react";
import { format } from "date-fns";

// Helper to parse dates correctly
function parseISO(dateString: string) {
  if (!dateString) return new Date();
  const [year, month, day] = dateString.split('-');
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
}

export default function EmployeeSwaps() {
  const currentUser = useStore(state => state.currentUser);
  const users = useStore(state => state.users);
  const shiftTypes = useStore(state => state.shiftTypes);
  const shifts = useStore(state => state.shifts);
  const addSwapRequest = useStore(state => state.addSwapRequest);
  const swapRequests = useStore(state => state.swapRequests);
  
  const [isSwapOpen, setIsSwapOpen] = useState(false);
  const [selectedMyShiftId, setSelectedMyShiftId] = useState<string>("");
  const [targetEmployeeId, setTargetEmployeeId] = useState<string>("");
  const [targetShiftId, setTargetShiftId] = useState<string>("");
  
  if (!currentUser) return null;

  const employees = users.filter(u => u.role === 'EMPLOYEE' && u.id !== currentUser.id);

  // Future shifts for current user
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const myFutureShifts = shifts.filter(s => s.userId === currentUser.id && s.date >= todayStr);

  const handleSwapSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMyShiftId && targetEmployeeId && targetShiftId) {
      addSwapRequest({
        requesterId: currentUser.id,
        requesterShiftId: selectedMyShiftId,
        targetUserId: targetEmployeeId,
        targetShiftId: targetShiftId
      });
      setIsSwapOpen(false);
      setSelectedMyShiftId("");
      setTargetEmployeeId("");
      setTargetShiftId("");
    }
  };

  const getTargetEmployeeShifts = () => {
    if (!targetEmployeeId) return [];
    return shifts.filter(s => s.userId === targetEmployeeId && s.date >= todayStr);
  };

  const mySwapRequests = swapRequests.filter(r => r.requesterId === currentUser.id || r.targetUserId === currentUser.id);
  const pendingRequests = mySwapRequests.filter(r => r.status === 'PENDING');
  const pastRequests = mySwapRequests.filter(r => r.status !== 'PENDING');

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';

  const SwapCard = ({ swap }: { swap: any }) => {
    const rShift = shifts.find(s => s.id === swap.requesterShiftId);
    const tShift = shifts.find(s => s.id === swap.targetShiftId);
    const rType = shiftTypes.find(st => st.id === rShift?.shiftTypeId);
    const tType = shiftTypes.find(st => st.id === tShift?.shiftTypeId);
    
    const isRequester = swap.requesterId === currentUser.id;

    return (
      <Card className="border-border/50 shadow-sm mb-4">
        <CardHeader className="pb-3 border-b bg-muted/5">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <RefreshCw size={16} className="text-blue-500" />
                {isRequester ? `You requested a swap with ${getUserName(swap.targetUserId)}` : `${getUserName(swap.requesterId)} requested a swap with you`}
              </CardTitle>
            </div>
            <Badge variant={swap.status === 'APPROVED' ? 'default' : swap.status === 'DENIED' ? 'destructive' : 'secondary'} className={swap.status === 'APPROVED' ? 'bg-green-500 hover:bg-green-600 text-white' : ''}>
              {swap.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="flex items-center justify-between gap-4 p-3 bg-muted/10 rounded-lg border border-border/50 text-sm">
            <div className="flex-1">
              <div className="text-muted-foreground mb-1">{isRequester ? 'You give away:' : 'They give away:'}</div>
              {rShift && rType ? (
                <div className="font-medium">
                  {format(parseISO(rShift.date), "MMM d, yyyy")} • {rType.name}
                </div>
              ) : <div className="text-destructive italic">Shift deleted</div>}
            </div>
            
            <div className="text-muted-foreground bg-background rounded-full p-1.5 border shadow-sm shrink-0">
              <RefreshCw size={16} />
            </div>

            <div className="flex-1 text-right">
              <div className="text-muted-foreground mb-1">{isRequester ? 'You get:' : 'They get:'}</div>
              {tShift && tType ? (
                <div className="font-medium">
                  {format(parseISO(tShift.date), "MMM d, yyyy")} • {tType.name}
                </div>
              ) : <div className="text-destructive italic">Shift deleted</div>}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shift Swaps</h2>
          <p className="text-muted-foreground mt-2">Manage your shift swap requests with other employees.</p>
        </div>
        <Button onClick={() => setIsSwapOpen(true)} className="shrink-0 bg-primary">
          <Plus className="mr-2 h-4 w-4" /> New Swap Request
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h3 className="font-semibold mb-4 text-lg border-b pb-2">Pending Swaps</h3>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
              No pending swap requests.
            </div>
          ) : (
            pendingRequests.map(swap => <SwapCard key={swap.id} swap={swap} />)
          )}
        </div>
        
        <div>
          <h3 className="font-semibold mb-4 text-lg border-b pb-2">Past Swaps</h3>
          {pastRequests.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
              No swap history.
            </div>
          ) : (
            pastRequests.map(swap => <SwapCard key={swap.id} swap={swap} />)
          )}
        </div>
      </div>

      <Dialog open={isSwapOpen} onOpenChange={setIsSwapOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Request Shift Swap</DialogTitle>
            <DialogDescription>Trade one of your upcoming shifts for a coworker's shift.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSwapSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Select Your Shift to Give Away</Label>
              <Select value={selectedMyShiftId} onValueChange={setSelectedMyShiftId}>
                <SelectTrigger><SelectValue placeholder="Choose your shift..." /></SelectTrigger>
                <SelectContent>
                  {myFutureShifts.map(shift => {
                    const type = shiftTypes.find(st => st.id === shift.shiftTypeId);
                    if (!type) return null;
                    return (
                      <SelectItem key={shift.id} value={shift.id}>
                        {format(parseISO(shift.date), "EEE, MMM d")} - {type.name} ({type.startTime}-{type.endTime})
                      </SelectItem>
                    );
                  })}
                  {myFutureShifts.length === 0 && (
                     <SelectItem value="none" disabled>No future shifts available to swap</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            {selectedMyShiftId && (
              <div className="space-y-2">
                <Label>Select Coworker</Label>
                <Select value={targetEmployeeId} onValueChange={(v) => {
                  setTargetEmployeeId(v);
                  setTargetShiftId(""); 
                }}>
                  <SelectTrigger><SelectValue placeholder="Choose someone to swap with..." /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}

            {targetEmployeeId && (
              <div className="space-y-2">
                <Label>Select Their Shift to Take</Label>
                <Select value={targetShiftId} onValueChange={setTargetShiftId}>
                  <SelectTrigger><SelectValue placeholder="Choose a shift..." /></SelectTrigger>
                  <SelectContent>
                    {getTargetEmployeeShifts().map(shift => {
                      const type = shiftTypes.find(st => st.id === shift.shiftTypeId);
                      if (!type) return null;
                      
                      const selectedMyShift = shifts.find(s => s.id === selectedMyShiftId);
                      const hasShiftSameDay = shifts.some(s => s.userId === currentUser.id && s.date === shift.date && s.id !== selectedMyShift?.id);
                      if (hasShiftSameDay) return null;

                      return (
                        <SelectItem key={shift.id} value={shift.id}>
                          {format(parseISO(shift.date), "EEE, MMM d")} - {type.name} ({type.startTime}-{type.endTime})
                        </SelectItem>
                      );
                    })}
                    {getTargetEmployeeShifts().length === 0 && (
                       <SelectItem value="none" disabled>No eligible shifts available to swap</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <DialogFooter className="pt-4 mt-2">
              <Button type="button" variant="outline" onClick={() => {
                setIsSwapOpen(false);
                setSelectedMyShiftId("");
                setTargetEmployeeId("");
                setTargetShiftId("");
              }}>Cancel</Button>
              <Button type="submit" disabled={!selectedMyShiftId || !targetEmployeeId || !targetShiftId} className="bg-primary">
                <RefreshCw className="w-4 h-4 mr-2" /> Submit Swap Request
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}