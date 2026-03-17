import { useState } from "react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, UserCog, Shield, User } from "lucide-react";

export default function AdminUsers() {
  const users = useStore(state => state.users);
  const currentUser = useStore(state => state.currentUser);
  const addUser = useStore(state => state.addUser);
  const deleteUser = useStore(state => state.deleteUser);
  
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    role: "EMPLOYEE" as "ADMIN" | "EMPLOYEE",
    password: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addUser(formData);
    setIsOpen(false);
    setFormData({ name: "", username: "", role: "EMPLOYEE", password: "" });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Staff Management</h2>
          <p className="text-muted-foreground mt-2">Manage employee and admin accounts.</p>
        </div>
        <Button onClick={() => setIsOpen(true)} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Add User
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {users.map(user => (
          <Card key={user.id} className="border-border/50 shadow-sm relative overflow-hidden">
            {user.role === 'ADMIN' && (
              <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                <div className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider py-1 text-center rotate-45 transform origin-top-right translate-y-4 translate-x-4">
                  ADMIN
                </div>
              </div>
            )}
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${user.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                  {user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg leading-tight">{user.name}</h3>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                    <UserCog size={14} />
                    @{user.username}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-medium mt-2">
                    {user.role === 'ADMIN' ? (
                       <span className="flex items-center text-primary bg-primary/10 px-2 py-0.5 rounded-full"><Shield size={12} className="mr-1" /> Admin</span>
                    ) : (
                       <span className="flex items-center text-muted-foreground bg-muted px-2 py-0.5 rounded-full"><User size={12} className="mr-1" /> Employee</span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
            {user.id !== currentUser?.id && (
              <CardFooter className="border-t bg-muted/20 py-3 flex justify-end">
                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteUser(user.id)}>
                  <Trash2 className="h-4 w-4 mr-1.5" /> Remove
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. John Doe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="e.g. jdoe"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Initial Password</Label>
              <Input 
                id="password" 
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Account Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(v: "ADMIN" | "EMPLOYEE") => setFormData({...formData, role: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYEE">Employee</SelectItem>
                  <SelectItem value="ADMIN">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">Create Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}