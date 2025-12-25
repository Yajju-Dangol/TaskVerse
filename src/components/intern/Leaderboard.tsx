import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { getLeaderboard } from '../../lib/db';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { InternProfile } from './InternProfile';

interface LeaderboardProps {
  user: User;
}

export function Leaderboard({ user }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<Array<{
    rank: number;
    intern_id: string;
    name: string;
    points: number;
    level: number;
    tasks_completed: number;
    badges: number;
  }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    const data = await getLeaderboard(50);
    setLeaderboard(data);
    setLoading(false);
  };

  const currentUserRank = leaderboard.find(entry => entry.intern_id === user.id) || {
    rank: leaderboard.length + 1,
    intern_id: user.id,
    name: user.name,
    points: user.points || 0,
    level: user.level || 1,
    tasks_completed: 0,
    badges: 0,
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="size-6 text-amber-400" />;
    if (rank === 2) return <Medal className="size-6 text-gray-400" />;
    if (rank === 3) return <Medal className="size-6 text-amber-600" />;
    return <span className="text-lg text-gray-400">#{rank}</span>;
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleUserClick = (entry: any) => {
    setSelectedUser({
      id: entry.intern_id,
      name: entry.name,
      email: '', // Not available in leaderboard, but not critical for display
      role: 'intern',
      points: entry.points,
      level: entry.level
    });
    setIsProfileOpen(true);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2">Leaderboard</h2>
        <p className="text-gray-600">See how you rank against other interns in the community</p>
      </div>

      {/* User's Rank Card */}
      <Card className="border-2 border-blue-500 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="size-5 text-blue-600" />
            Your Ranking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-16 bg-blue-600 text-white rounded-full">
              {currentUserRank.rank <= 3 ? getMedalIcon(currentUserRank.rank) : (
                <span className="text-xl">#{currentUserRank.rank}</span>
              )}
            </div>
            <div className="flex-1">
              <p className="text-xl">{currentUserRank.name}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Trophy className="size-4" />
                  <span>{currentUserRank.points} pts</span>
                </div>
                <div>Level {currentUserRank.level}</div>
                <div>{currentUserRank.tasks_completed} tasks</div>
                <div>{currentUserRank.badges} badges</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Performers */}
      <div>
        <h3 className="text-xl mb-4">Top Performers</h3>
        {loading ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500">Loading leaderboard...</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6 mb-6">
            {leaderboard.slice(0, 3).map((entry, index) => (
              <div
                key={entry.intern_id}
                onClick={() => handleUserClick(entry)}
                className="cursor-pointer transition-transform hover:scale-105"
              >
                <Card
                  className={`${index === 0 ? 'border-2 border-amber-400 shadow-lg' :
                    index === 1 ? 'border-2 border-gray-400' :
                      'border-2 border-amber-600'
                    }`}
                >
                  <CardHeader className="text-center pb-2">
                    <div className="flex justify-center mb-3">
                      {getMedalIcon(entry.rank)}
                    </div>
                    <CardTitle className="text-lg">{entry.name}</CardTitle>
                    <CardDescription>Rank #{entry.rank}</CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-4 mb-3">
                      <p className="text-3xl">{entry.points}</p>
                      <p className="text-sm opacity-90">Total Points</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <p className="text-gray-500">Level</p>
                        <p>{entry.level}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Tasks</p>
                        <p>{entry.tasks_completed}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Badges</p>
                        <p>{entry.badges}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
          <CardDescription>All interns ranked by points</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry) => {
                const isCurrentUser = entry.intern_id === user.id;
                return (
                  <div
                    key={entry.intern_id}
                    onClick={() => handleUserClick(entry)}
                    className={`flex items-center gap-4 p-4 rounded-lg transition-colors cursor-pointer ${isCurrentUser ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                  >
                    <div className="flex items-center justify-center size-12">
                      {getMedalIcon(entry.rank)}
                    </div>

                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {getInitials(entry.name)}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <p>
                        {entry.name}
                        {isCurrentUser && (
                          <Badge variant="default" className="ml-2 text-xs">You</Badge>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">Level {entry.level}</p>
                    </div>

                    <div className="hidden md:flex gap-6 text-sm">
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">Points</p>
                        <p className="flex items-center gap-1">
                          <Trophy className="size-3 text-amber-600" />
                          {entry.points}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">Tasks</p>
                        <p>{entry.tasks_completed}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-gray-500 text-xs">Badges</p>
                        <p className="flex items-center gap-1">
                          <Award className="size-3 text-purple-600" />
                          {entry.badges}
                        </p>
                      </div>
                    </div>

                    <div className="md:hidden text-right">
                      <p className="flex items-center gap-1 text-amber-600">
                        <Trophy className="size-4" />
                        {entry.points}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedUser && (
            <InternProfile user={selectedUser} readonly={true} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
