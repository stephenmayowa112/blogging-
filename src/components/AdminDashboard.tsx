import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Edit, Trash2, Plus, LogOut, Eye } from "lucide-react";
import { projectId, publicAnonKey } from "../utils/supabase/info";
import { ArticleEditor } from "./ArticleEditor";
import { createClient } from "@supabase/supabase-js";
import { toast } from "sonner";

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  audioUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AdminDashboardProps {
  accessToken: string;
  onLogout: () => void;
  onViewBlog: () => void;
}

export function AdminDashboard({ accessToken, onLogout, onViewBlog }: AdminDashboardProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/articles`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to load articles:', await response.text());
        toast.error('Failed to load articles');
        return;
      }

      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('Unable to load articles. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/articles`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(articleData),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to create article:', error);
        toast.error('Failed to create article. Please try again.');
        return;
      }

      setIsCreating(false);
      await loadArticles();
      toast.success('Article created successfully!');
    } catch (error) {
      console.error('Error creating article:', error);
      toast.error('Unable to create article. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingArticle) return;

    setSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/articles/${editingArticle.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(articleData),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to update article:', error);
        toast.error('Failed to update article. Please try again.');
        return;
      }

      setEditingArticle(null);
      await loadArticles();
      toast.success('Article updated successfully!');
    } catch (error) {
      console.error('Error updating article:', error);
      toast.error('Unable to update article. Please check your connection.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article? This will also delete all comments.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/articles/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.text();
        console.error('Failed to delete article:', error);
        toast.error('Failed to delete article. Please try again.');
        return;
      }

      await loadArticles();
      toast.success('Article deleted successfully');
    } catch (error) {
      console.error('Error deleting article:', error);
      toast.error('Unable to delete article. Please check your connection.');
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onLogout();
  };

  if (isCreating) {
    return (
      <ArticleEditor
        onSave={handleCreate}
        onCancel={() => setIsCreating(false)}
        saving={saving}
      />
    );
  }

  if (editingArticle) {
    return (
      <ArticleEditor
        article={editingArticle}
        onSave={handleUpdate}
        onCancel={() => setEditingArticle(null)}
        saving={saving}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1>Admin Dashboard</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onViewBlog}>
              <Eye className="w-4 h-4 mr-2" />
              View Blog
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2>Your Articles ({articles.length})</h2>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading articles...</p>
          </div>
        ) : articles.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">No articles yet. Create your first one!</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Article
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="mb-2">{article.title}</h3>
                      <p className="text-gray-600 mb-4">{article.excerpt}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Created: {new Date(article.createdAt).toLocaleDateString()}
                        </span>
                        {article.updatedAt !== article.createdAt && (
                          <span>
                            Updated: {new Date(article.updatedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingArticle(article)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(article.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}