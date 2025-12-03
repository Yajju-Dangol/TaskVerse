import React, { useState, useEffect } from 'react';
import { User } from '../../App';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Star, CheckCircle, XCircle, Clock, FileText } from 'lucide-react';
import { getSubmissions, updateSubmission, getTask } from '../../lib/db';
import { toast } from 'sonner';
import type { Database } from '../../lib/supabase';

type Submission = Database['public']['Tables']['submissions']['Row'] & {
  intern_name?: string;
  task_title?: string;
};

interface ReviewSubmissionsProps {
  user: User;
}

export function ReviewSubmissions({ user }: ReviewSubmissionsProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    const data = await getSubmissions({ businessId: user.id });
    setSubmissions(data);
    setLoading(false);
  };

  const pendingSubmissions = submissions.filter(s => s.status === 'pending');
  const approvedSubmissions = submissions.filter(s => s.status === 'approved');
  const rejectedSubmissions = submissions.filter(s => s.status === 'rejected');

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleApprove = async () => {
    if (!selectedSubmission || rating === 0) {
      toast.error('Please provide a rating');
      return;
    }

    const success = await updateSubmission(selectedSubmission.id, {
      status: 'approved',
      rating,
      feedback: feedback || null,
    });

    if (success) {
      toast.success('Submission approved!', {
        description: `Points have been awarded to ${selectedSubmission.intern_name}.`
      });
      setSelectedSubmission(null);
      setRating(0);
      setFeedback('');
      loadSubmissions();
    } else {
      toast.error('Failed to approve submission');
    }
  };

  const handleReject = async () => {
    if (!selectedSubmission || !feedback) {
      toast.error('Please provide feedback for rejection');
      return;
    }

    const success = await updateSubmission(selectedSubmission.id, {
      status: 'rejected',
      feedback,
    });

    if (success) {
      toast.success('Submission rejected', {
        description: 'The intern has been notified with your feedback.'
      });
      setSelectedSubmission(null);
      setRating(0);
      setFeedback('');
      loadSubmissions();
    } else {
      toast.error('Failed to reject submission');
    }
  };

  const renderSubmissionCard = (submission: Submission) => {
    return (
      <Card 
        key={submission.id} 
        className="hover:shadow-lg transition-shadow cursor-pointer"
        onClick={() => setSelectedSubmission(submission)}
      >
        <CardHeader>
          <div className="flex items-start justify-between gap-2 mb-2">
            <Badge variant={
              submission.status === 'approved' ? 'default' :
              submission.status === 'rejected' ? 'destructive' : 'secondary'
            }>
              {submission.status === 'pending' && <Clock className="size-3 mr-1" />}
              {submission.status === 'approved' && <CheckCircle className="size-3 mr-1" />}
              {submission.status === 'rejected' && <XCircle className="size-3 mr-1" />}
              {submission.status.toUpperCase()}
            </Badge>
            <span className="text-sm text-gray-500">
              {new Date(submission.submitted_date).toLocaleDateString()}
            </span>
          </div>
          <CardTitle className="text-lg">{submission.task_title || 'Task'}</CardTitle>
          <CardDescription>
            Submitted by {submission.intern_name || 'Intern'}
          </CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <Avatar className="size-6">
              <AvatarFallback className="text-xs bg-blue-600 text-white">
                {getInitials(submission.intern_name || 'I')}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{submission.intern_name || 'Intern'}</span>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {submission.description}
          </p>
          
          {submission.rating && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`size-4 ${i < submission.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm">Rated {submission.rating}/5</span>
            </div>
          )}

          {submission.status === 'pending' && (
            <Button className="w-full mt-3">
              Review Submission
            </Button>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl mb-2">Review Submissions</h2>
        <p className="text-gray-600">Review completed work and provide feedback to interns</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="size-5 text-amber-600" />
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{pendingSubmissions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="size-5 text-green-600" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{approvedSubmissions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-red-600" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl">{rejectedSubmissions.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">
            Pending ({pendingSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="approved">
            Approved ({approvedSubmissions.length})
          </TabsTrigger>
          <TabsTrigger value="rejected">
            Rejected ({rejectedSubmissions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Loading...</p>
            </Card>
          ) : pendingSubmissions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {pendingSubmissions.map(renderSubmissionCard)}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Clock className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No pending submissions</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Loading...</p>
            </Card>
          ) : approvedSubmissions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {approvedSubmissions.map(renderSubmissionCard)}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <CheckCircle className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No approved submissions yet</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {loading ? (
            <Card className="p-12 text-center">
              <p className="text-gray-500">Loading...</p>
            </Card>
          ) : rejectedSubmissions.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {rejectedSubmissions.map(renderSubmissionCard)}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <XCircle className="size-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">No rejected submissions</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      {selectedSubmission && (
        <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Review Submission</DialogTitle>
              <DialogDescription>
                Review work from {selectedSubmission.internName}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Task Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500 mb-1">Task</p>
                <p>{selectedSubmission.task_title || 'Task'}</p>
              </div>

              {/* Intern Info */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                <Avatar>
                  <AvatarFallback className="bg-blue-600 text-white">
                    {getInitials(selectedSubmission.intern_name || 'I')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p>{selectedSubmission.intern_name || 'Intern'}</p>
                  <p className="text-sm text-gray-500">
                    Submitted on {new Date(selectedSubmission.submitted_date).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Submission Content */}
              <div>
                <Label>Submission Description</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm">{selectedSubmission.description}</p>
                </div>
              </div>

              {/* Files */}
              {selectedSubmission.attachment_url && (
                <div>
                  <Label>Attachments</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg flex items-center gap-2">
                    <FileText className="size-4 text-gray-600" />
                    <span className="text-sm">Attachment</span>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="ml-auto"
                      onClick={() => window.open(selectedSubmission.attachment_url!, '_blank')}
                    >
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {selectedSubmission.status === 'pending' && (
                <>
                  {/* Rating */}
                  <div>
                    <Label>Rate the Work *</Label>
                    <div className="flex gap-2 mt-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-8 cursor-pointer transition-colors ${
                            i < (hoveredRating || rating) 
                              ? 'fill-amber-400 text-amber-400' 
                              : 'text-gray-300'
                          }`}
                          onMouseEnter={() => setHoveredRating(i + 1)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => setRating(i + 1)}
                        />
                      ))}
                      {rating > 0 && (
                        <span className="ml-2 text-sm text-gray-600">
                          {rating}/5 stars
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <Label htmlFor="feedback">Feedback</Label>
                    <Textarea
                      id="feedback"
                      placeholder="Provide constructive feedback on the work..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="mt-2 min-h-[100px]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                      <CheckCircle className="size-4 mr-2" />
                      Approve & Award Points
                    </Button>
                    <Button 
                      variant="destructive" 
                      className="flex-1" 
                      onClick={handleReject}
                    >
                      <XCircle className="size-4 mr-2" />
                      Request Revision
                    </Button>
                  </div>
                </>
              )}

              {selectedSubmission.status === 'approved' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="size-5 text-green-600" />
                    <p className="text-green-800">Approved</p>
                  </div>
                  {selectedSubmission.feedback && (
                    <p className="text-sm text-gray-600 italic">"{selectedSubmission.feedback}"</p>
                  )}
                  {selectedSubmission.rating && (
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`size-4 ${i < selectedSubmission.rating! ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      <span className="text-sm">Rating: {selectedSubmission.rating}/5</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}