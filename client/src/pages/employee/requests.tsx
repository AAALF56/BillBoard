import { useState } from "react";
import { useStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function EmployeeRequests() {
  const currentUser = useStore(state => state.currentUser);
  const requests = useStore(state => state.availabilityRequests);
  const addRequest = useStore(state => state.addAvailabilityRequest);

  const [activeTab, setActiveTab] = useState("weekly");
  const [formData, setFormData] = useState({
    type: "WEEKLY" as "WEEKLY" | "TEMPLATE",
    startDate: "",
    endDate: "",
    dayOfWeek: "0", // 0 = Sunday
    startTime: "01:00",
    endTime: "23:59",
    reason: ""
  });

  if (!currentUser) return null;

  const myRequests = requests.filter(r => r.userId === currentUser.id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRequest({
      userId: currentUser.id,
      type: formData.type,
      startDate: formData.type === 'WEEKLY' ? formData.startDate : undefined,
      endDate: formData.type === 'WEEKLY' ? formData.endDate : undefined,
      dayOfWeek: formData.type === 'TEMPLATE' ? parseInt(formData.dayOfWeek) : undefined,
      startTime: formData.startTime,
      endTime: formData.endTime,
      reason: formData.reason
    });
    // Reset form
    setFormData({ ...formData, reason: "" });
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'APPROVED': return 'bg-green-500 hover:bg-green-600 text-white';
      case 'DENIED': return 'bg-destructive hover:bg-destructive/90 text-white';
      default: return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    }
  };

  const formatDay = (dayNum?: number) => {
    if (dayNum === undefined) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Time & Schedule Requests</h2>
        <p className="text-muted-foreground mt-2">Submit availability templates or specific weekly time-off.</p>
      </div>

      <div className="grid md:grid-cols-[1fr_300px] gap-8">
        <div>
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>New Request</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={(v) => {
                setActiveTab(v);
                setFormData({...formData, type: v === 'weekly' ? 'WEEKLY' : 'TEMPLATE'});
              }}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="weekly">Specific Week</TabsTrigger>
                  <TabsTrigger value="template">Long-term Template</TabsTrigger>
                </TabsList>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  {activeTab === 'weekly' ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startDate">Start Date</Label>
                        <Input id="startDate" type="date" required value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endDate">End Date</Label>
                        <Input id="endDate" type="date" required value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Day of Week</Label>
                      <Select value={formData.dayOfWeek} onValueChange={v => setFormData({...formData, dayOfWeek: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="p-4 bg-muted/20 border rounded-lg space-y-4">
                    <Label className="text-base font-semibold">Requested Time Off Range</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="startTime" className="text-xs text-muted-foreground">From</Label>
                        <Input id="startTime" type="time" required value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="endTime" className="text-xs text-muted-foreground">To</Label>
                        <Input id="endTime" type="time" required value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason / Comment</Label>
                    <Textarea 
                      id="reason" 
                      placeholder="Briefly explain why you need this time off..." 
                      rows={3} 
                      required
                      value={formData.reason} 
                      onChange={e => setFormData({...formData, reason: e.target.value})}
                    />
                  </div>

                  <Button type="submit" className="w-full">Submit Request</Button>
                </form>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <h3 className="font-semibold mb-4">My Recent Requests</h3>
          <div className="space-y-3">
            {myRequests.length === 0 ? (
               <div className="text-sm text-muted-foreground border-2 border-dashed p-4 rounded-lg text-center">
                 No history found.
               </div>
            ) : (
               myRequests.map(req => (
                 <Card key={req.id} className="p-3 text-sm border-border/50 shadow-sm">
                   <div className="flex justify-between items-start mb-2">
                     <Badge variant={req.type === 'WEEKLY' ? 'outline' : 'secondary'} className="text-[10px]">
                       {req.type === 'WEEKLY' ? 'Weekly' : 'Template'}
                     </Badge>
                     <Badge className={getStatusColor(req.status)} variant="outline">
                       {req.status}
                     </Badge>
                   </div>
                   <div className="font-medium mt-1">
                     {req.type === 'TEMPLATE' ? formatDay(req.dayOfWeek) : `${req.startDate} to ${req.endDate}`}
                   </div>
                   <div className="text-muted-foreground text-xs mt-1">
                     {req.startTime} - {req.endTime}
                   </div>
                 </Card>
               ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}