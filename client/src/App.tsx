import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/layout/AppLayout";
import { useStore } from "@/store";
import { useEffect } from "react";

// Pages
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminSchedule from "@/pages/admin/schedule";
import AdminShiftBank from "@/pages/admin/shift-bank";
import AdminRequests from "@/pages/admin/requests";
import AdminUsers from "@/pages/admin/users";

// Employee Pages
import EmployeeDashboard from "@/pages/employee/dashboard";
import EmployeeMyShifts from "@/pages/employee/my-shifts";
import EmployeeSchedule from "@/pages/employee/schedule";
import EmployeeWeeklyRequests from "@/pages/employee/weekly-requests";
import EmployeeAvailability from "@/pages/employee/availability";
import EmployeeSwaps from "@/pages/employee/swaps";

function ProtectedRoute({ component: Component, roleRequired, ...rest }: any) {
  const currentUser = useStore((state) => state.currentUser);
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!currentUser) {
      setLocation("/");
    } else if (roleRequired && currentUser.role !== roleRequired) {
      setLocation(currentUser.role === "ADMIN" ? "/admin" : "/employee");
    }
  }, [currentUser, setLocation, roleRequired]);

  if (!currentUser) return null;
  if (roleRequired && currentUser.role !== roleRequired) return null;

  return <Component {...rest} />;
}

function Router() {
  const currentUser = useStore((state) => state.currentUser);
  
  return (
    <Switch>
      <Route path="/" component={currentUser ? () => {
         const [, setLocation] = useLocation();
         useEffect(() => {
           setLocation(currentUser.role === "ADMIN" ? "/admin" : "/employee");
         }, []);
         return null;
      } : Login} />
      
      {/* Admin Routes */}
      <Route path="/admin">
        {() => <AppLayout><ProtectedRoute component={AdminDashboard} roleRequired="ADMIN" /></AppLayout>}
      </Route>
      <Route path="/admin/schedule">
        {() => <AppLayout><ProtectedRoute component={AdminSchedule} roleRequired="ADMIN" /></AppLayout>}
      </Route>
      <Route path="/admin/shift-bank">
        {() => <AppLayout><ProtectedRoute component={AdminShiftBank} roleRequired="ADMIN" /></AppLayout>}
      </Route>
      <Route path="/admin/requests">
        {() => <AppLayout><ProtectedRoute component={AdminRequests} roleRequired="ADMIN" /></AppLayout>}
      </Route>
      <Route path="/admin/users">
        {() => <AppLayout><ProtectedRoute component={AdminUsers} roleRequired="ADMIN" /></AppLayout>}
      </Route>

      {/* Employee Routes */}
      <Route path="/employee">
        {() => <AppLayout><ProtectedRoute component={EmployeeDashboard} roleRequired="EMPLOYEE" /></AppLayout>}
      </Route>
      <Route path="/employee/my-shifts">
        {() => <AppLayout><ProtectedRoute component={EmployeeMyShifts} roleRequired="EMPLOYEE" /></AppLayout>}
      </Route>
      <Route path="/employee/schedule">
        {() => <AppLayout><ProtectedRoute component={EmployeeSchedule} roleRequired="EMPLOYEE" /></AppLayout>}
      </Route>
      <Route path="/employee/swaps">
        {() => <AppLayout><ProtectedRoute component={EmployeeSwaps} roleRequired="EMPLOYEE" /></AppLayout>}
      </Route>
      <Route path="/employee/weekly-requests">
        {() => <AppLayout><ProtectedRoute component={EmployeeWeeklyRequests} roleRequired="EMPLOYEE" /></AppLayout>}
      </Route>
      <Route path="/employee/availability">
        {() => <AppLayout><ProtectedRoute component={EmployeeAvailability} roleRequired="EMPLOYEE" /></AppLayout>}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;