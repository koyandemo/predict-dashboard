import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Trophy, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import * as leagueService from "@/services/leagueService";
import * as teamService from "@/services/teamService";

export default function Index() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: leagues } = useQuery({
    queryKey: ["leagues"],
    queryFn: async () => {
      const response = await leagueService.getAllLeagues();
      return response.success ? response.data : [];
    },
  });

  const { data: teams } = useQuery({
    queryKey: ["teams"],
    queryFn: async () => {
      const response = await teamService.getAllTeams();
      return response.success ? response.data : [];
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Admin Dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Hello, {user?.name || 'Admin'}!</p>
            <p className="mt-2 text-sm text-muted-foreground">
              You are logged in as {user?.role === 'ADMIN' ? 'Administrator' : user?.role}.
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Leagues</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leagues?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active leagues in system
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Registered teams
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Stats</CardTitle>
            <CardDescription>Overview</CardDescription>
          </CardHeader>
          <CardContent>
            <p>System status: Operational</p>
            <p className="mt-2 text-sm text-muted-foreground">
              All systems running normally
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}