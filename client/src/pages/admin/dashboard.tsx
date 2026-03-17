import { useStore } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Calendar as CalendarIcon, Clock, Inbox } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const users = useStore(state => state.users);
  const shifts = useStore(state => state.shifts);
  const shiftTypes = useStore(state => state.shiftTypes);
  const requests = useStore(state => state.availabilityRequests);
  
  const pendingRequests = requests.filter(r => r.status === 'PENDING').length;
  const employeesCount = users.filter(u => u.role === 'EMPLOYEE').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-2">Overview of your scheduling operations.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employeesCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Active employees</p>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Shifts</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shifts.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled this period</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shift Types</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shiftTypes.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Configured blocks</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all bg-primary/5 border-primary/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Inbox className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting approval</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Manage the core areas of your schedule.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Link href="/admin/schedule">
              <Button className="w-full justify-start h-12" variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" /> Go to Weekly Schedule
              </Button>
            </Link>
            <Link href="/admin/requests">
              <Button className="w-full justify-start h-12" variant="outline">
                <Inbox className="mr-2 h-4 w-4" /> Review Time-off Requests
              </Button>
            </Link>
            <Link href="/admin/shift-bank">
              <Button className="w-full justify-start h-12" variant="outline">
                <Clock className="mr-2 h-4 w-4" /> Manage Shift Types
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}