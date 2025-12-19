import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import * as teamService from "@/services/teamService";
import * as leagueService from "@/services/leagueService";

export default function Teams() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [filterLeagueId, setFilterLeagueId] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    short_code: "",
    logo_url: "",
    country: "",
    team_type: "club" as 'club' | 'country',
    league_id: undefined as number | undefined,
    venue: "",
  });

  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamService.getAllTeams();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });

  const { data: leagues } = useQuery({
    queryKey: ["leagues"],
    queryFn: async () => {
      const response = await leagueService.getAllLeagues();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const response = await teamService.createTeam(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team created successfully");
      setIsDialogOpen(false);
      setFormData({ name: "", short_code: "", logo_url: "", country: "", team_type: "club", league_id: undefined, venue: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create team");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: typeof formData;
    }) => {
      const response = await teamService.updateTeam(id, data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team updated successfully");
      setIsDialogOpen(false);
      setEditingTeam(null);
      setFormData({ name: "", short_code: "", logo_url: "", country: "", team_type: "club", league_id: undefined, venue: "" });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update team");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await teamService.deleteTeam(id);
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete team");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.team_id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (team: any) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      short_code: team.short_code,
      logo_url: team.logo_url || "",
      country: team.country,
      team_type: team.team_type || "club",
      league_id: team.league_id || undefined,
      venue: team.venue || "",
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTeam(null);
    setFormData({ name: "", short_code: "", logo_url: "", country: "", team_type: "club", league_id: undefined, venue: "" });
  };

  // Filter teams by league
  const filteredTeams = teams?.filter((team) => {
    if (filterLeagueId === "all") return true;
    if (filterLeagueId === "none") return !team.league_id;
    return team.league_id === parseInt(filterLeagueId);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">Manage football teams</p>
        </div>
        <div className="flex gap-2">
          <Select value={filterLeagueId} onValueChange={setFilterLeagueId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by league" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {leagues?.map((league) => (
                <SelectItem key={league.league_id} value={league.league_id!.toString()}>
                  {league.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTeam ? "Edit Team" : "Create Team"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Team Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g., Arsenal"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="short_code">Short Code</Label>
                <Input
                  id="short_code"
                  value={formData.short_code}
                  onChange={(e) =>
                    setFormData({ ...formData, short_code: e.target.value })
                  }
                  placeholder="e.g., ARS"
                  maxLength={100}
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
                <Label htmlFor="team_type">Team Type</Label>
                <select
                  id="team_type"
                  value={formData.team_type}
                  onChange={(e) =>
                    setFormData({ ...formData, team_type: e.target.value as 'club' | 'country' })
                  }
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="club">Club</option>
                  <option value="country">National Team</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="league_id">League (Optional)</Label>
                <Select
                  value={formData.league_id?.toString() || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, league_id: value === "none" ? undefined : parseInt(value) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a league" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {leagues?.map((league) => (
                      <SelectItem key={league.league_id} value={league.league_id!.toString()}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">Venue (Optional)</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                  placeholder="e.g., Emirates Stadium"
                />
              </div>
              {editingTeam && (
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (auto-generated)</Label>
                  <Input
                    id="slug"
                    value={editingTeam.slug || ""}
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
                  {editingTeam ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>No.</TableHead>
              <TableHead>Logo</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredTeams?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  {filterLeagueId === "all" ? "No teams found. Create your first team!" : "No teams found for this filter."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTeams?.map((team, index) => (
                <TableRow key={team.team_id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    {team.logo_url ? (
                      <img
                        src={team.logo_url}
                        alt={team.name}
                        className="w-10 h-10 object-contain rounded"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-muted rounded flex items-center justify-center text-xs">
                        {team.short_code}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-medium">{team.name}</TableCell>
                  <TableCell>{team.short_code}</TableCell>
                  <TableCell>{team.country}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {team.team_type === 'country' ? 'National' : 'Club'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(team)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteMutation.mutate(team.team_id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
