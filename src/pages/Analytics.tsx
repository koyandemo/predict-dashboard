import { useQuery } from "@tanstack/react-query";
import * as leagueService from "@/services/leagueService";
import * as matchService from "@/services/matchService";
import * as userService from "@/services/userService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, BarChart3, User } from "lucide-react";

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const [leaguesCount, teamsCount, matchesCount, predictionsCount, users] = await Promise.all([
        leagueService.getLeaguesCount(),
        leagueService.getTeamsCount(),
        matchService.getMatchesCount(),
        userService.getPredictionsCount(),
        userService.getAllUsers(),
      ]);

      return {
        leagues: leaguesCount,
        teams: teamsCount,
        matches: matchesCount,
        predictions: predictionsCount,
        users: users.success ? users.data?.length || 0 : 0,
      };
    },
  });

  const statCards = [
    {
      title: "Total Users",
      value: stats?.users || 0,
      icon: User,
      color: "text-blue-500",
    },
    {
      title: "Total Leagues",
      value: stats?.leagues || 0,
      icon: Trophy,
      color: "text-primary",
    },
    {
      title: "Total Teams",
      value: stats?.teams || 0,
      icon: Users,
      color: "text-secondary",
    },
    {
      title: "Total Matches",
      value: stats?.matches || 0,
      icon: Calendar,
      color: "text-success",
    },
    {
      title: "Total Predictions",
      value: stats?.predictions || 0,
      icon: BarChart3,
      color: "text-warning",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">
          Overview of your prediction platform
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Platform Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Your sports prediction dashboard is now live! Start by adding
            leagues and teams, then create matches for users to predict.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}