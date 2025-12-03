import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Briefcase, Target, Award, TrendingUp, Zap, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { UserRole } from '../App';

export function LandingPage() {
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('intern');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'signup') {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name: name || email.split('@')[0],
              role: selectedRole,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          // Update profile with role
          await supabase
            .from('profiles')
            .update({ role: selectedRole, name: name || email.split('@')[0] })
            .eq('id', data.user.id);

          toast.success('Account created successfully!', {
            description: 'Please check your email to verify your account.',
          });
        }
      } else {
        // Sign in
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success('Welcome back!');
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Zap className="size-10 text-blue-600" />
            <h1 className="text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskVerse
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Build real skills through verified micro-tasks. Connect interns with businesses for meaningful, experience-building opportunities.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
            <Card>
              <CardHeader>
                <Target className="size-8 text-blue-600 mb-2" />
                <CardTitle>Real Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Complete verified micro-tasks from real businesses</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <Award className="size-8 text-purple-600 mb-2" />
                <CardTitle>Earn Recognition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Gain points, badges, and build a credible portfolio</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <TrendingUp className="size-8 text-green-600 mb-2" />
                <CardTitle>Grow Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Track progress and level up your professional journey</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Auth Section */}
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>
                {authMode === 'login' ? 'Welcome Back' : 'Get Started'}
              </CardTitle>
              <CardDescription>
                {authMode === 'login' 
                  ? 'Sign in to continue your journey' 
                  : 'Create your account to start building experience'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'signup')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="login">Login</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>
                
                <TabsContent value="login">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="login-password">Password</Label>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>I am a</Label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="role-login"
                            value="intern"
                            checked={selectedRole === 'intern'}
                            onChange={() => setSelectedRole('intern')}
                            className="cursor-pointer"
                          />
                          <span>Intern</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="role-login"
                            value="business"
                            checked={selectedRole === 'business'}
                            onChange={() => setSelectedRole('business')}
                            className="cursor-pointer"
                          />
                          <span>Business</span>
                        </label>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Signing in...' : 'Sign In'}
                    </Button>
                  </form>
                </TabsContent>
                
                <TabsContent value="signup">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label>I am a</Label>
                      <div className="flex gap-4 mt-2">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="role-signup"
                            value="intern"
                            checked={selectedRole === 'intern'}
                            onChange={() => setSelectedRole('intern')}
                            className="cursor-pointer"
                          />
                          <span>Intern</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="role-signup"
                            value="business"
                            checked={selectedRole === 'business'}
                            onChange={() => setSelectedRole('business')}
                            className="cursor-pointer"
                          />
                          <span>Business</span>
                        </label>
                      </div>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? 'Creating account...' : 'Create Account'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Users className="size-4" />
                <span>500+ Interns</span>
              </div>
              <div className="flex items-center gap-1">
                <Briefcase className="size-4" />
                <span>100+ Businesses</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="size-4" />
                <span>1000+ Tasks</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
