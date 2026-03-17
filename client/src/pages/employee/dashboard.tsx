import { useStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock, Calendar as CalendarIcon, Inbox, CalendarSync } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function EmployeeDashboard() {
  const currentUser = useStore(state => state.currentUser);
  const shifts = useStore(state => state.shifts);
  const requests = useStore(state => state.availabilityRequests);
  
  if (!currentUser) return null;

  const myShifts = shifts.filter(s => s.userId === currentUser.id);
  const myRequests = requests.filter(r => r.userId === currentUser.id);
  const pendingRequests = myRequests.filter(r => r.status === 'PENDING').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome, {currentUser.name}</h2>
        <p className="text-muted-foreground mt-2">Here's your schedule overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-all bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Shifts</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{myShifts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled this week</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="md:col-span-2 lg:col-span-4">
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
              <CardDescription>Manage your time and view the schedule.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <Link href="/employee/my-shifts">
                <Button className="w-full justify-start h-12" variant="outline">
                  <Clock className="mr-2 h-4 w-4" /> View My Shifts
                </Button>
              </Link>
              <Link href="/employee/schedule">
                <Button className="w-full justify-start h-12" variant="outline">
                  <CalendarIcon className="mr-2 h-4 w-4" /> View Full Schedule
                </Button>
              </Link>
              <Link href="/employee/weekly-requests">
                <Button className="w-full justify-start h-12" variant="outline">
                  <Inbox className="mr-2 h-4 w-4" /> Weekly Request
                </Button>
              </Link>
              <Link href="/employee/availability">
                <Button className="w-full justify-start h-12" variant="outline">
                  <CalendarSync className="mr-2 h-4 w-4" /> Availability Template
                </Button>
              </Link>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}