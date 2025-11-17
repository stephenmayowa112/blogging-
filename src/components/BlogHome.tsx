import { useState, useEffect } from 'react';
import { ArticleCard } from './ArticleCard';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  coverImage?: string;
  createdAt: string;
  published: boolean;
}

interface BlogHomeProps {
  onArticleClick: (id: string) => void;
}

export function BlogHome({ onArticleClick }: BlogHomeProps) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchArticles();
  }, []);
  
  const fetchArticles = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b00e03f/articles?published=true`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch articles');
      }
      
      const data = await response.json();
      setArticles(data.articles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading articles...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="mb-12 text-center">
          <h1 className="text-5xl mb-4">Welcome to Our Blog</h1>
          <p className="text-xl text-gray-600">
            Discover stories, insights, and ideas from our community
          </p>
        </div>
        
        {articles.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-xl text-gray-500">No articles published yet.</p>
            <p className="text-gray-400 mt-2">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onClick={() => onArticleClick(article.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
