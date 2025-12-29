import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Plus, Briefcase, Users, Calendar, Trophy, Edit, Trash2 } from 'lucide-react';
import { getTasks, createTask, updateTask, deleteTask, getApplications } from '../../lib/db';
import { toast } from 'sonner';
import type { Database } from '../../lib/supabase';

type Task = Database['public']['Tables']['tasks']['Row'] & { business_name?: string };

interface ManageTasksProps {
  user: User;
}

export function ManageTasks({ user }: ManageTasksProps) {
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const [taskDifficulty, setTaskDifficulty] = useState('');
  const [taskPoints, setTaskPoints] = useState('');
  const [taskDuration, setTaskDuration] = useState('');
  const [taskDeadline, setTaskDeadline] = useState('');
  const [taskSkills, setTaskSkills] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalApplications, setTotalApplications] = useState(0);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    const tasks = await getTasks({ businessId: user.id });
    setMyTasks(tasks);

    // Fetch total applications for this business
    const applications = await getApplications({ businessId: user.id });
    setTotalApplications(applications.length);

    setLoading(false);
  };

  const activeTasks = myTasks.filter(t => t.status === 'open');
  const completedTasks = myTasks.filter(t => t.status === 'completed');

  const handleSaveTask = async () => {
    if (!taskTitle || !taskDescription || !taskCategory || !taskDifficulty || !taskPoints) {
      toast.error('Please fill in all required fields');
      return;
    }

    const skillsArray = taskSkills.split(',').map(s => s.trim()).filter(Boolean);

    const baseTaskData = {
      business_id: user.id,
      title: taskTitle,
      description: taskDescription,
      category: taskCategory,
      difficulty: taskDifficulty as 'Beginner' | 'Intermediate' | 'Advanced',
      points: parseInt(taskPoints),
      duration: taskDuration || null,
      deadline: taskDeadline || null,
      skills: skillsArray,
    };

    let success = false;

    if (editingTaskId) {
      success = await updateTask(editingTaskId, baseTaskData);
      if (success) toast.success('Task updated successfully');
    } else {
      const newTask = await createTask({
        ...baseTaskData,
        status: 'open',
      });
      success = !!newTask;
      if (success) {
        toast.success('Task created successfully!', {
          description: 'Your task is now live and visible to interns.'
        });
      }
    }

    if (success) {
      resetForm();
      setIsCreateDialogOpen(false);
      loadTasks();
    } else {
      toast.error(editingTaskId ? 'Failed to update task' : 'Failed to create task');
    }
  };

  const resetForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskCategory('');
    setTaskDifficulty('');
    setTaskPoints('');
    setTaskDuration('');
    setTaskDeadline('');
    setTaskSkills('');
    setEditingTaskId(null);
  };

  const handleEditTask = (task: Task) => {
    setTaskTitle(task.title);
    setTaskDescription(task.description);
    setTaskCategory(task.category);
    setTaskDifficulty(task.difficulty);
    setTaskPoints(task.points.toString());
    setTaskDuration(task.duration || '');
    setTaskDeadline(task.deadline || '');
    setTaskSkills(task.skills?.join(', ') || '');
    setEditingTaskId(task.id);
    setIsCreateDialogOpen(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    const success = await deleteTask(taskId);
    if (success) {
      toast.success('Task deleted');
      loadTasks();
    } else {
      toast.error('Failed to delete task');
    }
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const [applicationCount, setApplicationCount] = useState(0);

    useEffect(() => {
      getApplications({ taskId: task.id }).then(apps => {
        setApplicationCount(apps.length);
      });
    }, [task.id]);

    return (
      <Card key={task.id} className="hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex gap-2">
              <Badge variant="outline">{task.category}</Badge>
              <Badge variant={
                task.difficulty === 'Beginner' ? 'secondary' :
                  task.difficulty === 'Intermediate' ? 'default' : 'destructive'
              }>
                {task.difficulty}
              </Badge>
            </div>
            <Badge className="bg-amber-600">
              <Trophy className="size-3 mr-1" />
              {task.points} pts
            </Badge>
          </div>
          <CardTitle className="text-lg">{task.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {task.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Users className="size-4" />
                <span>{applicationCount} Application{applicationCount !== 1 ? 's' : ''}</span>
              </div>
              {task.deadline && (
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="size-4" />
                  <span>{new Date(task.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {task.skills && task.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {task.skills.slice(0, 3).map((skill) => (
                  <Badge key={skill} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
                {task.skills.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{task.skills.length - 3}
                  </Badge>
                )}
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditTask(task)}>
                <Edit className="size-4 mr-1" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1 text-red-600 hover:text-red-700"
                onClick={() => handleDeleteTask(task.id)}
              >
                <Trash2 className="size-4 mr-1" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl mb-2">Manage Tasks</h2>
          <p className="text-gray-600">Create, edit, and manage your task postings</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
          setIsCreateDialogOpen(open);
        }}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="size-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTaskId ? 'Edit Task' : 'Create New Task'}</DialogTitle>
              <DialogDescription>
                {editingTaskId ? 'Update the details of your task' : 'Post a new micro-task for interns to complete'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Task Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Design a Social Media Banner"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Describe what needs to be done, requirements, deliverables, etc."
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category *</Label>
                  <Select value={taskCategory} onValueChange={setTaskCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Content Writing">Content Writing</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Research">Research</SelectItem>
                      <SelectItem value="Data Entry">Data Entry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty *</Label>
                  <Select value={taskDifficulty} onValueChange={setTaskDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Beginner">Beginner</SelectItem>
                      <SelectItem value="Intermediate">Intermediate</SelectItem>
                      <SelectItem value="Advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points">Points Reward *</Label>
                  <Input
                    id="points"
                    type="number"
                    placeholder="e.g., 50"
                    value={taskPoints}
                    onChange={(e) => setTaskPoints(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Estimated Duration</Label>
                  <Input
                    id="duration"
                    placeholder="e.g., 2-3 hours"
                    value={taskDuration}
                    onChange={(e) => setTaskDuration(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={taskDeadline}
                  onChange={(e) => setTaskDeadline(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="skills">Required Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  placeholder="e.g., Graphic Design, Canva, Adobe Photoshop"
                  value={taskSkills}
                  onChange={(e) => setTaskSkills(e.target.value)}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button className="flex-1" onClick={handleSaveTask}>
                  {editingTaskId ? 'Update Task' : 'Create Task'}
                </Button>
                <Button variant="outline" onClick={() => {
                  resetForm();
                  setIsCreateDialogOpen(false);
                }}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="size-5 text-blue-600" />
              Active Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{activeTasks.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="size-5 text-purple-600" />
              Total Applications
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{loading ? '...' : totalApplications}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="size-5 text-green-600" />
              Completed Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{completedTasks.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tasks List */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({myTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Loading...</p>
            </Card>
          ) : activeTasks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Briefcase className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">No active tasks</p>
              <Button onClick={() => {
                resetForm();
                setIsCreateDialogOpen(true);
              }}>
                <Plus className="size-4 mr-2" />
                Create Your First Task
              </Button>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Loading...</p>
            </Card>
          ) : completedTasks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Trophy className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No completed tasks yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="mt-6">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Loading...</p>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myTasks.map(task => <TaskCard key={task.id} task={task} />)}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
