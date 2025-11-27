import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Calendar, BarChart3 } from "lucide-react";

export default function Analytics() {
  const { data: stats } = useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const [leagues, teams, matches, predictions] = await Promise.all([
        supabase.from("leagues").select("*", { count: "exact", head: true }),
        supabase.from("teams").select("*", { count: "exact", head: true }),
        supabase.from("matches").select("*", { count: "exact", head: true }),
        supabase
          .from("user_predictions")
          .select("*", { count: "exact", head: true }),
      ]);

      return {
        leagues: leagues.count || 0,
        teams: teams.count || 0,
        matches: matches.count || 0,
        predictions: predictions.count || 0,
      };
    },
  });

  const statCards = [
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
