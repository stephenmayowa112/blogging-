import { useState, useEffect } from 'react';
import { ArrowLeft, Volume2, VolumeX, Calendar, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Comment {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  videoUrl?: string;
  createdAt: string;
}

interface ArticleViewProps {
  articleId: string;
  onBack: () => void;
}

export function ArticleView({ articleId, onBack }: ArticleViewProps) {
  const [article, setArticle] = useState<Article | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReading, setIsReading] = useState(false);
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  useEffect(() => {
    fetchArticle();
    fetchComments();
  }, [articleId]);
  
  const fetchArticle = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/articles/${articleId}`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch article');
      }
      
      const data = await response.json();
      setArticle(data.article);
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchComments = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/articles/${articleId}/comments`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      
      const data = await response.json();
      setComments(data.comments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };
  
  const handleAudioToggle = () => {
    if (!article) return;
    
    if (isReading) {
      window.speechSynthesis.cancel();
      setIsReading(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(article.content);
      utterance.onend = () => setIsReading(false);
      window.speechSynthesis.speak(utterance);
      setIsReading(true);
    }
  };
  
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentAuthor.trim() || !commentContent.trim()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/articles/${articleId}/comments`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            author: commentAuthor,
            content: commentContent
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }
      
      const data = await response.json();
      setComments([...comments, data.comment]);
      setCommentAuthor('');
      setCommentContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading article...</p>
      </div>
    );
  }
  
  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-gray-500">Article not found</p>
        <Button onClick={onBack}>Go Back</Button>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-6"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to Articles
        </Button>
        
        <article className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-500">
              <Calendar className="size-4" />
              {formatDate(article.createdAt)}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAudioToggle}
            >
              {isReading ? (
                <>
                  <VolumeX className="size-4 mr-2" />
                  Stop Audio
                </>
              ) : (
                <>
                  <Volume2 className="size-4 mr-2" />
                  Listen to Article
                </>
              )}
            </Button>
          </div>
          
          <h1 className="text-4xl mb-6">{article.title}</h1>
          
          {article.coverImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <ImageWithFallback
                src={article.coverImage}
                alt={article.title}
                className="w-full"
              />
            </div>
          )}
          
          {article.videoUrl && (
            <div className="mb-8 aspect-video rounded-lg overflow-hidden">
              <iframe
                src={article.videoUrl}
                className="w-full h-full"
                allowFullScreen
                title="Article video"
              />
            </div>
          )}
          
          <div className="prose max-w-none">
            <p className="text-xl text-gray-600 mb-6">{article.excerpt}</p>
            <div className="whitespace-pre-wrap text-gray-800">{article.content}</div>
          </div>
        </article>
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              <h2 className="text-2xl">Comments ({comments.length})</h2>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitComment} className="mb-8 space-y-4">
              <Input
                placeholder="Your name"
                value={commentAuthor}
                onChange={(e) => setCommentAuthor(e.target.value)}
                required
              />
              <Textarea
                placeholder="Share your thoughts..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                rows={4}
                required
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Posting...' : 'Post Comment'}
              </Button>
            </form>
            
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-center py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="border-b pb-6 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="size-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm text-blue-600">
                          {comment.author[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm">{comment.author}</p>
                        <p className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </p>
                      </div>
                    </div>
                    <p className="text-gray-700 ml-10">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
