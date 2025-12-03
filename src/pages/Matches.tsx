import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import * as matchService from "@/services/matchService";
import * as leagueService from "@/services/leagueService";
import * as teamService from "@/services/teamService";

export default function Matches() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<any>(null);
  const [formData, setFormData] = useState({
    league_id: "",
    home_team_id: "",
    away_team_id: "",
    match_date: "",
    match_time: "",
    venue: "",
    status: "scheduled",
    allow_draw: true,
    home_score: "",
    away_score: "",
  });

  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches"],
    queryFn: async () => {
      const response = await matchService.getAllMatches();
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

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamService.getAllTeams();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await matchService.createMatch(data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Match created successfully");
      handleDialogClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create match");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await matchService.updateMatch(id, data);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Match updated successfully");
      handleDialogClose();
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update match");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await matchService.deleteMatch(id);
      if (!response.success) throw new Error(response.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Match deleted successfully");
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete match");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      league_id: parseInt(formData.league_id),
      home_team_id: parseInt(formData.home_team_id),
      away_team_id: parseInt(formData.away_team_id),
      match_date: formData.match_date,
      match_time: formData.match_time,
      venue: formData.venue,
      status: formData.status,
      allow_draw: formData.allow_draw,
      ...(formData.status === "finished" && {
        home_score: formData.home_score !== "" ? parseInt(formData.home_score) : null,
        away_score: formData.away_score !== "" ? parseInt(formData.away_score) : null,
      })
    };

    if (editingMatch) {
      updateMutation.mutate({ id: editingMatch.match_id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (match: any) => {
    setEditingMatch(match);
    setFormData({
      league_id: match.league_id.toString(),
      home_team_id: match.home_team_id.toString(),
      away_team_id: match.away_team_id.toString(),
      match_date: match.match_date,
      match_time: match.match_time,
      venue: match.venue || "",
      status: match.status,
      allow_draw: match.allow_draw ?? true,
      home_score: match.home_score?.toString() || "",
      away_score: match.away_score?.toString() || "",
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingMatch(null);
    setFormData({
      league_id: "",
      home_team_id: "",
      away_team_id: "",
      match_date: "",
      match_time: "",
      venue: "",
      status: "scheduled",
      allow_draw: true,
      home_score: "",
      away_score: "",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Matches</h1>
          <p className="text-muted-foreground">Manage football matches</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Match
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingMatch ? "Edit Match" : "Create Match"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="league">League</Label>
                  <Select
                    value={formData.league_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, league_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select league" />
                    </SelectTrigger>
                    <SelectContent>
                      {leagues?.map((league) => (
                        <SelectItem
                          key={league.league_id}
                          value={league.league_id.toString()}
                        >
                          {league.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="finished">Finished</SelectItem>
                      <SelectItem value="postponed">Postponed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="home_team">Home Team</Label>
                  <Select
                    value={formData.home_team_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, home_team_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map((team) => (
                        <SelectItem
                          key={team.team_id}
                          value={team.team_id.toString()}
                        >
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="away_team">Away Team</Label>
                  <Select
                    value={formData.away_team_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, away_team_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams?.map((team) => (
                        <SelectItem
                          key={team.team_id}
                          value={team.team_id.toString()}
                        >
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="match_date">Match Date</Label>
                  <Input
                    id="match_date"
                    type="date"
                    value={formData.match_date}
                    onChange={(e) =>
                      setFormData({ ...formData, match_date: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="match_time">Match Time</Label>
                  <Input
                    id="match_time"
                    type="time"
                    value={formData.match_time}
                    onChange={(e) =>
                      setFormData({ ...formData, match_time: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  value={formData.venue}
                  onChange={(e) =>
                    setFormData({ ...formData, venue: e.target.value })
                  }
                  placeholder="e.g., Emirates Stadium"
                />
              </div>
              <div className="flex items-center justify-between space-x-2">
                <div className="space-y-0.5">
                  <Label htmlFor="allow_draw">Allow Draw</Label>
                  <p className="text-sm text-muted-foreground">
                    Turn off for finals/knockout matches
                  </p>
                </div>
                <Switch
                  id="allow_draw"
                  checked={formData.allow_draw}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allow_draw: checked })
                  }
                />
              </div>
              {formData.status === "finished" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="home_score">Home Score</Label>
                    <Input
                      id="home_score"
                      type="number"
                      min="0"
                      value={formData.home_score}
                      onChange={(e) =>
                        setFormData({ ...formData, home_score: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="away_score">Away Score</Label>
                    <Input
                      id="away_score"
                      type="number"
                      min="0"
                      value={formData.away_score}
                      onChange={(e) =>
                        setFormData({ ...formData, away_score: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
              {editingMatch && (
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (auto-generated)</Label>
                  <Input
                    id="slug"
                    value={editingMatch.slug || ""}
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
                  {editingMatch ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>League</TableHead>
              <TableHead>Home Team</TableHead>
              <TableHead>Away Team</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Status</TableHead>
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
            ) : matches?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center text-muted-foreground"
                >
                  No matches found. Create your first match!
                </TableCell>
              </TableRow>
            ) : (
              matches?.map((match) => (
                <TableRow key={match.match_id}>
                  <TableCell>
                    {leagues?.find(league => league.league_id === match.league_id)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {teams?.find(team => team.team_id === match.home_team_id)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell className="font-medium">
                    {teams?.find(team => team.team_id === match.away_team_id)?.name || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    {format(new Date(match.match_date), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{match.match_time}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        match.status === "scheduled"
                          ? "bg-info/20 text-info"
                          : match.status === "live"
                          ? "bg-success/20 text-success"
                          : match.status === "finished"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => window.open(`/match/${match.match_id}`, '_blank')}
                        title="View public prediction page"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEdit(match)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => deleteMutation.mutate(match.match_id)}
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
