import { useState, useEffect } from "react";
import { MessageSquare, User, Trash2 } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader } from "./ui/card";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { toast } from "sonner";

interface Comment {
  id: string;
  articleId: string;
  name: string;
  content: string;
  createdAt: string;
}

interface CommentSectionProps {
  articleId: string;
  isAdmin?: boolean;
  accessToken?: string | null;
}

export function CommentSection({ articleId, isAdmin = false, accessToken }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [articleId]);

  const loadComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/comments/${articleId}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to load comments:', await response.text());
        toast.error('Failed to load comments');
        return;
      }

      const data = await response.json();
      setComments(data.comments || []);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Unable to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate name length
    if (name.trim().length < 2) {
      toast.error('Name must be at least 2 characters');
      return;
    }

    // Validate content length
    if (content.trim().length < 3) {
      toast.error('Comment must be at least 3 characters');
      return;
    }

    if (content.trim().length > 1000) {
      toast.error('Comment must be less than 1000 characters');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/comments/${articleId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify({ name: name.trim(), content: content.trim() }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to submit comment:', error);
        toast.error('Failed to submit comment. Please try again.');
        return;
      }

      setName("");
      setContent("");
      await loadComments();
      toast.success('Comment submitted successfully!');
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Unable to submit comment. Please check your connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/comments/${articleId}/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to delete comment:', error);
        toast.error('Failed to delete comment. Please try again.');
        return;
      }

      await loadComments();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Unable to delete comment. Please check your connection.');
    }
  };

  return (
    <div className="mt-12">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-6 h-6" />
        <h3>Comments ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      <Card className="mb-8">
        <CardHeader>
          <h4>Leave a Comment</h4>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Your Comment"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={4}
                required
                maxLength={1000}
              />
              <p className="text-xs text-gray-500 mt-1 text-right">
                {content.length}/1000 characters
              </p>
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Comment'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Comments List */}
      {loading ? (
        <p className="text-gray-500">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <Card key={comment.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{comment.name}</span>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="mt-2 text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(comment.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
