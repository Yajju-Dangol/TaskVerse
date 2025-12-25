import { useEffect, useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Progress } from '../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Trophy, Award, Star, Briefcase, Mail, Calendar, Edit, Download } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { getBadges, getInternBadges, getInternPortfolio, updateProfile, type InternPortfolioItem } from '../../lib/db';
import { toast } from 'sonner';
import type { Database } from '../../lib/supabase';

type BadgeRow = Database['public']['Tables']['badges']['Row'] & { unlocked?: boolean };

interface InternProfileProps {
  user: User;
  onNavigate?: (tab: string) => void;
  readonly?: boolean;
}

export function InternProfile({ user, onNavigate, readonly = false }: InternProfileProps) {
  const currentPoints = user.points || 0;
  const currentLevel = user.level || 1;
  const pointsToNextLevel = currentLevel * 100;
  const progressToNextLevel = ((currentPoints % 100) / pointsToNextLevel) * 100;

  const [badges, setBadges] = useState<BadgeRow[]>([]);
  const [portfolio, setPortfolio] = useState<InternPortfolioItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editName, setEditName] = useState(user.name);

  useEffect(() => {
    setEditName(user.name);
  }, [user.name]);

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user.id) return;

      const [allBadges, internBadges, portfolioItems] = await Promise.all([
        getBadges(),
        getInternBadges(user.id),
        getInternPortfolio(user.id),
      ]);

      const unlockedIds = new Set(internBadges.map(b => b.badge_id));
      const badgesWithState: BadgeRow[] = allBadges.map(badge => ({
        ...badge,
        unlocked: unlockedIds.has(badge.id),
      }));

      setBadges(badgesWithState);
      setPortfolio(portfolioItems);
      setLoading(false);
    };

    loadProfileData();
  }, [user.id]);

  const unlockedBadges = badges.filter(b => b.unlocked);
  const lockedBadges = badges.filter(b => !b.unlocked);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const averageRating =
    portfolio.reduce((acc, item) => acc + (item.rating || 0), 0) / (portfolio.length || 1);

  const handleUpdateProfile = async () => {
    if (!editName.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    const success = await updateProfile(user.id, {
      name: editName,
    });

    if (success) {
      toast.success('Profile updated successfully');
      setIsEditDialogOpen(false);
      // Typically we'd reload user data here, but for now we rely on the parent or page reload
      window.location.reload();
    } else {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2">Profile</h2>
        <p className="text-gray-600">Manage your profile and showcase your achievements</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="size-24">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-3xl">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl mb-1">{user.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-2">
                    <Mail className="size-4" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="size-4" />
                    <span>Member since Nov 2025</span>
                  </div>
                </div>
                {!readonly && (
                  <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="size-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        <DialogDescription>
                          Update your personal information
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        </div>
                        <Button className="w-full" onClick={handleUpdateProfile}>
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-3 text-center">
                  <Trophy className="size-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-2xl">{currentPoints}</p>
                  <p className="text-xs text-gray-600">Points</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center">
                  <Award className="size-5 mx-auto mb-1 text-purple-600" />
                  <p className="text-2xl">{currentLevel}</p>
                  <p className="text-xs text-gray-600">Level</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center">
                  <Briefcase className="size-5 mx-auto mb-1 text-green-600" />
                  <p className="text-2xl">{portfolio.length}</p>
                  <p className="text-xs text-gray-600">Completed</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-3 text-center">
                  <Star className="size-5 mx-auto mb-1 text-amber-600" />
                  <p className="text-2xl">{averageRating.toFixed(1)}</p>
                  <p className="text-xs text-gray-600">Avg Rating</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm">Progress to Level {currentLevel + 1}</p>
              <p className="text-sm text-gray-600">
                {currentPoints % 100} / {pointsToNextLevel} points
              </p>
            </div>
            <Progress value={progressToNextLevel} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Portfolio and Badges */}
      <Tabs defaultValue="portfolio">
        <TabsList>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>

        {/* Portfolio Tab */}
        <TabsContent value="portfolio" className="mt-6 space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl">Completed Projects</h3>
            {onNavigate && (
              <Button variant="outline" size="sm">
                <Download className="size-4 mr-2" />
                Export Portfolio
              </Button>
            )}
          </div>

          {portfolio.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{item.task_title}</CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-1">
                      <span>{item.business_name}</span>
                      <span>•</span>
                      <span>{new Date(item.completed_date).toLocaleDateString()}</span>
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <Badge className="bg-amber-600">
                      <Trophy className="size-3 mr-1" />
                      {item.points} pts
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <div className="flex flex-wrap gap-2">
                  {item.skills.map((skill) => (
                    <Badge key={skill} variant="outline">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          {portfolio.length === 0 && (
            <Card className="p-12 text-center">
              <Briefcase className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">No completed tasks yet</p>
              {onNavigate && (
                <Button onClick={() => onNavigate('browse')}>
                  Browse Available Tasks
                </Button>
              )}
            </Card>
          )}
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="mt-6 space-y-6">
          <div>
            <h3 className="text-xl mb-4">Unlocked Badges ({unlockedBadges.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {unlockedBadges.map((badge) => (
                <Card key={badge.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="text-5xl mb-3">{badge.icon}</div>
                    <p className="mb-1">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                    <Badge variant="default" className="mt-3 bg-green-600">
                      Unlocked
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl mb-4">Locked Badges ({lockedBadges.length})</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {lockedBadges.map((badge) => (
                <Card key={badge.id} className="text-center opacity-60">
                  <CardContent className="pt-6">
                    <div className="text-5xl mb-3 grayscale">{badge.icon}</div>
                    <p className="mb-1">{badge.name}</p>
                    <p className="text-xs text-gray-500">{badge.description}</p>
                    <Badge variant="outline" className="mt-3">
                      Locked
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Your Skills</CardTitle>
              <CardDescription>
                Skills gained from completed tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Extract unique skills from portfolio */}
                {Array.from(new Set(portfolio.flatMap(item => item.skills))).map((skill) => {
                  const tasksWithSkill = portfolio.filter(item => item.skills.includes(skill));
                  const proficiency = Math.min((tasksWithSkill.length / 5) * 100, 100);

                  return (
                    <div key={skill}>
                      <div className="flex items-center justify-between mb-2">
                        <span>{skill}</span>
                        <span className="text-sm text-gray-600">
                          {tasksWithSkill.length} task{tasksWithSkill.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <Progress value={proficiency} className="h-2" />
                    </div>
                  );
                })}

                {portfolio.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Complete tasks to build your skill profile
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
