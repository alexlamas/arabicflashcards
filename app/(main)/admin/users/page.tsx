"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AdminService, AdminUser } from "../../../services/adminService";
import { Trash2, Plus, Loader2, RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [togglingRole, setTogglingRole] = useState<string | null>(null);

  // Delete user confirmation state
  const [userToDelete, setUserToDelete] = useState<{ id: string; email: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add user state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserForm, setAddUserForm] = useState({ email: "", password: "" });
  const [addingUser, setAddingUser] = useState(false);

  // Reset onboarding state
  const [resettingOnboardingUserId, setResettingOnboardingUserId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [usersData, rolesResponse] = await Promise.all([
        AdminService.getAllUsers(),
        fetch('/api/admin/roles').then(r => r.json()),
      ]);
      setUsers(usersData);
      setUserRoles(rolesResponse);
    } catch {
      toast({
        variant: "destructive",
        title: "Failed to load users",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDeleteUser() {
    if (!userToDelete) return;
    setIsDeleting(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userToDelete.id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete user');
      }

      toast({
        title: "User deleted",
        description: `${userToDelete.email} has been removed`,
      });
      setUserToDelete(null);
      loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete user",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleAddUser() {
    if (!addUserForm.email || !addUserForm.password) return;
    setAddingUser(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addUserForm),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create user');
      }

      toast({
        title: "User created",
        description: `${addUserForm.email} has been added`,
      });
      setIsAddingUser(false);
      setAddUserForm({ email: "", password: "" });
      loadData();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to create user",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setAddingUser(false);
    }
  }

  async function handleResetOnboarding(userId: string) {
    setResettingOnboardingUserId(userId);
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action: 'reset_onboarding' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reset onboarding');
      }

      toast({
        title: "Onboarding reset",
        description: "User will see onboarding on next login",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to reset onboarding",
        description: error instanceof Error ? error.message : "An error occurred",
      });
    } finally {
      setResettingOnboardingUserId(null);
    }
  }

  async function handleRoleChange(userId: string, newRole: 'admin' | 'reviewer' | 'standard') {
    setTogglingRole(userId);
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      if (newRole === 'standard') {
        setUserRoles(prev => ({ ...prev, [userId]: [] }));
      } else {
        setUserRoles(prev => ({ ...prev, [userId]: [newRole] }));
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to update role",
        description: error instanceof Error ? error.message : "An error occurred",
      });
      loadData();
    } finally {
      setTogglingRole(null);
    }
  }

  return (
    <div className="p-4 pt-12 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-semibold">Users</h1>
        <Button size="sm" variant="outline" className="rounded-full" onClick={() => setIsAddingUser(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add user
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
          <p className="font-medium mb-2">Admin RLS policies not configured</p>
          <p>Run the SQL in <code className="bg-amber-100 px-1 rounded">supabase/005_admin_rls_policies.sql</code> in your Supabase SQL editor to enable admin access to all user data.</p>
        </div>
      ) : (
        <>
          {/* Mobile: Card layout */}
          <div className="md:hidden space-y-3">
            {users.map((user) => {
              const roles = userRoles[user.id] || [];
              const currentRole = roles.includes('admin') ? 'admin' : roles.includes('reviewer') ? 'reviewer' : 'standard';
              const isCurrentUser = user.id === session?.user?.id;

              return (
                <div key={user.id} className="border rounded-xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">{user.email}</p>
                      <p className="text-xs text-gray-500">
                        {user.word_count} words · Joined {new Date(user.created_at).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Last login: {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                        {" · "}
                        Last review: {user.last_review_date ? new Date(user.last_review_date).toLocaleDateString() : "Never"}
                      </p>
                    </div>
                    {user.email_confirmed ? (
                      <span className="text-green-600 text-xs bg-green-50 px-2 py-0.5 rounded-full flex-shrink-0">Confirmed</span>
                    ) : (
                      <span className="text-amber-600 text-xs bg-amber-50 px-2 py-0.5 rounded-full flex-shrink-0">Pending</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={currentRole}
                      onValueChange={(value) => handleRoleChange(user.id, value as 'admin' | 'reviewer' | 'standard')}
                      disabled={togglingRole === user.id || isCurrentUser}
                    >
                      <SelectTrigger className="flex-1 h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">Standard</SelectItem>
                        <SelectItem value="reviewer">Reviewer</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-9 px-3"
                      onClick={() => handleResetOnboarding(user.id)}
                      disabled={resettingOnboardingUserId === user.id}
                      title="Reset onboarding"
                    >
                      {resettingOnboardingUserId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <RotateCcw className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-500 h-9 px-3"
                      onClick={() => setUserToDelete({ id: user.id, email: user.email })}
                      disabled={isCurrentUser}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop: Table layout */}
          <Table className="hidden md:table">
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Roles</TableHead>
                <TableHead>Words</TableHead>
                <TableHead>Last login</TableHead>
                <TableHead>Last review</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const roles = userRoles[user.id] || [];
                const currentRole = roles.includes('admin') ? 'admin' : roles.includes('reviewer') ? 'reviewer' : 'standard';
                const isCurrentUser = user.id === session?.user?.id;

                return (
                  <TableRow key={user.id}>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.email_confirmed ? (
                        <span className="text-green-600 text-xs">Confirmed</span>
                      ) : (
                        <span className="text-amber-600 text-xs">Pending</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={currentRole}
                        onValueChange={(value) => handleRoleChange(user.id, value as 'admin' | 'reviewer' | 'standard')}
                        disabled={togglingRole === user.id || isCurrentUser}
                      >
                        <SelectTrigger className="w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="reviewer">Reviewer</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>{user.word_count}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {user.last_review_date ? new Date(user.last_review_date).toLocaleDateString() : "Never"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleResetOnboarding(user.id)}
                          disabled={resettingOnboardingUserId === user.id}
                          title="Reset onboarding"
                        >
                          {resettingOnboardingUserId === user.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RotateCcw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-red-500"
                          onClick={() => setUserToDelete({ id: user.id, email: user.email })}
                          disabled={isCurrentUser}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </>
      )}

      {/* Delete User Confirmation Dialog */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-medium text-foreground">{userToDelete?.email}</span> and all their data including words, progress, and settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add User Dialog */}
      <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add user</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={addUserForm.email}
                onChange={(e) => setAddUserForm({ ...addUserForm, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                value={addUserForm.password}
                onChange={(e) => setAddUserForm({ ...addUserForm, password: e.target.value })}
                placeholder="Minimum 6 characters"
              />
            </div>
            <Button onClick={handleAddUser} disabled={addingUser || !addUserForm.email || !addUserForm.password} className="w-full">
              {addingUser ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
              Create user
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
