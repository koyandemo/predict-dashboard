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
import { getAllLeagues } from "@/apiConfig/league.api";
import {
  deleteTeam,
  getAllTeams,
  postTeam,
  putTeam,
} from "@/apiConfig/team.api";
import { TeamT } from "@/types/team.type";

export default function Teams() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [filterLeagueId, setFilterLeagueId] = useState<string>("all");
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [showOnlyMissingVenues, setShowOnlyMissingVenues] = useState(false);
  const [bulkVenues, setBulkVenues] = useState<Record<number, string>>({});
  const [formData, setFormData] = useState({
    name: "",
    short_code: "",
    logo_url: "",
    country: "",
    type: "club" as "club" | "country",
    league_id: undefined as number | undefined,
    venue: "",
  });

  const { data: teams, isLoading } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await getAllTeams();
      if (!response.success) throw new Error(response.error);
      return response.data;
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

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // const response = await teamService.createTeam(data);
      const response = await postTeam(data as TeamT);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team created successfully");
      setIsDialogOpen(false);
      setFormData({
        name: "",
        short_code: "",
        logo_url: "",
        country: "",
        type: "club",
        league_id: undefined,
        venue: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create team");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const response = await putTeam(id, data as TeamT);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Team updated successfully");
      setIsDialogOpen(false);
      setEditingTeam(null);
      setFormData({
        name: "",
        short_code: "",
        logo_url: "",
        country: "",
        type: "club",
        league_id: undefined,
        venue: "",
      });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update team");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await deleteTeam(id);
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

  const bulkUpdateMutation = useMutation({
    mutationFn: async () => {
      const teamsToUpdate = Object.entries(bulkVenues).map(([id, venue]) => ({
        id: parseInt(id),
        venue: venue || "",
      }));

      const response = await teamService.batchUpdateTeams(teamsToUpdate);
      if (!response.success) throw new Error("Failed to update teams");
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teams"] });
      toast.success("Teams updated successfully");
      setBulkEditMode(false);
      setBulkVenues({});
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update teams");
    },
  });

  // Auto-populate known venues
  const autoPopulateVenues = async () => {
    if (!teams) return;

    // Known venue mappings
    const venueMappings: Record<string, string> = {
      // Premier League
      Arsenal: "Emirates Stadium",
      "Aston Villa": "Villa Park",
      Bournemouth: "Vitality Stadium",
      Brentford: "Gtech Community Stadium",
      "Brighton & Hove Albion": "Amex Stadium",
      Burnley: "Turf Moor",
      Chelsea: "Stamford Bridge",
      "Crystal Palace": "Selhurst Park",
      Everton: "Goodison Park",
      Fulham: "Craven Cottage",
      Liverpool: "Anfield",
      "Luton Town": "Kenilworth Road",
      "Manchester City": "Etihad Stadium",
      "Manchester United": "Old Trafford",
      "Newcastle United": "St. James' Park",
      "Nottingham Forest": "City Ground",
      "Sheffield United": "Bramall Lane",
      "Tottenham Hotspur": "Tottenham Hotspur Stadium",
      "West Ham United": "London Stadium",
      Wolves: "Molineux Stadium",

      // La Liga
      "Real Madrid": "Santiago Bernabéu",
      Barcelona: "Camp Nou",
      "Atlético Madrid": "Wanda Metropolitano",
      "Real Sociedad": "Anoeta Stadium",
      Villarreal: "Estadio de la Cerámica",
      "Real Betis": "Benito Villamarín",
      "Athletic Club": "San Mamés",
      Valencia: "Mestalla",
      Sevilla: "Ramón Sánchez Pizjuán",
      Getafe: "Coliseum Alfonso Pérez",
      "Celta Vigo": "Balaídos",
      Espanyol: "RCDE Stadium",
      Mallorca: "Visit Mallorca Estadi",
      Almería: "Power Horse Stadium",
      Girona: "Estadi Montilivi",
      "Rayo Vallecano": "Estadio del Rayo Vallecano",
      Osasuna: "El Sadar",
      "Real Valladolid": "Estadio José Zorrilla",
      Cádiz: "Nuevo Mirandilla",
      "Las Palmas": "Estadio Gran Canaria",

      // Bundesliga
      "Bayern Munich": "Allianz Arena",
      "Borussia Dortmund": "Signal Iduna Park",
      "RB Leipzig": "Red Bull Arena",
      "Bayer Leverkusen": "BayArena",
      "Eintracht Frankfurt": "Deutsche Bank Park",
      "VfL Wolfsburg": "Volkswagen Arena",
      "Borussia Mönchengladbach": "Borussia-Park",
      "Union Berlin": "Stadion An der Alten Försterei",
      "VfB Stuttgart": "Mercedes-Benz Arena",
      "Werder Bremen": "Weserstadion",
      Hoffenheim: "PreZero Arena",
      "FC Augsburg": "WWK Arena",
      "Mainz 05": "MEWA ARENA",
      Freiburg: "Europa-Park Stadion",
      "FC Cologne": "RheinEnergieStadion",
      Bochum: "Vonovia Ruhrstadion",
      "Darmstadt 98": "Merck-Stadion am Böllenfalltor",
      Heidenheim: "Voith-Arena",
      "Holstein Kiel": "Holstein-Stadion",

      // Serie A
      Juventus: "Allianz Stadium",
      "Inter Milan": "San Siro",
      "AC Milan": "San Siro",
      Napoli: "Stadio Diego Armando Maradona",
      "AS Roma": "Stadio Olimpico",
      Lazio: "Stadio Olimpico",
      Atalanta: "Gewiss Stadium",
      Fiorentina: "Stadio Artemio Franchi",
      Bologna: "Stadio Renato Dall'Ara",
      Torino: "Stadio Olimpico Grande Torino",
      Monza: "U-Power Stadium",
      Udinese: "Dacia Arena",
      Sassuolo: "MAPEI Stadium – Città del Tricolore",
      Empoli: "Stadio Carlo Castellani",
      "Hellas Verona": "Stadio Marcantonio Bentegodi",
      Lecce: "Stadio Comunale",
      Frosinone: "Stadio Benito Stirpe",
      Genoa: "Stadio Comunale Luigi Ferraris",
      Cagliari: "Unipol Domus",
      Salernitana: "Stadio Arechi",

      // Ligue 1
      "Paris Saint-Germain": "Parc des Princes",
      "Olympique Marseille": "Orange Vélodrome",
      "AS Monaco": "Stade Louis II",
      "Olympique Lyon": "Groupama Stadium",
      "LOSC Lille": "Stade Pierre-Mauroy",
      "Stade Rennais": "Roazhon Park",
      "RC Lens": "Stade Bollaert-Delelis",
      "OGC Nice": "Allianz Riviera",
      "AS Saint-Étienne": "Stade Geoffroy-Guichard",
      Montpellier: "Stade de la Mosson",
      Toulouse: "Stadium Municipal",
      Reims: "Stade Auguste-Delaune",
      Strasbourg: "Stade de la Meinau",
      Nantes: "Stade de la Beaujoire",
      Brest: "Stade Francis-Le Blé",
      Auxerre: "Stade de l’Abbé-Deschamps",
      "Clermont Foot": "Stade Gabriel Montpied",
      "Le Havre": "Stade Océane",
      Metz: "Stade Saint-Symphorien",
      Lorient: "Stade du Moustoir",
    };

    // Prepare updates for teams without venues
    const updates = teams
      .filter((team) => !team.venue && venueMappings[team.name])
      .map((team) => ({
        id: team.id,
        venue: venueMappings[team.name],
      }));

    if (updates.length === 0) {
      toast.info("No teams found that need venue auto-population");
      return;
    }

    try {
      const response = await teamService.batchUpdateTeams(updates);
      if (response.success) {
        queryClient.invalidateQueries({ queryKey: ["teams"] });
        toast.success(`Auto-populated venues for ${updates.length} teams`);
      } else {
        throw new Error("Failed to update teams");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to auto-populate venues");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeam) {
      updateMutation.mutate({ id: editingTeam.id, data: formData });
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
      type: team.type || "club",
      league_id: team.league_id || undefined,
      venue: team.venue || "",
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingTeam(null);
    setFormData({
      name: "",
      short_code: "",
      logo_url: "",
      country: "",
      type: "club",
      league_id: undefined,
      venue: "",
    });
  };

  // Filter teams by league and venue
  const filteredTeams = teams?.filter((team) => {
    // League filter
    if (filterLeagueId === "all") return true;
    if (filterLeagueId === "none") return !team.league_id;
    if (team.league_id !== parseInt(filterLeagueId)) return false;

    // Venue filter
    if (showOnlyMissingVenues) return !team.venue || team.venue.trim() === "";

    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="text-muted-foreground">
            Manage football teams
            {teams && (
              <span>
                ({teams.filter((t) => !t.venue || t.venue.trim() === "").length}{" "}
                missing venues)
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <Select value={filterLeagueId} onValueChange={setFilterLeagueId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by league" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              <SelectItem value="none">No League</SelectItem>
              {leagues?.map((league) => (
                <SelectItem key={league.id} value={league.id!.toString()}>
                  {league.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter toggle for teams without venues */}
          <Button
            variant={showOnlyMissingVenues ? "default" : "outline"}
            onClick={() => setShowOnlyMissingVenues(!showOnlyMissingVenues)}
          >
            {showOnlyMissingVenues ? "Show All" : "Missing Venues"}
          </Button>

          {bulkEditMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setBulkEditMode(false);
                  setBulkVenues({});
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => bulkUpdateMutation.mutate()}
                disabled={bulkUpdateMutation.isPending}
              >
                {bulkUpdateMutation.isPending ? "Saving..." : "Save All"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={autoPopulateVenues}>
                Auto Populate Venues
              </Button>
              <Button variant="outline" onClick={() => setBulkEditMode(true)}>
                Bulk Edit Venues
              </Button>
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
                          setFormData({
                            ...formData,
                            short_code: e.target.value,
                          })
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
                      <Label htmlFor="type">Team Type</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            type: e.target.value as "club" | "country",
                          })
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
                          setFormData({
                            ...formData,
                            league_id:
                              value === "none" ? undefined : parseInt(value),
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a league" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {leagues?.map((league) => (
                            <SelectItem
                              key={league.id}
                              value={league.id!.toString()}
                            >
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
            </>
          )}
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
              <TableHead>Venue</TableHead>
              {bulkEditMode && <TableHead>Bulk Edit</TableHead>}
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={bulkEditMode ? 9 : 8}
                  className="text-center"
                >
                  Loading...
                </TableCell>
              </TableRow>
            ) : filteredTeams?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={bulkEditMode ? 9 : 8}
                  className="text-center text-muted-foreground"
                >
                  {filterLeagueId === "all"
                    ? "No teams found. Create your first team!"
                    : "No teams found for this filter."}
                </TableCell>
              </TableRow>
            ) : (
              filteredTeams?.map((team, index) => (
                <TableRow key={team.id}>
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
                      {team.type === "country" ? "National" : "Club"}
                    </span>
                  </TableCell>
                  <TableCell>
                    {team.venue ? (
                      <span className="text-sm">{team.venue}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground italic">
                        No venue
                      </span>
                    )}
                  </TableCell>
                  {bulkEditMode && (
                    <TableCell>
                      <Input
                        value={bulkVenues[team.id] || team.venue || ""}
                        onChange={(e) =>
                          setBulkVenues((prev) => ({
                            ...prev,
                            [team.id]: e.target.value,
                          }))
                        }
                        placeholder="Enter venue"
                      />
                    </TableCell>
                  )}
                  <TableCell className="text-right">
                    {bulkEditMode ? (
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setBulkVenues((prev) => ({
                              ...prev,
                              [team.id]: "",
                            }))
                          }
                        >
                          Clear
                        </Button>
                      </div>
                    ) : (
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
                          onClick={() => deleteMutation.mutate(team.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
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
