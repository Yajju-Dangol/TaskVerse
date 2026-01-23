import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { Briefcase, Target, Award, TrendingUp, Zap, Users, ArrowRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';
import type { UserRole } from '../App';

export function LandingPage({ showResetPasswordDialog = false }: { showResetPasswordDialog?: boolean }) {
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password' | 'reset-password-confirm'>(
    showResetPasswordDialog ? 'reset-password-confirm' : 'login'
  );
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('intern');
  const [loading, setLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  // New password state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Update auth mode when prop changes
  useEffect(() => {
    if (showResetPasswordDialog && authMode !== 'reset-password-confirm') {
      setAuthMode('reset-password-confirm');
    }
  }, [showResetPasswordDialog, authMode]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}?type=recovery`,
      });

      if (error) throw error;

      toast.success('Password reset link sent!', {
        description: 'Check your email for instructions to reset your password.',
      });
      setAuthMode('login');
      setResetEmail('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdateError(null); // Clear previous errors

    if (newPassword !== confirmPassword) {
      setUpdateError("Passwords don't match");
      toast.error("Passwords don't match");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      toast.success('Password updated successfully!');
      // Hard reload to reset session state/auth listeners completely
      window.location.replace('/');
    } catch (error: any) {
      console.error('Error updating password:', error);
      let errMsg = error.message || 'Failed to update password';

      if (errMsg.includes('New password should be different from the old password')) {
        errMsg = 'New password cannot be the same as the old password. Please choose a different one.';
      }

      setUpdateError(errMsg);
      toast.error(errMsg);
      setLoading(false);
    }
  };

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
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      {/* Navbar */}
      <nav className="sticky top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold text-xl tracking-tight text-gray-900">
            <div className="bg-black text-white p-1 rounded-lg">
              <Zap className="size-5" fill="currentColor" />
            </div>
            TaskVerse
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#hero" className="hover:text-black transition-colors">Overview</a>
            <a href="#features" className="hover:text-black transition-colors">Features</a>
            <a href="#community" className="hover:text-black transition-colors">Community</a>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => { setIsAuthOpen(true); setAuthMode('login'); }}
              className="text-sm font-medium text-gray-600 hover:text-black transition-colors hidden sm:block"
            >
              Sign In
            </button>
            <Button
              onClick={() => { setIsAuthOpen(true); setAuthMode('signup'); }}
              className="rounded-full px-6 h-9 text-sm font-medium bg-black text-white hover:bg-gray-800 transition-all"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>

        {/* Section 1: Hero */}
        <section id="hero" className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-white">
          <div className="max-w-5xl mx-auto z-10 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-8">
            <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full text-gray-500 border-gray-200 font-medium">
              V 1.0 Now Available
            </Badge>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-600 bg-clip-text text-transparent leading-[1.1]">
              Master Your Future.
            </h1>
            <p className="text-xl md:text-2xl text-gray-500 max-w-2xl mx-auto mb-10 font-medium leading-relaxed tracking-tight">
              Connect with top companies, complete verified tasks, and build a career-ready portfolio.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
              <Button
                onClick={() => { setIsAuthOpen(true); setAuthMode('signup'); }}
                size="lg"
                className="rounded-full px-8 h-14 text-base bg-blue-600 hover:bg-blue-700 text-white min-w-[200px] shadow-lg shadow-blue-200 transition-all hover:scale-105"
              >
                Start Building
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 h-14 text-base border-gray-200 hover:bg-gray-50 hover:text-black min-w-[200px] gap-2 transition-all"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Decorative Elements */}
          <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-50 rounded-full blur-[120px] opacity-60" />
          </div>
        </section>

        {/* Section 2: Features */}
        <section id="features" className="py-32 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4">
            <div className="text-center mb-24 max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 text-gray-900">
                Engineered for Growth.
              </h2>
              <p className="text-xl text-gray-500 font-medium leading-relaxed">
                A complete ecosystem designed to bridge the gap between education and employment.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {/* Feature 1 */}
              <div className="group relative bg-white rounded-[2rem] p-10 h-[500px] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between overflow-hidden border border-gray-100">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-blue-600 transition-colors duration-500">
                    <Target className="size-7 text-blue-600 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 tracking-tight">Real Tasks</h3>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    Don't just learn theory. Execute real-world micro-tasks verified by industry professionals.
                  </p>
                </div>
                <div className="absolute bottom-[-50px] right-[-50px] w-64 h-64 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative mt-8 h-40 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500">
                  {/* Abstract UI representation */}
                  <div className="absolute top-4 left-4 right-4 h-2 bg-white rounded-full shadow-sm w-3/4" />
                  <div className="absolute top-8 left-4 right-4 h-2 bg-white rounded-full shadow-sm w-1/2" />
                  <div className="absolute top-12 left-4 right-4 h-2 bg-white rounded-full shadow-sm w-2/3" />
                  <div className="absolute bottom-4 right-4 p-2 bg-green-100 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1">
                    <CheckCircle2 className="size-3" /> Verified
                  </div>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group relative bg-black text-white rounded-[2rem] p-10 h-[500px] shadow-2xl hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden md:-mt-8 md:mb-8">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-gray-900 rounded-2xl flex items-center justify-center mb-8 border border-gray-800 group-hover:border-gray-700 transition-colors">
                    <Award className="size-7 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 tracking-tight">Certified Skills</h3>
                  <p className="text-gray-400 text-lg leading-relaxed">
                    Earn recognized badges and certificates that prove your capabilities to future employers.
                  </p>
                </div>
                <div className="relative mt-8 h-40 bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-gray-800 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin-slow" />
                    <Award className="size-8 text-blue-500" />
                  </div>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group relative bg-white rounded-[2rem] p-10 h-[500px] shadow-sm hover:shadow-xl transition-all duration-500 flex flex-col justify-between overflow-hidden border border-gray-100">
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-purple-600 transition-colors duration-500">
                    <TrendingUp className="size-7 text-purple-600 group-hover:text-white transition-colors duration-500" />
                  </div>
                  <h3 className="text-3xl font-bold mb-4 tracking-tight">Career Growth</h3>
                  <p className="text-gray-500 text-lg leading-relaxed">
                    Track your progress, level up your rank, and unlock exclusive internship opportunities.
                  </p>
                </div>
                <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-purple-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative mt-8 h-40 bg-gray-50 rounded-2xl border border-gray-100 overflow-hidden group-hover:scale-[1.02] transition-transform duration-500 p-4 flex items-end justify-between gap-1">
                  <div className="w-full bg-blue-100 h-[40%] rounded-t-lg opacity-50" />
                  <div className="w-full bg-blue-200 h-[60%] rounded-t-lg opacity-60" />
                  <div className="w-full bg-blue-300 h-[50%] rounded-t-lg opacity-70" />
                  <div className="w-full bg-blue-400 h-[75%] rounded-t-lg opacity-80" />
                  <div className="w-full bg-blue-600 h-[90%] rounded-t-lg shadow-lg" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Validation / Stats */}
        <section id="community" className="py-32 bg-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-to-r from-blue-50 to-purple-50 rounded-full blur-[120px] opacity-50 -z-10" />

          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">Trusted by the Future.</h2>
              <p className="text-xl text-gray-500">Join a rapidly growing network of ambitious talent.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="text-center group cursor-default">
                <div className="text-5xl md:text-6xl font-bold text-black mb-2 tracking-tighter group-hover:scale-110 transition-transform duration-300">500+</div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Active Interns</div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-5xl md:text-6xl font-bold text-black mb-2 tracking-tighter group-hover:scale-110 transition-transform duration-300">100+</div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Partner Businesses</div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-5xl md:text-6xl font-bold text-black mb-2 tracking-tighter group-hover:scale-110 transition-transform duration-300">10k+</div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Tasks Completed</div>
              </div>
              <div className="text-center group cursor-default">
                <div className="text-5xl md:text-6xl font-bold text-black mb-2 tracking-tighter group-hover:scale-110 transition-transform duration-300">98%</div>
                <div className="text-sm font-semibold text-gray-400 uppercase tracking-widest">Success Rate</div>
              </div>
            </div>

            <div className="mt-24 text-center">
              <div className="inline-flex items-center gap-2 p-1 bg-gray-50 rounded-full border border-gray-100 pr-6">
                <span className="flex -space-x-3 pl-1">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-400">
                      {/* Placeholder Avatars */}
                      <Users className="size-5" />
                    </div>
                  ))}
                </span>
                <span className="text-sm font-medium text-gray-600 pl-2">Join thousands of students launching their careers.</span>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 font-semibold text-xl tracking-tight text-gray-900">
              <div className="bg-black text-white p-1 rounded-lg">
                <Zap className="size-4" fill="currentColor" />
              </div>
              TaskVerse
            </div>
            <div className="flex gap-8 text-sm text-gray-500 font-medium">
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-black transition-colors">Terms</a>
              <a href="#" className="hover:text-black transition-colors">Contact</a>
            </div>
            <div className="text-sm text-gray-400">
              © 2024 TaskVerse Inc.
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Dialog - Popup */}
      <Dialog open={isAuthOpen && (authMode === 'login' || authMode === 'signup')} onOpenChange={(open) => {
        setIsAuthOpen(open);
        if (!open) {
          // Reset to login if closed completely
          setTimeout(() => setAuthMode('login'), 200);
        }
      }}>
        <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white/80 backdrop-blur-xl border-white/20 shadow-2xl gap-0">
          <div className="p-6 pb-0">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-center text-3xl font-bold tracking-tight">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </DialogTitle>
              <DialogDescription className="text-center text-base">
                {authMode === 'login'
                  ? 'Enter your credentials to access your account.'
                  : 'Join TaskVerse to start your journey.'}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'signup')} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 bg-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="login-password">Password</Label>
                      <Button
                        type="button"
                        variant="link"
                        className="p-0 h-auto text-xs text-blue-600 hover:text-blue-700 font-normal"
                        onClick={() => setAuthMode('forgot-password')}
                      >
                        Forgot password?
                      </Button>
                    </div>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 bg-white/50"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${selectedRole === 'intern' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="role-login"
                          value="intern"
                          checked={selectedRole === 'intern'}
                          onChange={() => setSelectedRole('intern')}
                          className="hidden"
                        />
                        <Users className="size-4" />
                        <span className="font-medium">Intern</span>
                      </label>
                      <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${selectedRole === 'business' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="role-login"
                          value="business"
                          checked={selectedRole === 'business'}
                          onChange={() => setSelectedRole('business')}
                          className="hidden"
                        />
                        <Briefcase className="size-4" />
                        <span className="font-medium">Business</span>
                      </label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup" className="mt-0">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="h-10 bg-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-10 bg-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-10 bg-white/50"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${selectedRole === 'intern' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="role-signup"
                          value="intern"
                          checked={selectedRole === 'intern'}
                          onChange={() => setSelectedRole('intern')}
                          className="hidden"
                        />
                        <Users className="size-4" />
                        <span className="font-medium">Intern</span>
                      </label>
                      <label className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${selectedRole === 'business' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-gray-300'}`}>
                        <input
                          type="radio"
                          name="role-signup"
                          value="business"
                          checked={selectedRole === 'business'}
                          onChange={() => setSelectedRole('business')}
                          className="hidden"
                        />
                        <Briefcase className="size-4" />
                        <span className="font-medium">Business</span>
                      </label>
                    </div>
                  </div>

                  <Button type="submit" className="w-full h-11 text-base mt-2" disabled={loading}>
                    {loading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
          <div className="p-6 bg-gray-50 border-t border-gray-100 text-center text-sm text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </div>
        </DialogContent>
      </Dialog>

      {/* Forgot Password Dialog */}
      <Dialog open={authMode === 'forgot-password'} onOpenChange={(open) => {
        if (!open) setAuthMode('login'); // Return to login on close
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResetPassword} className="space-y-4 pt-4">
            <div>
              <Label htmlFor="reset-email">Email</Label>
              <Input
                id="reset-email"
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setAuthMode('login')}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Sending link...' : 'Send Reset Link'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Update Password Dialog */}
      <Dialog open={authMode === 'reset-password-confirm'} onOpenChange={(open) => {
        if (!open) setAuthMode('login');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Password</DialogTitle>
            <DialogDescription>
              Please enter your new password to complete the reset process.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdatePassword} className="space-y-4 pt-4">
            {updateError && (
              <div className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-md text-sm">
                {updateError}
              </div>
            )}
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
