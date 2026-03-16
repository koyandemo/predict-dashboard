import { useState, useRef } from "react";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
  Plus,
  Pencil,
  Trash2,
  ExternalLink,
  Upload,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getAllLeagues } from "@/apiConfig/league.api";
import { getAllTeams } from "@/apiConfig/team.api";
import {
  postMatch,
  putMatch,
  deleteMatch,
  getAllMatches,
} from "@/apiConfig/match.api";
import { MatchT } from "@/types/match.type";
import { getAllSeasons } from "@/apiConfig/season.api";
import { getAllGameWeeks } from "@/apiConfig/gameWeek.api";

export default function Matches() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<MatchT | null>(null);
  const [homeTeamOpen, setHomeTeamOpen] = useState(false);
  const [awayTeamOpen, setAwayTeamOpen] = useState(false);
  const [filterLeagueId, setFilterLeagueId] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterPublished, setFilterPublished] = useState("all");
  const [filterSeasonId, setFilterSeasonId] = useState("1");
  const [filterGameWeekId, setFilterGameWeekId] = useState("all");
  const [formData, setFormData] = useState({
    league_id: "",
    home_team_id: "",
    away_team_id: "",
    kickoff: "",
    venue: "",
    status: "SCHEDULED",
    allow_draw: true,
    home_score: "",
    away_score: "",
    timezone: "Asia/Bangkok",
    big_match: false,
    derby: false,
    type: "NORMAL" as
      | "NORMAL"
      | "FINAL"
      | "SEMIFINAL"
      | "QUARTERFINAL"
      | "FRIENDLY",
    published: false,
  });

  const { data: matches, isLoading } = useQuery({
    queryKey: ["matches", filterLeagueId, filterStatus, filterPublished,filterSeasonId,filterGameWeekId],
    queryFn: async () => {
      const filters: any = {};
      if (filterLeagueId !== "all") {
        filters.league_id = parseInt(filterLeagueId);
      }
      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }
      if (filterPublished !== "all") {
        filters.published = filterPublished === "published";
      }
      if(filterSeasonId !== "all"){
        filters.season_id = parseInt(filterSeasonId);
      }
      if(filterGameWeekId !== "all"){
        filters.gameweek_id = parseInt(filterGameWeekId);
      }
      const response = await getAllMatches(filters);
      if (!response.success) throw new Error(response.error);
      return response.data?.data;
    },
  });

  const { data: leagues } = useQuery({
    queryKey: ["leagues"],
    queryFn: async () => {
      const response = await getAllLeagues();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });

  const { data: seasons } = useQuery({
    queryKey: ["seasons"],
    queryFn: async () => {
      const response = await getAllSeasons();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });

  const { data: gameWeeks } = useQuery({
    queryKey: ["gameWeeks"],
    queryFn: async () => {
      const response = await getAllGameWeeks();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await getAllTeams();
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await postMatch(data);
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
      const response = await putMatch(id, data);
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
      const response = await deleteMatch(id);
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
      kickoff: formData.kickoff,
      venue: formData.venue,
      status: formData.status,
      allow_draw: formData.allow_draw,
      timezone: formData.timezone,
      big_match: formData.big_match,
      derby: formData.derby,
      type: formData.type,
      published: formData.published,
      ...(formData.status === "finished" && {
        home_score:
          formData.home_score !== "" ? parseInt(formData.home_score) : null,
        away_score:
          formData.away_score !== "" ? parseInt(formData.away_score) : null,
      }),
    };

    if (editingMatch) {
      updateMutation.mutate({ id: editingMatch.id, data });
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
      kickoff: match.kickoff,
      venue: match.venue || "",
      status: match.status,
      allow_draw: match.allow_draw ?? true,
      home_score: match.home_score?.toString() || "",
      away_score: match.away_score?.toString() || "",
      timezone: match.timezone || "Asia/Bangkok",
      big_match: match.big_match ?? false,
      derby: match.derby ?? false,
      type: match.type || "Normal",
      published: match.published ?? false,
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
      kickoff: "",
      venue: "",
      status: "SCHEDULED",
      allow_draw: true,
      home_score: "",
      away_score: "",
      timezone: "Asia/Bangkok",
      big_match: false,
      derby: false,
      type: "NORMAL" as
        | "NORMAL"
        | "FINAL"
        | "SEMIFINAL"
        | "QUARTERFINAL"
        | "FRIENDLY",
      published: false,
    });
  };

  const filteredMatches = matches;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Matches</h1>
          <p className="text-muted-foreground">Manage football matches</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Match
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="w-[200px]">
          <Select value={filterLeagueId} onValueChange={setFilterLeagueId}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by league" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Leagues</SelectItem>
              {leagues?.map((league) => (
                <SelectItem key={league.id} value={league.id!.toString()}>
                  {league.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select value={filterSeasonId} onValueChange={setFilterSeasonId}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Season" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">All Season</SelectItem>
              {seasons?.map((season) => (
                <SelectItem value={season.id+""} key={season.id}>{season.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select value={filterGameWeekId} onValueChange={setFilterGameWeekId}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by Week" />
            </SelectTrigger>
            <SelectContent>
            <SelectItem value="all">All GameWeek</SelectItem>
              {gameWeeks?.map((gameWeek) => (
                <SelectItem value={gameWeek.id}>{gameWeek.number}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="LIVE">Live</SelectItem>
              <SelectItem value="FINISHED">Finished</SelectItem>
              <SelectItem value="POSTPONED">Postponed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="w-[200px]">
          <Select value={filterPublished} onValueChange={setFilterPublished}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by publish status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="unpublished">Unpublished</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                      <SelectItem key={league.id} value={league.id.toString()}>
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
                    <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                    <SelectItem value="LIVE">Live</SelectItem>
                    <SelectItem value="FINISHED">Finished</SelectItem>
                    <SelectItem value="POSTPONED">Postponed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Home Team</Label>
                <Popover open={homeTeamOpen} onOpenChange={setHomeTeamOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={homeTeamOpen}
                      className="w-full justify-between"
                    >
                      {formData.home_team_id
                        ? teams?.find(
                            (team) =>
                              team.id.toString() === formData.home_team_id
                          )?.name
                        : "Select home team..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search team..." />
                      <CommandList>
                        <CommandEmpty>No team found.</CommandEmpty>
                        <CommandGroup>
                          {teams?.map((team) => (
                            <CommandItem
                              key={team.id}
                              value={team.name}
                              onSelect={() => {
                                setFormData({
                                  ...formData,
                                  home_team_id: team.id.toString(),
                                  venue: team.venue || formData.venue,
                                });
                                setHomeTeamOpen(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  formData.home_team_id === team.id.toString()
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {team.name}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <Label>Away Team</Label>
                <Popover open={awayTeamOpen} onOpenChange={setAwayTeamOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={awayTeamOpen}
                      className="w-full justify-between"
                    >
                      {formData.away_team_id
                        ? teams?.find(
                            (team) =>
                              team.id.toString() === formData.away_team_id
                          )?.name
                        : "Select away team..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search team..." />
                      <CommandList className="max-h-64 overflow-y-auto">
                        <CommandEmpty>No team found.</CommandEmpty>
                        <ScrollArea className="h-60">
                          <CommandGroup>
                            {teams?.map((team) => (
                              <CommandItem
                                key={team.id}
                                value={team.name}
                                onSelect={() => {
                                  setFormData({
                                    ...formData,
                                    away_team_id: team.id.toString(),
                                  });
                                  setAwayTeamOpen(false);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.away_team_id === team.id.toString()
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {team.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </ScrollArea>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="kickoff">Match Date</Label>
              <Input
                id="kickoff"
                type="datetime"
                value={formData.kickoff}
                onChange={(e) =>
                  setFormData({ ...formData, kickoff: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue">Venue</Label>
              <Input
                id="venue"
                value={formData.venue}
                onChange={(e) =>
                  setFormData({ ...formData, venue: e.target.value })
                }
                placeholder="Enter venue"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) =>
                  setFormData({ ...formData, timezone: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                  <SelectItem value="America/New_York">
                    America/New_York
                  </SelectItem>
                  <SelectItem value="America/Chicago">
                    America/Chicago
                  </SelectItem>
                  <SelectItem value="America/Denver">America/Denver</SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    America/Los_Angeles
                  </SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                  <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
                  <SelectItem value="Australia/Sydney">
                    Australia/Sydney
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* New Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="big_match">Big Match</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="big_match"
                    checked={formData.big_match}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, big_match: checked })
                    }
                  />
                  <span>{formData.big_match ? "Yes" : "No"}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="derby">Derby (Rivalry)</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="derby"
                    checked={formData.derby}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, derby: checked })
                    }
                  />
                  <span>{formData.derby ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Match Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      type: value as
                        | "NORMAL"
                        | "FINAL"
                        | "SEMIFINAL"
                        | "QUARTERFINAL"
                        | "FRIENDLY",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">Normal</SelectItem>
                    <SelectItem value="FINAL">Final</SelectItem>
                    <SelectItem value="SEMIFINAL">Semi-Final</SelectItem>
                    <SelectItem value="QUARTERFINAL">Quarter-Final</SelectItem>
                    <SelectItem value="FRIENDLY">FRIENDLY</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="published">Published</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="published"
                    checked={formData.published}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, published: checked })
                    }
                  />
                  <span>{formData.published ? "Yes" : "No"}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="allow_draw">Allow Draw</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="allow_draw"
                  checked={formData.allow_draw}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, allow_draw: checked })
                  }
                />
                <span>{formData.allow_draw ? "Yes" : "No"}</span>
              </div>
            </div>

            {/* {formData.status === "LIVE" || formData.status === "FINISHED" && ( */}
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
            {/* )} */}
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

      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Idx</TableHead>
              <TableHead>Id</TableHead>
              <TableHead>League</TableHead>
              <TableHead>Home Team</TableHead>
              <TableHead>Away Team</TableHead>
              {/* <TableHead>Season</TableHead> */}
              {/* <TableHead>Game Week</TableHead> */}
              <TableHead>Date</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Flags</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredMatches?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center text-muted-foreground"
                >
                  {matches?.length === 0
                    ? "No matches found. Create your first match!"
                    : "No matches match the filter criteria."}
                </TableCell>
              </TableRow>
            ) : (
              filteredMatches?.map((match, index) => (
                <TableRow key={match.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{match.id}</TableCell>
                  <TableCell>
                    {match.league ? match.league.name : "Unknown"}
                  </TableCell>
                  <TableCell className="font-medium">
                    {match.home_team_name}
                  </TableCell>
                  <TableCell className="font-medium">
                    {match.away_team.name}
                  </TableCell>
                  <TableCell>
                    {format(new Date(match.kickoff), "MMM dd, yyyy")}
                  </TableCell>
                  <TableCell>{match.timezone || "UTC"}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        match.status === "SCHEDULED"
                          ? "bg-info/20 text-info"
                          : match.status === "LIVE"
                          ? "bg-success/20 text-success"
                          : match.status === "FINISHED"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {match.status.charAt(0).toUpperCase() +
                        match.status.slice(1)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 rounded text-xs bg-secondary text-secondary-foreground">
                      {match.match_type || "Normal"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {match.big_match && (
                        <span className="px-2 py-1 rounded text-xs bg-red-500 text-white">
                          Big
                        </span>
                      )}
                      {match.derby && (
                        <span className="px-2 py-1 rounded text-xs bg-orange-500 text-white">
                          Derby
                        </span>
                      )}
                      {match.published ? (
                        <span className="px-2 py-1 rounded text-xs bg-green-500 text-white">
                          Published
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded text-xs bg-gray-500 text-white">
                          Draft
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          window.open(`/match/${match.id}`, "_blank")
                        }
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
                        onClick={() => deleteMutation.mutate(match.id)}
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
