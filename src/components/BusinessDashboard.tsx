import { useEffect, useState } from 'react';
import { User } from '../App';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Home, Briefcase, Users, Building2 } from 'lucide-react';
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
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="size-6 text-blue-600" />
              <h1 className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskVerse
              </h1>
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Business</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p>{user.name}</p>
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
            <BusinessHome user={user} onNavigate={setActiveTab} />
          </TabsContent>

          <TabsContent value="tasks">
            <ManageTasks user={user} />
          </TabsContent>

          <TabsContent value="submissions">
            <ReviewSubmissions user={user} />
          </TabsContent>

          <TabsContent value="profile">
            <BusinessProfile user={user} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
