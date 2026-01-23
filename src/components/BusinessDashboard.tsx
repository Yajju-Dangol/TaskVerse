import { useEffect, useState } from 'react';
import { PageTransition } from './PageTransition';
import { User } from '../App';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Home, Briefcase, Users, Building2, Zap } from 'lucide-react';
import { BusinessHome } from './business/BusinessHome';
import { ManageTasks } from './business/ManageTasks';
import { ReviewSubmissions } from './business/ReviewSubmissions';
import { BusinessProfile } from './business/BusinessProfile';

interface BusinessDashboardProps {
  user: User;
  onLogout: () => void;
}

export function BusinessDashboard({ user, onLogout }: BusinessDashboardProps) {
  const [activeTab, setActiveTab] = useState('home');

  // Ensure dashboard starts at top when user logs in / view mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '');
      const validTabs = ['home', 'tasks', 'submissions', 'profile'];

      if (hash && validTabs.includes(hash)) {
        setActiveTab(hash);
      } else {
        // If hash is invalid (e.g. from landing page sections), default to home
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
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full ml-1 border border-gray-200">Business</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium text-gray-900">{user.name}</p>
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
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto mb-8">
            <TabsTrigger value="home" className="flex items-center gap-2">
              <Home className="size-4" />
              <span className="hidden sm:inline">Home</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <Briefcase className="size-4" />
              <span className="hidden sm:inline">Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="submissions" className="flex items-center gap-2">
              <Users className="size-4" />
              <span className="hidden sm:inline">Submissions</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Building2 className="size-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home">
            <PageTransition>
              <BusinessHome user={user} onNavigate={handleTabChange} />
            </PageTransition>
          </TabsContent>

          <TabsContent value="tasks">
            <PageTransition>
              <ManageTasks user={user} />
            </PageTransition>
          </TabsContent>

          <TabsContent value="submissions">
            <PageTransition>
              <ReviewSubmissions user={user} />
            </PageTransition>
          </TabsContent>

          <TabsContent value="profile">
            <PageTransition>
              <BusinessProfile user={user} />
            </PageTransition>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
