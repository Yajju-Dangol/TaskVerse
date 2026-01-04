import { useState, useEffect } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Clock, CheckCircle, AlertCircle, Upload, Star } from 'lucide-react';
import { getApplications, getTask, createSubmission, uploadFile, getSubmissions, TaskWithBusiness, SubmissionWithMeta } from '../../lib/db';
import { toast } from 'sonner';
import type { Database } from '../../lib/supabase';

type Application = Database['public']['Tables']['applications']['Row'];

interface MyTasksProps {
  user: User;
}

interface MyTask {
  task: TaskWithBusiness;
  application: Application;
  submission?: SubmissionWithMeta;
  status: 'in-progress' | 'submitted' | 'completed' | 'needs-revision';
}

export function MyTasks({ user }: MyTasksProps) {
  const [myTasks, setMyTasks] = useState<MyTask[]>([]);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFile, setSubmissionFile] = useState<File | null>(null);
  const [selectedTask, setSelectedTask] = useState<MyTask | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyTasks();
  }, []);

  const loadMyTasks = async () => {
    setLoading(true);

    try {
      // Fetch all data in parallel to ensure consistency
      const [applications, submissions] = await Promise.all([
        getApplications({ internId: user.id }),
        getSubmissions({ internId: user.id })
      ]);

      const tasksWithData = await Promise.all(
        applications.map(async (app) => {
          const task = await getTask(app.task_id);
          if (!task) return null;

          // Get the latest submission for this task (getSubmissions returns ordered by date desc)
          const submission = submissions.find(s => s.task_id === app.task_id);

          let status: 'in-progress' | 'submitted' | 'completed' | 'needs-revision' = 'in-progress';
          if (submission) {
            if (submission.status === 'approved') status = 'completed';
            else if (submission.status === 'rejected') status = 'needs-revision';
            else status = 'submitted';
          }

          return {
            task,
            application: app,
            submission,
            status,
          };
        })
      );

      setMyTasks(tasksWithData.filter(t => t !== null) as MyTask[]);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const inProgressTasks = myTasks.filter(t => t.status === 'in-progress');
  const submittedTasks = myTasks.filter(t => t.status === 'submitted');
  const completedTasks = myTasks.filter(t => t.status === 'completed');

  const handleSubmit = async () => {
    if (!selectedTask || !submissionText.trim()) {
      toast.error('Please provide a description of your work');
      return;
    }

    let attachmentUrl: string | null = null;
    if (submissionFile) {
      attachmentUrl = await uploadFile(submissionFile, user.id);
      if (!attachmentUrl) {
        toast.error('Failed to upload file');
        return;
      }
    }

    const submission = await createSubmission({
      task_id: selectedTask.task.id,
      intern_id: user.id,
      description: submissionText,
      attachment_url: attachmentUrl,
      status: 'pending',
      rating: null,
      feedback: null,
    });

    if (submission) {
      toast.success('Submission uploaded!', {
        description: 'Your work has been submitted for review. You\'ll receive feedback soon.'
      });
      setSelectedTask(null);
      setSubmissionText('');
      setSubmissionFile(null);
      loadMyTasks();
    } else {
      toast.error('Failed to submit work');
    }
  };

  const renderTaskCard = (myTask: MyTask) => (
    <Card key={myTask.task.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between gap-2 mb-2">
          <Badge variant={
            myTask.status === 'completed' ? 'default' :
              myTask.status === 'submitted' ? 'secondary' :
                myTask.status === 'needs-revision' ? 'destructive' : 'outline'
          }>
            {myTask.status === 'in-progress' && <Clock className="size-3 mr-1" />}
            {myTask.status === 'completed' && <CheckCircle className="size-3 mr-1" />}
            {myTask.status === 'submitted' && <Upload className="size-3 mr-1" />}
            {myTask.status === 'needs-revision' && <AlertCircle className="size-3 mr-1" />}
            {myTask.status.replace('-', ' ').toUpperCase()}
          </Badge>
          <span className="text-sm text-gray-500">
            Applied: {new Date(myTask.application.created_at).toLocaleDateString()}
          </span>
        </div>
        <CardTitle className="text-lg">{myTask.task.title}</CardTitle>
        <CardDescription>{myTask.task.business_name || 'Business'}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-sm text-gray-600 line-clamp-2">
            {myTask.task.description}
          </p>

          {myTask.status === 'completed' && myTask.submission?.rating && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-4 ${i < myTask.submission!.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <span className="text-sm">Rating: {myTask.submission.rating}/5</span>
              </div>
              {myTask.submission.feedback && (
                <p className="text-sm text-gray-600 italic">"{myTask.submission.feedback}"</p>
              )}
              <p className="text-sm text-green-600 mt-2">
                +{myTask.task.points} points earned! 🎉
              </p>
            </div>
          )}

          {myTask.status === 'submitted' && myTask.submission && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-600">
                Submitted on {new Date(myTask.submission.submitted_date).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Waiting for business review...
              </p>
            </div>
          )}

          {myTask.status === 'in-progress' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full" onClick={() => setSelectedTask(myTask)}>
                  Submit Work
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Your Work</DialogTitle>
                  <DialogDescription>
                    Upload your completed work for "{myTask.task.title}"
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="submission-desc">Description of Work</Label>
                    <Textarea
                      id="submission-desc"
                      placeholder="Describe what you've completed and any important details..."
                      value={submissionText}
                      onChange={(e) => setSubmissionText(e.target.value)}
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  <div>
                    <Label htmlFor="file-upload">Upload Files (Optional)</Label>
                    <Input
                      id="file-upload"
                      type="file"
                      className="mt-2"
                      onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported formats: PDF, DOCX, PNG, JPG, ZIP (Max 10MB)
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleSubmit}>
                      Submit for Review
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}

          {myTask.status === 'completed' && (
            <Button variant="outline" className="w-full">
              View Details
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2">My Tasks</h2>
        <p className="text-gray-600">Track your applications, submissions, and completed work</p>
      </div>

      <Tabs defaultValue="in-progress">
        <TabsList>
          <TabsTrigger value="in-progress">
            In Progress ({inProgressTasks.length})
          </TabsTrigger>
          <TabsTrigger value="submitted">
            Submitted ({submittedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedTasks.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="mt-6">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Loading...</p>
            </Card>
          ) : inProgressTasks.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {inProgressTasks.map(renderTaskCard)}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Clock className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500 mb-4">No tasks in progress</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="submitted" className="mt-6">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Loading...</p>
            </Card>
          ) : submittedTasks.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {submittedTasks.map(renderTaskCard)}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Upload className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No submitted tasks awaiting review</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Loading...</p>
            </Card>
          ) : completedTasks.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {completedTasks.map(renderTaskCard)}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CheckCircle className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No completed tasks yet</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
