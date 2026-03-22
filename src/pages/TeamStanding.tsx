"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { getAllTeamStandings, putTeamStandings } from "@/apiConfig/teamStanding.api";

// mock type
type Standing = {
  id: number;
  team: {
    name: string;
    short_code: string;
  };
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

export default function TeamStanding() {
  const [data, setData] = React.useState<Standing[]>([]);
  const [selected, setSelected] = React.useState<Standing | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    // TODO: replace with API
    // setData([
    //   {
    //     id: 1,
    //     team: { name: "Argentina", short_code: "ARG" },
    //     played: 3,
    //     won: 2,
    //     drawn: 1,
    //     lost: 0,
    //     goalsFor: 5,
    //     goalsAgainst: 2,
    //     goalDifference: 3,
    //     points: 7,
    //   },
    // ]);
    fetchTeamStandings();
  }, []);

  const fetchTeamStandings = async () => {
    try{
      const res = await getAllTeamStandings();
      setData(res.data);
    }catch(err){
      console.error(err);
    }
  }

  const handleRowClick = (item: Standing) => {
    setSelected(item);
    setOpen(true);
  };

  const handleChange = (key: keyof Standing, value: number) => {
    if (!selected) return;
    setSelected({ ...selected, [key]: value });
  };

  const handleSave = async () => {
    if (!selected) return;

    const updated = data.map((item) =>
      item.id === selected.id ? selected : item
    );
    const res = await putTeamStandings(selected.id, selected);
    console.log(res);
    setData(updated);
    setOpen(false);



    // TODO: call update API
  };

  return (
    <div className="p-6 bg-background text-foreground min-h-screen">
      <Card className="rounded-2xl shadow-md">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-4">Team Standings</h2>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team</TableHead>
                <TableHead>P</TableHead>
                <TableHead>W</TableHead>
                <TableHead>D</TableHead>
                <TableHead>L</TableHead>
                <TableHead>GF</TableHead>
                <TableHead>GA</TableHead>
                <TableHead>GD</TableHead>
                <TableHead>Pts</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((item) => (
                <TableRow
                  key={item.id}
                  className="cursor-pointer hover:bg-muted"
                  onClick={() => handleRowClick(item)}
                >
                  <TableCell>
                    {item.team.name} ({item.team.short_code})
                  </TableCell>
                  <TableCell>{item.played}</TableCell>
                  <TableCell>{item.won}</TableCell>
                  <TableCell>{item.drawn}</TableCell>
                  <TableCell>{item.lost}</TableCell>
                  <TableCell>{item.goalsFor}</TableCell>
                  <TableCell>{item.goalsAgainst}</TableCell>
                  <TableCell>{item.goalDifference}</TableCell>
                  <TableCell>{item.points}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-background text-foreground rounded-2xl">
          <DialogHeader>
            <DialogTitle>Edit Standing</DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="grid grid-cols-2 gap-4">
              {[
                "played",
                "won",
                "drawn",
                "lost",
                "goalsFor",
                "goalsAgainst",
                "goalDifference",
                "points",
              ].map((field) => (
                <div key={field}>
                  <label className="text-sm capitalize">{field}</label>
                  <Input
                    type="number"
                    value={(selected as any)[field]}
                    onChange={(e) =>
                      handleChange(field as keyof Standing, Number(e.target.value))
                    }
                  />
                </div>
              ))}

              <div className="col-span-2 flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
