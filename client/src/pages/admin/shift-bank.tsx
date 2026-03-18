import { useState } from "react";
import { useStore, ShiftType } from "@/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2 } from "lucide-react";

export default function AdminShiftBank() {
  const shiftTypes = useStore(state => state.shiftTypes);
  const addShiftType = useStore(state => state.addShiftType);
  const updateShiftType = useStore(state => state.updateShiftType);
  const deleteShiftType = useStore(state => state.deleteShiftType);
  
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    color: "#3b82f6",
    startTime: "09:00",
    endTime: "17:00",
    maxPerWeek: 14,
    category: "ANY" as "FULL_TIME" | "PART_TIME" | "ANY"
  });

  const handleOpenDialog = (shift?: ShiftType) => {
    if (shift) {
      setFormData({
        name: shift.name,
        color: shift.color,
        startTime: shift.startTime,
        endTime: shift.endTime,
        maxPerWeek: shift.maxPerWeek ?? 14,
        category: shift.category ?? "ANY"
      });
      setEditingId(shift.id);
    } else {
      setFormData({
        name: "",
        color: "#3b82f6",
        startTime: "09:00",
        endTime: "17:00",
        maxPerWeek: 14,
        category: "ANY"
      });
      setEditingId(null);
    }
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateShiftType(editingId, formData);
    } else {
      addShiftType(formData);
    }
    setIsOpen(false);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Shift Bank</h2>
          <p className="text-muted-foreground mt-2">Create and manage reusable shift blocks.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="shrink-0">
          <Plus className="mr-2 h-4 w-4" /> Add Shift Type
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shiftTypes.map(shift => (
          <Card key={shift.id} className="overflow-hidden border-border/50">
            <div className="h-3 w-full" style={{ backgroundColor: shift.color }} />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center justify-between">
                {shift.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium bg-muted px-3 py-1.5 rounded-md inline-block">
                {shift.startTime} - {shift.endTime}
              </div>
              <div className="flex gap-2 mt-2">
                <div className="text-xs text-muted-foreground bg-background border px-2 py-0.5 rounded">
                  Max: <span className="font-semibold text-foreground">{shift.maxPerWeek ?? '∞'}</span>
                </div>
                {shift.category && shift.category !== 'ANY' && (
                  <div className="text-xs text-muted-foreground bg-background border px-2 py-0.5 rounded">
                    {shift.category === 'FULL_TIME' ? 'Full-Time' : 'Part-Time'}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-end gap-2 border-t mt-4 py-3 bg-muted/20">
              <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(shift)}>
                <Edit2 className="h-4 w-4 mr-1.5" /> Edit
              </Button>
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteShiftType(shift.id)}>
                <Trash2 className="h-4 w-4 mr-1.5" /> Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
        {shiftTypes.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl bg-muted/10">
            <p className="text-muted-foreground">No shift types created yet.</p>
          </div>
        )}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Shift Type" : "Create New Shift Type"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="name">Shift Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Morning Server"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime" 
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime" 
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxPerWeek">Max Instances Per Week</Label>
              <Input 
                id="maxPerWeek" 
                type="number"
                min="1"
                value={formData.maxPerWeek}
                onChange={(e) => setFormData({...formData, maxPerWeek: parseInt(e.target.value) || 0})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Worker Category</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v: "FULL_TIME" | "PART_TIME" | "ANY") => setFormData({...formData, category: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANY">Any / No Restriction</SelectItem>
                  <SelectItem value="FULL_TIME">Full-Time Only</SelectItem>
                  <SelectItem value="PART_TIME">Part-Time Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color Code</Label>
              <div className="flex gap-2 items-center">
                <Input 
                  id="color" 
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="w-14 h-10 p-1 cursor-pointer"
                />
                <Input 
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({...formData, color: e.target.value})}
                  className="flex-1 font-mono uppercase"
                  pattern="^#+([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$"
                />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit">{editingId ? "Save Changes" : "Create Shift"}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}