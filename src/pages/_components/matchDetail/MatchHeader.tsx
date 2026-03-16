import { formatDate } from "date-fns";

interface MatchHeaderProps {
  match: {
    league?: { name?: string };
    home_team: { name: string; logo_url?: string };
    away_team: { name: string; logo_url?: string };
    kickoff: string;
    venue?: string;
  };
}

export default function MatchHeader({ match }: MatchHeaderProps) {
  return (
    <>
      <div className="flex justify-center">
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          {match.league?.name}
        </span>
      </div>

      <div className="flex items-center justify-center gap-8 py-8">
        <div className="text-center space-y-2">
          <div className="w-24 h-24 mx-auto bg-card rounded-lg p-4 flex items-center justify-center">
            {match.home_team?.logo_url ? (
              <img
                src={match.home_team.logo_url}
                alt={match.home_team.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-2xl font-bold">{match.home_team.name}</div>
            )}
          </div>
          <div className="font-semibold text-lg">{match.home_team.name}</div>
          <div className="text-sm text-muted-foreground">Home</div>
        </div>

        <div className="text-4xl font-bold text-muted-foreground">VS</div>

        <div className="text-center space-y-2">
          <div className="w-24 h-24 mx-auto bg-card rounded-lg p-4 flex items-center justify-center">
            {match.away_team?.logo_url ? (
              <img
                src={match.away_team.logo_url}
                alt={match.away_team.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-2xl font-bold">{match.away_team.name}</div>
            )}
          </div>
          <div className="font-semibold text-lg">{match.away_team.name}</div>
          <div className="text-sm text-muted-foreground">Away</div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
        <div>📅 {formatDate(match.kickoff, "EEEE, MMMM d, yyyy")}</div>
        <div>🕐 {formatDate(match.kickoff, "HH:mm")}</div>
        <div>📍 {match.venue}</div>
      </div>
    </>
  );
}