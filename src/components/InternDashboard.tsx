import { useEffect, useState } from 'react';
import { PageTransition } from './PageTransition';
import { User } from '../App';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Home, Briefcase, Trophy, User as UserIcon, Award, Zap } from 'lucide-react';
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
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['home', 'browse', 'my-tasks', 'leaderboard', 'profile'];

      if (hash && validTabs.includes(hash)) {
        setActiveTab(hash);
      } else {
        // If hash is invalid (e.g. from landing page sections like #community), default to home
        window.history.replaceState(null, '', ' ');
        setActiveTab('home');
      }
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  const handleTabChange = (value: string) => {
    if (typeof window !== 'undefined') {
      if (value !== activeTab) {
        window.location.hash = value;
        window.location.reload();
      }
    } else {
      setActiveTab(value);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-xl tracking-tight text-gray-900">
              <div className="bg-black text-white p-1 rounded-lg">
                <Zap className="size-5" fill="currentColor" />
              </div>
              TaskVerse
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full shadow-md shadow-blue-100">
                <Trophy className="size-4" />
                <span className="font-medium">{user.points || 0} pts</span>
                <span className="text-xs opacity-80 border-l border-white/20 pl-2 ml-1">Level {user.level || 1}</span>
              </div>
              <Button variant="ghost" size="icon" onClick={onLogout} className="rounded-full hover:bg-gray-100">
                <LogOut className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={handleTabChange}>
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
            <PageTransition>
              <InternHome user={user} onNavigate={handleTabChange} />
            </PageTransition>
          </TabsContent>

          <TabsContent value="browse">
            <PageTransition>
              <TaskBrowser user={user} />
            </PageTransition>
          </TabsContent>

          <TabsContent value="my-tasks">
            <PageTransition>
              <MyTasks user={user} />
            </PageTransition>
          </TabsContent>

          <TabsContent value="leaderboard">
            <PageTransition>
              <Leaderboard user={user} />
            </PageTransition>
          </TabsContent>

          <TabsContent value="profile">
            <PageTransition>
              <InternProfile user={user} onNavigate={handleTabChange} />
            </PageTransition>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
