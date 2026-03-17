import { useStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, X } from "lucide-react";

export default function AdminRequests() {
  const requests = useStore(state => state.availabilityRequests);
  const users = useStore(state => state.users);
  const updateStatus = useStore(state => state.updateRequestStatus);
  const deleteRequest = useStore(state => state.deleteAvailabilityRequest);

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const processedRequests = requests.filter(r => r.status !== 'PENDING');

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown User';

  const formatDayName = (dayNum?: number) => {
    if (dayNum === undefined) return '';
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNum];
  };

  const RequestCard = ({ req, isProcessed = false }: { req: any, isProcessed?: boolean }) => (
    <Card className="border-border/50 shadow-sm mb-4">
      <CardHeader className="pb-3 border-b bg-muted/10">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{getUserName(req.userId)}</CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Badge variant={req.type === 'WEEKLY' ? 'default' : 'secondary'} className="rounded-sm">
                {req.type === 'WEEKLY' ? 'Weekly Schedule' : 'Template Availability'}
              </Badge>
              {isProcessed && (
                <Badge variant={req.status === 'APPROVED' ? 'default' : 'destructive'} className="rounded-sm bg-green-500 hover:bg-green-600 text-white">
                  {req.status}
                </Badge>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {req.type === 'WEEKLY' && req.startDate && req.endDate && (
          <div className="text-sm font-medium mb-2">Requested Week: {req.startDate} to {req.endDate}</div>
        )}
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
           {req.days?.map((d: any, i: number) => (
             <div key={i} className={`p-2 rounded border text-xs ${d.isOff ? 'bg-destructive/10 border-destructive/20 text-destructive font-medium' : 'bg-muted/30 border-border/50'}`}>
               <div className="font-semibold mb-1 opacity-70 uppercase tracking-wide">{d.date ? d.date : formatDayName(d.dayOfWeek)}</div>
               <div>{d.isOff ? 'OFF' : `${d.startTime} - ${d.endTime}`}</div>
             </div>
           ))}
        </div>
        
        {req.reason && (
          <div className="text-sm mt-3">
            <span className="text-muted-foreground font-medium mb-1 block">Reason/Comment:</span>
            <p className="bg-muted/30 p-3 rounded-lg border border-border/50 italic text-foreground/80">{req.reason}</p>
          </div>
        )}
        
        {!isProcessed && (
          <div className="flex gap-3 pt-2">
            <Button className="flex-1 bg-green-600 hover:bg-green-700 text-white" onClick={() => updateStatus(req.id, 'APPROVED')}>
              <Check className="mr-2 h-4 w-4" /> Approve
            </Button>
            <Button className="flex-1" variant="destructive" onClick={() => updateStatus(req.id, 'DENIED')}>
              <X className="mr-2 h-4 w-4" /> Deny
            </Button>
          </div>
        )}
        {isProcessed && req.type === 'TEMPLATE' && req.status === 'APPROVED' && (
           <div className="flex justify-end pt-2 border-t mt-4">
              <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10" onClick={() => deleteRequest(req.id)}>
                Remove Template
              </Button>
           </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Requests</h2>
        <p className="text-muted-foreground mt-2">Manage employee availability and schedule requests.</p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-[400px] grid-cols-2">
          <TabsTrigger value="pending">
            Pending ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="processed">
            Processed ({processedRequests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          {pendingRequests.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
              No pending requests to review.
            </div>
          ) : (
            pendingRequests.map(req => <RequestCard key={req.id} req={req} />)
          )}
        </TabsContent>
        
        <TabsContent value="processed" className="mt-6">
          {processedRequests.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-xl text-muted-foreground bg-muted/5">
              No processed requests history.
            </div>
          ) : (
            processedRequests.map(req => <RequestCard key={req.id} req={req} isProcessed />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}