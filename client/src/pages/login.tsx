import { useStore } from "@/store";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Layers } from "lucide-react";

export default function Login() {
  const [username, setUsername] = useState("");
  const login = useStore((state) => state.login);
  const [, setLocation] = useLocation();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username) {
      login(username);
      // Determine route based on user role
      const user = useStore.getState().users.find(u => u.username === username);
      if (user?.role === "ADMIN") {
        setLocation("/admin");
      } else if (user?.role === "EMPLOYEE") {
        setLocation("/employee");
      } else {
         setLocation("/");
      }
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col items-center justify-center p-4">
      <div className="mb-8 flex items-center gap-3 text-3xl font-bold text-primary">
         <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
           <Layers size={24} strokeWidth={2.5} />
         </div>
         Bill Board
      </div>
      <Card className="w-full max-w-md shadow-lg border-border/50">
        <CardHeader className="space-y-1 text-center pb-8">
          <CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
          <CardDescription>
            Enter your username to access your schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                placeholder="e.g. admin or john" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-base rounded-lg">
              Sign In
            </Button>
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center">
             <p className="text-sm text-muted-foreground mb-4 font-medium">Demo Accounts:</p>
             <div className="flex justify-center gap-4">
               <Button variant="outline" size="sm" onClick={() => setUsername("admin")}>admin (Admin)</Button>
               <Button variant="outline" size="sm" onClick={() => setUsername("john")}>john (Employee)</Button>
             </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}