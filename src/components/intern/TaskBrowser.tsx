import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Search, Trophy, Clock, Calendar, Building2, Tag } from 'lucide-react';
import { getTasks, createApplication } from '../../lib/db';
import { toast } from 'sonner';
import type { Database } from '../../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'] & { business_name?: string };

interface TaskBrowserProps {
  user: User;
}

export function TaskBrowser({ user }: TaskBrowserProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [applicationText, setApplicationText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [categoryFilter, difficultyFilter, searchQuery]);

  const loadTasks = async () => {
    setLoading(true);
    const fetchedTasks = await getTasks({
      status: 'open',
      category: categoryFilter,
      difficulty: difficultyFilter,
      search: searchQuery || undefined,
    });
    setTasks(fetchedTasks);
    setLoading(false);
  };

  const categories = ['all', ...Array.from(new Set(tasks.map(t => t.category)))];
  
  const filteredTasks = tasks.filter(task => {
    if (searchQuery) {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;
    }
    return true;
  });

  const handleApply = async () => {
    if (!selectedTask || !applicationText.trim()) {
      toast.error('Please provide application text');
      return;
    }

    const application = await createApplication({
      task_id: selectedTask.id,
      intern_id: user.id,
      application_text: applicationText,
      status: 'pending',
    });

    if (application) {
      toast.success('Application submitted!', {
        description: `You've applied for "${selectedTask.title}". The business will review your application soon.`
      });
      setSelectedTask(null);
      setApplicationText('');
      loadTasks(); // Refresh tasks
    } else {
      toast.error('Failed to submit application');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl mb-2">Browse Tasks</h2>
        <p className="text-gray-600">Find micro-tasks that match your skills and interests</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat === 'all' ? 'All Categories' : cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Task Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTasks.map((task) => (
          <Card key={task.id} className="hover:shadow-lg transition-shadow flex flex-col">
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
                  <span>{task.points} pts</span>
                </div>
              </div>
              <CardTitle className="text-lg">{task.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {task.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Building2 className="size-4" />
                  <span>{task.business_name || 'Business'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="size-4" />
                  <span>{task.duration || 'N/A'}</span>
                </div>
                {task.deadline && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="size-4" />
                    <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                )}
                {task.skills && task.skills.length > 0 && (
                  <div className="flex items-start gap-2">
                    <Tag className="size-4 mt-1 text-gray-400" />
                    <div className="flex flex-wrap gap-1">
                      {task.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4" onClick={() => setSelectedTask(task)}>
                    View & Apply
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{task.title}</DialogTitle>
                    <DialogDescription>
                      Posted by {task.business_name || 'Business'}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={
                        task.difficulty === 'Beginner' ? 'secondary' :
                        task.difficulty === 'Intermediate' ? 'default' : 'destructive'
                      }>
                        {task.difficulty}
                      </Badge>
                      <Badge variant="outline">{task.category}</Badge>
                      <Badge className="bg-amber-600">
                        <Trophy className="size-3 mr-1" />
                        {task.points} points
                      </Badge>
                    </div>

                    <div>
                      <h4 className="mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{task.description}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Duration</p>
                        <p className="text-sm">{task.duration || 'N/A'}</p>
                      </div>
                      {task.deadline && (
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Deadline</p>
                          <p className="text-sm">{new Date(task.deadline).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>

                    {task.skills && task.skills.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Required Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {task.skills.map((skill) => (
                            <Badge key={skill} variant="outline">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="border-t pt-4">
                      <Label htmlFor="application">Why are you a good fit for this task?</Label>
                      <Textarea
                        id="application"
                        placeholder="Tell the business about your relevant skills and experience..."
                        value={applicationText}
                        onChange={(e) => setApplicationText(e.target.value)}
                        className="mt-2 min-h-[100px]"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={handleApply}>
                        Submit Application
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">Loading tasks...</p>
        </Card>
      ) : filteredTasks.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">No tasks found matching your criteria.</p>
          <Button 
            variant="link" 
            onClick={() => {
              setSearchQuery('');
              setCategoryFilter('all');
              setDifficultyFilter('all');
            }}
          >
            Clear filters
          </Button>
        </Card>
      ) : null}
    </div>
  );
}
