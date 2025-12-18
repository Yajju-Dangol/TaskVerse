import { useEffect, useState } from 'react';
import { User } from '../App';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Home, Briefcase, Trophy, User as UserIcon, Award } from 'lucide-react';
import { TaskBrowser } from './intern/TaskBrowser';
import { MyTasks } from './intern/MyTasks';
import { Leaderboard } from './intern/Leaderboard';
import { InternProfile } from './intern/InternProfile';
import { InternHome } from './intern/InternHome';

interface InternDashboardProps {
  user: User;
  onLogout: () => void;
}

export function InternDashboard({ user, onLogout }: InternDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');

  // Ensure dashboard starts at top when user logs in / view mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="size-6 text-blue-600" />
              <h1 className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskVerse
              </h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p>{user.name}</p>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg">
                <Trophy className="size-4" />
                <span>{user.points || 0} pts</span>
                <span className="text-xs opacity-80">Level {user.level || 1}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout}>
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="size-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Briefcase className="size-4" />
              <span className="hidden sm:inline">Browse</span>
            </TabsTrigger>
            <TabsTrigger value="my-tasks" className="flex items-center gap-2">
              <Award className="size-4" />
              <span className="hidden sm:inline">My Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="size-4" />
              <span className="hidden sm:inline">Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <UserIcon className="size-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <InternHome user={user} onNavigate={setActiveTab} />
          </TabsContent>

          <TabsContent value="browse">
            <TaskBrowser user={user} />
          </TabsContent>

          <TabsContent value="my-tasks">
            <MyTasks user={user} />
          </TabsContent>

          <TabsContent value="leaderboard">
            <Leaderboard user={user} />
          </TabsContent>

          <TabsContent value="profile">
            <InternProfile user={user} onNavigate={setActiveTab} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
