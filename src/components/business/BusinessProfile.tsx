import { useEffect, useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Building2, Mail, Calendar, MapPin, Globe, Users, Briefcase, Star, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { getBusinessStats, getRecentCollaborators, getProfile, updateProfile } from '../../lib/db';
import { toast } from 'sonner';

interface BusinessProfileProps {
  user: User;
}

export function BusinessProfile({ user }: BusinessProfileProps) {
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    completedTasks: 0,
    totalInterns: 0,
    averageRating: 0
  });
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: user.name,
    industry: '',
    location: '',
    website: '',
    description: '',
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, collaboratorsData, profile] = await Promise.all([
          getBusinessStats(user.id),
          getRecentCollaborators(user.id),
          getProfile(user.id)
        ]);
        setStats(statsData);
        setCollaborators(collaboratorsData);
        setProfileData(profile);
      } catch (error) {
        console.error("Error loading business profile:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [user.id]);

  useEffect(() => {
    if (profileData) {
      setFormData({
        name: profileData.business_name || profileData.name || user.name,
        industry: profileData.industry || '',
        location: profileData.location || '',
        website: profileData.website || '',
        description: profileData.description || '',
      });
    }
  }, [profileData, user.name]);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return <div className="text-center py-10">Loading profile data...</div>;
  }

  // Merge user prop with fetched profile data
  const businessInfo = {
    name: profileData?.business_name || profileData?.name || formData.name || user.name,
    email: user.email,
    industry: profileData?.industry || formData.industry || 'Industry not set',
    location: profileData?.location || formData.location || 'Location not set',
    website: profileData?.website || formData.website || '',
    memberSince: profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : 'N/A',
    description: profileData?.description || formData.description || 'No description provided.',
    totalTasks: stats.totalTasks,
    activeTasks: stats.activeTasks,
    completedTasks: stats.completedTasks,
    averageRating: stats.averageRating,
    totalInterns: stats.totalInterns,
  };

  const handleSave = async () => {
    const payload = {
      business_name: formData.name,
      name: formData.name,
      industry: formData.industry,
      location: formData.location,
      website: formData.website,
      description: formData.description,
    };

    const success = await updateProfile(user.id, payload);

    if (success) {
      setProfileData((prev: any) => ({ ...(prev || {}), ...payload }));
      toast.success('Profile updated successfully');
      setIsDialogOpen(false);
    } else {
      toast.error('Failed to update profile');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2">Business Profile</h2>
        <p className="text-gray-600">Manage your business information and view analytics</p>
      </div>

      {/* Profile Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="size-24">
              <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white text-3xl">
                {getInitials(businessInfo.name)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl mb-2">{businessInfo.name}</h3>
                  <Badge variant="outline" className="mb-3">{businessInfo.industry}</Badge>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Mail className="size-4" />
                      <span>{businessInfo.email}</span>
                    </div>
                    {businessInfo.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4" />
                        <span>{businessInfo.location}</span>
                      </div>
                    )}
                    {businessInfo.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="size-4" />
                        <span>{businessInfo.website}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>Member since {businessInfo.memberSince}</span>
                    </div>
                  </div>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Edit className="size-4 mr-2" />
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Edit Business Profile</DialogTitle>
                      <DialogDescription>
                        Make changes to your business profile here. Click save when you're done.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="industry" className="text-right">
                          Industry
                        </Label>
                        <Input
                          id="industry"
                          value={formData.industry}
                          onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right">
                          Location
                        </Label>
                        <Input
                          id="location"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="website" className="text-right">
                          Website
                        </Label>
                        <Input
                          id="website"
                          value={formData.website}
                          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          About
                        </Label>
                        <Textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button type="submit" onClick={handleSave}>Save changes</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">{businessInfo.description}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="size-5 text-blue-600" />
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl mb-1">{businessInfo.totalTasks}</p>
            <p className="text-sm text-gray-600">
              {businessInfo.activeTasks} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Users className="size-5 text-purple-600" />
              Interns Hired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl mb-1">{businessInfo.totalInterns}</p>
            <p className="text-sm text-gray-600">
              Across all tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="size-5 text-amber-600" />
              Average Rating
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl mb-1">{Number(businessInfo.averageRating).toFixed(1)}</p>
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-4 ${i < Math.floor(businessInfo.averageRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="size-5 text-green-600" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl mb-1">{businessInfo.completedTasks}</p>
            <p className="text-sm text-gray-600">
              Successfully finished
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Collaborators */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Collaborators</CardTitle>
          <CardDescription>
            Interns who have worked on your tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {collaborators.length === 0 ? (
              <p className="text-gray-500 text-sm">No recent collaborators found.</p>
            ) : (
              collaborators.map((intern, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        {getInitials(intern.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p>{intern.name}</p>
                      <p className="text-sm text-gray-600">
                        {intern.tasks_completed} task{intern.tasks_completed !== 1 ? 's' : ''} completed
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${i < intern.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">{intern.rating}/5</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Activity Overview - Could be dynamic later, keep static for now or remove if no data source */}
      {/* Keeping static for placeholders as requested to "connect real data", but we don't have task categories breakdown easily available without more queries. */}
      {/* We can hide it or keep it static. I will keep it static for now as I don't have the data readily available in stats. */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Task Categories</CardTitle>
            <CardDescription>Distribution of your posted tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 italic">Category data Coming soon...</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Intern Feedback</CardTitle>
            <CardDescription>What interns say about working with you</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-500 italic">Feedback data Coming soon...</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
