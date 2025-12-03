import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Trophy, Target, Award, TrendingUp, ArrowRight, Zap } from 'lucide-react';
import { getTasks, getBadges, getInternBadges, getApplications } from '../../lib/db';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'];
type BadgeType = Database['public']['Tables']['badges']['Row'];
type InternBadge = Database['public']['Tables']['intern_badges']['Row'];

interface InternHomeProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export function InternHome({ user, onNavigate }: InternHomeProps) {
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<Set<string>>(new Set());
  const [activeTasksCount, setActiveTasksCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [tasks, allBadges, myBadges, applications] = await Promise.all([
      getTasks({ status: 'open' }),
      getBadges(),
      getInternBadges(user.id),
      getApplications({ internId: user.id, status: 'accepted' }),
    ]);

    setRecentTasks(tasks.slice(0, 3));
    setBadges(allBadges);
    setUnlockedBadgeIds(new Set(myBadges.map(b => b.badge_id)));
    setActiveTasksCount(applications.length);
  };

  const currentPoints = user.points || 0;
  const currentLevel = user.level || 1;
  const pointsToNextLevel = currentLevel * 100;
  const progressToNextLevel = ((currentPoints % 100) / pointsToNextLevel) * 100;
  
  const unlockedBadges = badges.filter(b => unlockedBadgeIds.has(b.id));
  const nextBadge = badges.find(b => !unlockedBadgeIds.has(b.id));

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-3xl mb-2">Welcome back, {user.name}! 👋</h2>
        <p className="opacity-90 mb-6">
          Ready to build your skills and earn recognition? Check out new tasks below.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Trophy className="size-5 mb-2" />
            <p className="text-2xl">{currentPoints}</p>
            <p className="text-sm opacity-80">Total Points</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Award className="size-5 mb-2" />
            <p className="text-2xl">{currentLevel}</p>
            <p className="text-sm opacity-80">Current Level</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Target className="size-5 mb-2" />
            <p className="text-2xl">{activeTasksCount}</p>
            <p className="text-sm opacity-80">Active Tasks</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Zap className="size-5 mb-2" />
            <p className="text-2xl">{unlockedBadges.length}</p>
            <p className="text-sm opacity-80">Badges Earned</p>
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="size-5 text-blue-600" />
              Level Progress
            </CardTitle>
            <CardDescription>
              {pointsToNextLevel - (currentPoints % 100)} points to Level {currentLevel + 1}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Level {currentLevel}</span>
                <span>Level {currentLevel + 1}</span>
              </div>
              <Progress value={progressToNextLevel} className="h-3" />
              <p className="text-xs text-gray-500 text-center mt-2">
                {currentPoints % 100} / {pointsToNextLevel} points
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="size-5 text-purple-600" />
              Next Badge
            </CardTitle>
            <CardDescription>
              Keep completing tasks to unlock more badges
            </CardDescription>
          </CardHeader>
          <CardContent>
            {nextBadge ? (
              <div className="flex items-center gap-4">
                <div className="text-4xl">{nextBadge.icon}</div>
                <div className="flex-1">
                  <p>{nextBadge.name}</p>
                  <p className="text-sm text-gray-500">{nextBadge.description}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">You've unlocked all badges! 🎉</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recommended Tasks */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl">Recommended Tasks</h3>
          <Button variant="ghost" onClick={() => onNavigate('browse')}>
            View All
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {recentTasks.map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant={
                    task.difficulty === 'Beginner' ? 'secondary' :
                    task.difficulty === 'Intermediate' ? 'default' : 'destructive'
                  }>
                    {task.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Trophy className="size-4" />
                    <span className="text-sm">{task.points} pts</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {task.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {task.skills.slice(0, 2).map((skill) => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                    {task.skills.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{task.skills.length - 2}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{(task as any).business_name || 'Business'}</span>
                    <span>{task.duration || 'N/A'}</span>
                  </div>
                  <Button className="w-full" onClick={() => onNavigate('browse')}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('browse')}>
          <CardHeader>
            <Target className="size-8 text-blue-600 mb-2" />
            <CardTitle>Browse Tasks</CardTitle>
            <CardDescription>
              Discover new opportunities and start earning points
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('leaderboard')}>
          <CardHeader>
            <Trophy className="size-8 text-purple-600 mb-2" />
            <CardTitle>View Leaderboard</CardTitle>
            <CardDescription>
              See how you rank against other interns
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('profile')}>
          <CardHeader>
            <Award className="size-8 text-green-600 mb-2" />
            <CardTitle>My Portfolio</CardTitle>
            <CardDescription>
              Showcase your completed tasks and achievements
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
