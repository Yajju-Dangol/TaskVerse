import { useEffect, useState } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Briefcase, Users, Star, TrendingUp, ArrowRight, CheckCircle } from 'lucide-react';
import { getTasks, getSubmissions, getApplications, type TaskWithBusiness, type SubmissionWithMeta } from '../../lib/db';

interface BusinessHomeProps {
  user: User;
  onNavigate: (tab: string) => void;
}

export function BusinessHome({ user, onNavigate }: BusinessHomeProps) {
  const [myTasks, setMyTasks] = useState<TaskWithBusiness[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<SubmissionWithMeta[]>([]);
  const [activeTasks, setActiveTasks] = useState(0);
  const [totalApplications, setTotalApplications] = useState(0);
  const [pendingSubmissions, setPendingSubmissions] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user.id) return;

      const [tasks, submissions, applications] = await Promise.all([
        getTasks({ businessId: user.id }),
        getSubmissions({ businessId: user.id }),
        getApplications({ businessId: user.id }),
      ]);

      setMyTasks(tasks);
      setActiveTasks(tasks.filter(t => t.status === 'open').length);
      setCompletedTasks(tasks.filter(t => t.status === 'completed').length);

      setPendingSubmissions(submissions.filter(s => s.status === 'pending').length);
      const sortedSubs = [...submissions].sort(
        (a, b) => new Date(b.submitted_date).getTime() - new Date(a.submitted_date).getTime()
      );
      setRecentSubmissions(sortedSubs.slice(0, 3));

      setTotalApplications(applications.length);
    };

    loadDashboardData();
  }, [user.id]);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white">
        <h2 className="text-3xl mb-2">Welcome back, {user.name}! 👋</h2>
        <p className="opacity-90 mb-6">
          Manage your tasks, review submissions, and find talented interns.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Briefcase className="size-5 mb-2" />
            <p className="text-2xl">{activeTasks}</p>
            <p className="text-sm opacity-80">Active Tasks</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <Users className="size-5 mb-2" />
            <p className="text-2xl">{totalApplications}</p>
            <p className="text-sm opacity-80">Applications</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <TrendingUp className="size-5 mb-2" />
            <p className="text-2xl">{pendingSubmissions}</p>
            <p className="text-sm opacity-80">Pending Reviews</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <CheckCircle className="size-5 mb-2" />
            <p className="text-2xl">{completedTasks}</p>
            <p className="text-sm opacity-80">Completed</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('tasks')}>
          <CardHeader>
            <Briefcase className="size-8 text-blue-600 mb-2" />
            <CardTitle>Post New Task</CardTitle>
            <CardDescription>
              Create a new micro-task and find talented interns
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('submissions')}>
          <CardHeader>
            <Users className="size-8 text-purple-600 mb-2" />
            <CardTitle>Review Submissions</CardTitle>
            <CardDescription>
              Check pending work and provide feedback
            </CardDescription>
          </CardHeader>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => onNavigate('tasks')}>
          <CardHeader>
            <TrendingUp className="size-8 text-green-600 mb-2" />
            <CardTitle>Manage Tasks</CardTitle>
            <CardDescription>
              View and edit your active task postings
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Recent Submissions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl">Recent Submissions</h3>
          <Button variant="ghost" onClick={() => onNavigate('submissions')}>
            View All
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>

        {recentSubmissions.length > 0 ? (
          <div className="space-y-4">
            {recentSubmissions.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-lg">{submission.task_title}</h4>
                        <Badge
                          variant={
                            submission.status === 'approved'
                              ? 'default'
                              : submission.status === 'rejected'
                              ? 'destructive'
                              : 'secondary'
                          }
                        >
                          {submission.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Submitted by <span>{submission.intern_name}</span>
                      </p>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {submission.description}
                      </p>
                      {submission.rating && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`size-4 ${
                                  i < submission.rating!
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-sm text-gray-600">
                            Rating: {submission.rating}/5
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500 mb-2">
                        {new Date(submission.submitted_date).toLocaleDateString()}
                      </p>
                      {submission.status === 'pending' && (
                        <Button size="sm" onClick={() => onNavigate('submissions')}>
                          Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Users className="size-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No recent submissions</p>
          </Card>
        )}
      </div>

      {/* Active Tasks Overview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl">Active Tasks</h3>
          <Button variant="ghost" onClick={() => onNavigate('tasks')}>
            Manage All
            <ArrowRight className="size-4 ml-2" />
          </Button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myTasks.filter(t => t.status === 'open').slice(0, 3).map((task) => (
            <Card key={task.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="outline">{task.category}</Badge>
                  <Badge className="bg-amber-600">{task.points} pts</Badge>
                </div>
                <CardTitle className="text-lg">{task.title}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {task.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Applications</span>
                    <span>5</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Deadline</span>
                    <span>{new Date(task.deadline || '').toLocaleDateString()}</span>
                  </div>
                  <Button variant="outline" className="w-full mt-2" onClick={() => onNavigate('tasks')}>
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
