import React from 'react'

const Analytics = () => {
  return (
    <div>Analytics</div>
  )
}

export default Analytics

// import { useQuery } from "@tanstack/react-query";
// import * as leagueService from "@/services/leagueService";
// import * as matchService from "@/services/matchService";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Trophy, Users, Calendar, BarChart3, User, TrendingUp, Home, RotateCcw, Plane } from "lucide-react";

// export default function Analytics() {
//   const { data: stats } = useQuery({
//     queryKey: ["analytics"],
//     queryFn: async () => {
//       const [leaguesCount, teamsCount, matchesCount, predictionsCount, users, votingStats] = await Promise.all([
//         leagueService.getLeaguesCount(),
//         leagueService.getTeamsCount(),
//         matchService.getMatchesCount(),
//         // userService.getPredictionsCount(),
//         // userService.getAllUsers(),
//         matchService.getVotingStatistics(),
//       ]);

//       return {
//         leagues: leaguesCount,
//         teams: teamsCount,
//         matches: matchesCount,
//         predictions: predictionsCount,
//         users: users.success ? users.data?.length || 0 : 0,
//         voting: votingStats.success ? votingStats.data : null,
//       };
//     },
//   });

//   const statCards = [
//     {
//       title: "Total Users",
//       value: stats?.users || 0,
//       icon: User,
//       color: "text-blue-500",
//     },
//     {
//       title: "Total Leagues",
//       value: stats?.leagues || 0,
//       icon: Trophy,
//       color: "text-primary",
//     },
//     {
//       title: "Total Teams",
//       value: stats?.teams || 0,
//       icon: Users,
//       color: "text-secondary",
//     },
//     {
//       title: "Total Matches",
//       value: stats?.matches || 0,
//       icon: Calendar,
//       color: "text-success",
//     },
//     {
//       title: "Total Predictions",
//       value: stats?.predictions || 0,
//       icon: BarChart3,
//       color: "text-warning",
//     },
//   ];

//   const votingStats = stats?.voting ? [
//     {
//       title: "Total Votes",
//       value: stats.voting.totalVotes || 0,
//       icon: TrendingUp,
//       color: "text-purple-500",
//     },
//     {
//       title: "Home Wins",
//       value: stats.voting.homeWins || 0,
//       icon: Home,
//       color: "text-blue-500",
//     },
//     {
//       title: "Draws",
//       value: stats.voting.draws || 0,
//       icon: RotateCcw,
//       color: "text-gray-500",
//     },
//     {
//       title: "Away Wins",
//       value: stats.voting.awayWins || 0,
//       icon: Plane,
//       color: "text-green-500",
//     },
//   ] : [];

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="text-3xl font-bold">Analytics</h1>
//         <p className="text-muted-foreground">
//           Overview of your prediction platform
//         </p>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
//         {statCards.map((stat) => (
//           <Card key={stat.title}>
//             <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//               <CardTitle className="text-sm font-medium">
//                 {stat.title}
//               </CardTitle>
//               <stat.icon className={`h-5 w-5 ${stat.color}`} />
//             </CardHeader>
//             <CardContent>
//               <div className="text-3xl font-bold">{stat.value}</div>
//             </CardContent>
//           </Card>
//         ))}
//       </div>

//       {votingStats.length > 0 && (
//         <div>
//           <h2 className="text-2xl font-bold mb-4">Voting Statistics</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//             {votingStats.map((stat) => (
//               <Card key={stat.title}>
//                 <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                   <CardTitle className="text-sm font-medium">
//                     {stat.title}
//                   </CardTitle>
//                   <stat.icon className={`h-5 w-5 ${stat.color}`} />
//                 </CardHeader>
//                 <CardContent>
//                   <div className="text-3xl font-bold">{stat.value}</div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </div>
//       )}

//       <Card>
//         <CardHeader>
//           <CardTitle>Platform Overview</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <p className="text-muted-foreground">
//             Your sports prediction dashboard is now live! Start by adding
//             leagues and teams, then create matches for users to predict.
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }