import { useState, useEffect } from "react";
import { BookOpen, ArrowLeft, Shield } from "lucide-react";
import { Button } from "./components/ui/button";
import { ArticleCard } from "./components/ArticleCard";
import { CommentSection } from "./components/CommentSection";
import { AudioPlayer } from "./components/AudioPlayer";
import { AdminLogin } from "./components/AdminLogin";
import { AdminDashboard } from "./components/AdminDashboard";
import { projectId, publicAnonKey } from "./utils/supabase/info";
import { createClient } from "@supabase/supabase-js";
import { Toaster, toast } from "sonner";

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

type View = 'home' | 'article' | 'admin-login' | 'admin-dashboard';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [articles, setArticles] = useState<Article[]>([]);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    // Restore session from localStorage
    return localStorage.getItem('access_token');
  });

  useEffect(() => {
    checkSession();
    loadArticles();
  }, []);

  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      setAccessToken(session.access_token);
      localStorage.setItem('access_token', session.access_token);
    }
  };

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
        toast.error('Failed to load articles. Please try again.');
        return;
      }

      const data = await response.json();
      setArticles(data.articles || []);
    } catch (error) {
      console.error('Error loading articles:', error);
      toast.error('Unable to connect to the server. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleReadMore = async (id: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/articles/${id}`,
        {
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Failed to load article:', await response.text());
        toast.error('Failed to load article. Please try again.');
        return;
      }

      const data = await response.json();
      setSelectedArticle(data.article);
      setCurrentView('article');
      window.scrollTo(0, 0);
    } catch (error) {
      console.error('Error loading article:', error);
      toast.error('Unable to load article. Please check your connection.');
    }
  };

  const handleBackToHome = () => {
    setCurrentView('home');
    setSelectedArticle(null);
    loadArticles(); // Refresh articles when going back
  };

  const handleLoginSuccess = (token: string) => {
    setAccessToken(token);
    localStorage.setItem('access_token', token);
    setCurrentView('admin-dashboard');
    toast.success('Successfully logged in!');
  };

  const handleLogout = () => {
    setAccessToken(null);
    localStorage.removeItem('access_token');
    setCurrentView('home');
    toast.success('Successfully logged out');
  };

  // Home/Blog View
  if (currentView === 'home') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1>My Blog</h1>
                  <p className="text-sm text-gray-600">Thoughts, stories, and ideas</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setCurrentView('admin-login')}
              >
                <Shield className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </div>
          </div>
        </header>

        {/* Blog Posts */}
        <main className="max-w-6xl mx-auto px-4 py-8">
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading articles...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No articles published yet.</p>
              <p className="text-sm text-gray-400">Check back soon for new content!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  onReadMore={handleReadMore}
                />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-6xl mx-auto px-4 py-6 text-center text-gray-600 text-sm">
            <p>© 2024 My Blog. All rights reserved.</p>
          </div>
        </footer>
        </div>
      </>
    );
  }

  // Article Detail View
  if (currentView === 'article' && selectedArticle) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Button variant="ghost" onClick={handleBackToHome}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </div>
        </header>

        {/* Article Content */}
        <article className="max-w-4xl mx-auto px-4 py-8">
          {/* Featured Image */}
          {selectedArticle.imageUrl && (
            <div className="w-full h-96 overflow-hidden rounded-lg mb-8">
              <img
                src={selectedArticle.imageUrl}
                alt={selectedArticle.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Title and Meta */}
          <div className="mb-8">
            <h1 className="mb-4">{selectedArticle.title}</h1>
            <div className="text-gray-600">
              {new Date(selectedArticle.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>

          {/* Audio Player */}
          <AudioPlayer
            audioUrl={selectedArticle.audioUrl}
            text={selectedArticle.content}
          />

          {/* Video Embed */}
          {selectedArticle.videoUrl && (
            <div className="mb-8 aspect-video">
              <iframe
                src={selectedArticle.videoUrl}
                title={`Video for ${selectedArticle.title}`}
                className="w-full h-full rounded-lg"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {/* Article Content */}
          <div className="prose prose-lg max-w-none mb-12">
            <div className="whitespace-pre-wrap">{selectedArticle.content}</div>
          </div>

          {/* Comments Section */}
          <CommentSection
            articleId={selectedArticle.id}
            isAdmin={!!accessToken}
            accessToken={accessToken}
          />
        </article>
        </div>
      </>
    );
  }

  // Admin Login View
  if (currentView === 'admin-login') {
    return (
      <>
        <Toaster position="top-right" richColors />
        <AdminLogin onLoginSuccess={handleLoginSuccess} />
      </>
    );
  }

  // Admin Dashboard View
  if (currentView === 'admin-dashboard' && accessToken) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <AdminDashboard
          accessToken={accessToken}
          onLogout={handleLogout}
          onViewBlog={handleBackToHome}
        />
      </>
    );
  }

  return null;
}