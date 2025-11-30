import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowLeft, Calendar, Trophy, MessageSquare } from "lucide-react";
import * as userService from "@/services/userService";

export default function UserDetail() {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const userIdNum = userId ? parseInt(userId) : 0;

  // Fetch user details
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", userIdNum],
    queryFn: async () => {
      const response = await userService.getUserById(userIdNum);
      if (!response.success) throw new Error(response.error);
      return response.data;
    },
    enabled: !!userIdNum,
  });

  // Fetch user predictions
  const { data: predictions } = useQuery({
    queryKey: ["userPredictions", userIdNum],
    queryFn: async () => {
      const response = await userService.getUserPredictions(userIdNum);
      if (!response.success) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!userIdNum,
  });

  // Fetch user comments
  const { data: comments } = useQuery({
    queryKey: ["userComments", userIdNum],
    queryFn: async () => {
      const response = await userService.getUserComments(userIdNum);
      if (!response.success) throw new Error(response.error);
      return response.data || [];
    },
    enabled: !!userIdNum,
  });

  if (userLoading) return <div className="p-8">Loading user...</div>;
  if (!user) return <div className="p-8">User not found</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <Button variant="ghost" onClick={() => navigate("/users")} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back to users
        </Button>

        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-bold">{user.name}</h1>
              <p className="text-muted-foreground">{user.email}</p>
              <div className="flex gap-2">
                <Badge variant="secondary">{user.provider}</Badge>
                <Badge variant={user.type === "admin" ? "default" : "outline"}>
                  {user.type}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="font-medium">
                {user.created_at ? new Date(user.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Predictions */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Predictions</h2>
              <Badge variant="secondary">{predictions?.length || 0}</Badge>
            </div>
            
            {predictions && predictions.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Match</TableHead>
                    <TableHead>Prediction</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {predictions.map((prediction: any) => (
                    <TableRow key={prediction.prediction_id}>
                      <TableCell>
                        {prediction.match?.home_team?.name || "Home"} vs {prediction.match?.away_team?.name || "Away"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{prediction.predicted_winner}</Badge>
                      </TableCell>
                      <TableCell>
                        {prediction.prediction_date 
                          ? new Date(prediction.prediction_date).toLocaleDateString() 
                          : "N/A"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No predictions made yet</p>
              </div>
            )}
          </Card>

          {/* Comments */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5" />
              <h2 className="text-xl font-semibold">Comments</h2>
              <Badge variant="secondary">{comments?.length || 0}</Badge>
            </div>
            
            {comments && comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment: any) => (
                  <div key={comment.comment_id} className="p-4 rounded-lg bg-card border">
                    <p className="text-sm">{comment.comment_text}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {comment.match?.home_team?.name || "Home"} vs {comment.match?.away_team?.name || "Away"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {comment.timestamp 
                          ? new Date(comment.timestamp).toLocaleDateString() 
                          : "N/A"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-20" />
                <p>No comments posted yet</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}