"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { UserPlus, Edit, Trash2, Search } from "lucide-react";
import UserAvatar from "@/components/shared/UserAvatar";
import { UserRoleEnum, UserT } from "@/types/user.type";
import {
  createUser,
  deleteUser,
  getAllUsers,
  updateUser,
} from "@/apiConfig/user.api";

// Helper to build visible page numbers with ellipsis
function getPageRange(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];

  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}

export default function Users() {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserT | null>(null);

  const [filter, setFilter] = useState({
    search: "",
    role: undefined as UserRoleEnum | undefined,
    provider: undefined as string | undefined,
    page: 1,
    limit: 10,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    provider: "email" as "email" | "google",
    password: "",
    role: UserRoleEnum.USER,
    avatar_url: "",
    avatar_bg_color: "#3b82f6",
  });

  /*
  ========================
  FETCH USERS
  ========================
  */

  const { data, isLoading } = useQuery({
    queryKey: ["users", filter],
    queryFn: () => getAllUsers(filter),
  });
  const users = data?.data?.data ?? [];
  const pagination = data?.data?.pagination;

  /*
  ========================
  CREATE USER
  ========================
  */

  const createUserMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully");
      setIsDialogOpen(false);
      resetForm();
    },
  });

  /*
  ========================
  UPDATE USER
  ========================
  */

  const updateUserMutation = useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User updated successfully");
      setIsDialogOpen(false);
      resetForm();
    },
  });

  /*
  ========================
  DELETE USER
  ========================
  */

  const deleteUserMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User deleted successfully");
    },
  });

  /*
  ========================
  FORM HELPERS
  ========================
  */

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: "",
      email: "",
      provider: "email",
      password: "",
      role: UserRoleEnum.USER,
      avatar_url: "",
      avatar_bg_color: "#3b82f6",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
      //@ts-ignore
      updateUserMutation.mutate({
        id: editingUser.id,
        ...formData,
      });
    } else {
      //@ts-ignore
      createUserMutation.mutate({
        ...formData,
      });
    }
  };

  const handleEdit = (user: UserT) => {
    setEditingUser(user);

    setFormData({
      name: user.name,
      email: user.email,
      provider: user.provider as "email" | "google",
      password: "",
      role: user.role,
      avatar_url: user.avatar_url || "",
      avatar_bg_color: user.avatar_bg_color || "#3b82f6",
    });

    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this user?")) {
      deleteUserMutation.mutate(id);
    }
  };

  const handlePageChange = (page: number) => {
    setFilter((prev) => ({ ...prev, page }));
  };

  if (isLoading) return <div className="p-8">Loading users...</div>;

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.page ?? 1;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* HEADER */}

      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">User Management</h1>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingUser ? "Edit User" : "Create User"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label>Provider</Label>
                <Select
                  value={formData.provider}
                  onValueChange={(v) =>
                    setFormData({ ...formData, provider: v as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.provider === "email" && (
                <div>
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </div>
              )}

              <div>
                <Label>Role</Label>
                <Select
                  value={formData.role}
                  onValueChange={(v) =>
                    setFormData({ ...formData, role: v as UserRoleEnum })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="USER">User</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SEED">Seed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* AVATAR URL */}
              <div>
                <Label>Avatar URL</Label>
                <Input
                  type="url"
                  placeholder="https://example.com/avatar.png"
                  value={formData.avatar_url}
                  onChange={(e) =>
                    setFormData({ ...formData, avatar_url: e.target.value })
                  }
                />
                {formData.avatar_url && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={formData.avatar_url}
                      alt="Avatar preview"
                      className="w-8 h-8 rounded-full object-cover border"
                      onError={(e) =>
                        ((e.currentTarget as HTMLImageElement).style.display =
                          "none")
                      }
                    />
                    <span className="text-xs text-muted-foreground">Preview</span>
                  </div>
                )}
              </div>

              {/* AVATAR BG COLOR */}
              <div>
                <Label>Avatar Background Color</Label>
                <div className="flex items-center gap-3 mt-1">
                  <input
                    type="color"
                    value={formData.avatar_bg_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        avatar_bg_color: e.target.value,
                      })
                    }
                    className="w-10 h-10 rounded cursor-pointer border p-0.5 bg-transparent"
                  />
                  <Input
                    value={formData.avatar_bg_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        avatar_bg_color: e.target.value,
                      })
                    }
                    placeholder="#3b82f6"
                    className="font-mono text-sm"
                  />
                  {/* Color preview swatch */}
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0 border"
                    style={{ backgroundColor: formData.avatar_bg_color }}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH + FILTER */}

      <Card className="p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={filter.search}
            onChange={(e) =>
              setFilter({ ...filter, search: e.target.value, page: 1 })
            }
          />
        </div>

        <Select
          value={filter.role ?? "ALL"}
          onValueChange={(v) =>
            setFilter({
              ...filter,
              role: v === "ALL" ? undefined : (v as UserRoleEnum),
              page: 1,
            })
          }
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Role" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="USER">User</SelectItem>
            <SelectItem value="ADMIN">Admin</SelectItem>
            <SelectItem value="SEED">Seed</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* TABLE */}

      <Card className="p-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>

          <TableBody>
            {users.map((user: UserT) => (
              <TableRow key={user.id}>
                <TableCell>
                  <UserAvatar user={user} size="sm" />
                </TableCell>

                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>

                <TableCell>
                  <Badge variant="secondary">{user.provider}</Badge>
                </TableCell>

                <TableCell>
                  <Badge>{user.role}</Badge>
                </TableCell>

                <TableCell>
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>

                <TableCell className="flex gap-2 justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(user)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(user.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* PAGINATION */}

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Page {currentPage} of {totalPages} &mdash;{" "}
              {pagination?.total ?? 0} total users
            </span>

            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() =>
                      currentPage > 1 && handlePageChange(currentPage - 1)
                    }
                    aria-disabled={currentPage === 1}
                    className={
                      currentPage === 1
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {getPageRange(currentPage, totalPages).map((page, i) =>
                  page === "..." ? (
                    <PaginationItem key={`ellipsis-${i}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => handlePageChange(page)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() =>
                      currentPage < totalPages &&
                      handlePageChange(currentPage + 1)
                    }
                    aria-disabled={currentPage === totalPages}
                    className={
                      currentPage === totalPages
                        ? "pointer-events-none opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </Card>
    </div>
  );
}