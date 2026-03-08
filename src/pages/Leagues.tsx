import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import type { DropResult } from "react-beautiful-dnd";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";
import { LeagueT } from "@/types/league.type";
import {
  deleteLeague,
  getAllLeagues,
  postLeague,
  putLeague,
} from "@/apiConfig/league.api";

interface LeagueFormData {
  name: string;
  country: string;
  logo_url: string;
  sort_order: number;
}

interface UpdateSortOrderResult {
  partialSuccess?: boolean;
  failedCount?: number;
  [key: string]: any;
}

export default function Leagues() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLeague, setEditingLeague] = useState<LeagueT | null>(null);
  const [formData, setFormData] = useState<LeagueFormData>({
    name: "",
    country: "",
    logo_url: "",
    sort_order: 0,
  });
  const [dragging, setDragging] = useState(false);

  const onDragEnd = (result: DropResult) => {
    setDragging(false);

    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    // Reorder the leagues
    const items = Array.from(leagues || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update sort orders
    //@ts-ignore
    updateSortOrderMutation.mutate(items);
  };

  const {
    data: leagues,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["leagues"],
    queryFn: async () => {
      const response = await getAllLeagues();
      if (!response.success) throw new Error(response.error);
      return (
        response.data?.sort(
          (a: LeagueT, b: LeagueT) => (a.sort_order || 0) - (b.sort_order || 0)
        ) || []
      );
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: Omit<LeagueFormData, "sort_order">) => {
      const response = await postLeague(data as LeagueT);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
      toast.success("League created successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", country: "", logo_url: "", sort_order: 0 });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create league");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: Omit<LeagueFormData, "sort_order">;
    }) => {
      const response = await putLeague(id, data as LeagueT);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
      toast.success("League updated successfully");
      setIsDialogOpen(false);
      setEditingLeague(null);
      setFormData({ name: "", country: "", logo_url: "", sort_order: 0 });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update league");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteLeague(id);
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
      toast.success("League deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete league");
    },
  });

  // Update league sort orders
  const updateSortOrderMutation = useMutation({
    mutationFn: async (updatedLeagues: LeagueT[]) => {
      const promises = updatedLeagues.map(async (league, index) => {
        try {
          const result = await putLeague(league.id, {
            name: league.name,
            country: league.country,
            logo_url: league.logo_url,
            sort_order: index,
          } as LeagueT);
          return result;
        } catch (error: any) {
          // If it's a column error, try without sort_order
          if (
            error.message &&
            (error.message.includes("sort_order") ||
              error.message.includes("column"))
          ) {
            try {
              const result = await putLeague(league.id, {
                name: league.name,
                country: league.country,
                logo_url: league.logo_url,
              } as LeagueT);
              return result;
            } catch (retryError: any) {
              return { success: false, error: retryError.message };
            }
          }

          // Return a failed result structure
          return { success: false, error: error.message };
        }
      });

      const results = await Promise.all(promises);

      // Check if all updates were successful
      // Handle both successful responses and potential errors
      const failedUpdates = results.filter(
        (result) => !result || result.success === false || !!result.error
      );
      if (failedUpdates.length > 0) {
        // Even if some updates failed, we'll still show a partial success message
        if (failedUpdates.length < results.length) {
          return { partialSuccess: true, failedCount: failedUpdates.length };
        }
        throw new Error(`Failed to update ${failedUpdates.length} league(s)`);
      }

      return results;
    },
    onSuccess: (data: UpdateSortOrderResult | any[]) => {
      queryClient.invalidateQueries({ queryKey: ["leagues"] });
      if (data && typeof data === "object" && "partialSuccess" in data) {
        toast.success(
          `League order updated with ${
            (data as UpdateSortOrderResult).failedCount
          } failures`
        );
      } else {
        toast.success("League order updated successfully");
      }
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update league order");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingLeague) {
      updateMutation.mutate({
        id: editingLeague.id,
        data: {
          name: formData.name,
          country: formData.country,
          logo_url: formData.logo_url,
        },
      });
    } else {
      createMutation.mutate({
        name: formData.name,
        country: formData.country,
        logo_url: formData.logo_url,
      });
    }
  };

  const handleEdit = (league: LeagueT) => {
    setEditingLeague(league);
    setFormData({
      name: league.name,
      country: league.country,
      logo_url: league.logo_url || "",
      sort_order: league.sort_order || 0,
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingLeague(null);
    setFormData({ name: "", country: "", logo_url: "", sort_order: 0 });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Leagues</h1>
          <p className="text-muted-foreground">Manage football leagues</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add League
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLeague ? "Edit League" : "Create League"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">League Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Premier League"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="e.g., England"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo_url">Logo URL</Label>
                <Input
                  id="logo_url"
                  value={formData.logo_url}
                  onChange={(e) =>
                    setFormData({ ...formData, logo_url: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sort_order: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="0"
                />
                <p className="text-sm text-muted-foreground">
                  Lower numbers appear first
                </p>
              </div>
              {editingLeague && (
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (auto-generated)</Label>
                  <Input
                    id="slug"
                    value={editingLeague.slug || ""}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDialogClose}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLeague ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <DragDropContext onDragEnd={onDragEnd}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drag</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Sort Id</TableHead>
                <TableHead>Logo</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <Droppable droppableId="leagues">
              {(provided) => (
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-red-500"
                      >
                        Error: {error.message}
                      </TableCell>
                    </TableRow>
                  ) : leagues?.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground"
                      >
                        No leagues found. Create your first league!
                      </TableCell>
                    </TableRow>
                  ) : (
                    leagues?.map((league: LeagueT, index: number) => (
                      <Draggable
                        key={league.id}
                        draggableId={league.id.toString()}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <TableRow
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={snapshot.isDragging ? "bg-accent" : ""}
                          >
                            <TableCell>
                              <GripVertical className="h-4 w-4 cursor-move" />
                            </TableCell>
                            <TableCell>{league.id}</TableCell>
                            <TableCell>{league.sort_order}</TableCell>
                            <TableCell>
                              {league.logo_url ? (
                                <img
                                  src={league.logo_url}
                                  alt={league.name}
                                  className="w-10 h-10 object-contain rounded"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs">
                                  {league.name.charAt(0)}
                                </div>
                              )}
                            </TableCell>

                            <TableCell className="font-medium">
                              {league.name}
                            </TableCell>
                            <TableCell>{league.country}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex gap-2 justify-end">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleEdit(league)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    deleteMutation.mutate(league.id)
                                  }
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Draggable>
                    ))
                  )}
                  {provided.placeholder}
                </TableBody>
              )}
            </Droppable>
          </Table>
        </DragDropContext>
      </div>
    </div>
  );
}
