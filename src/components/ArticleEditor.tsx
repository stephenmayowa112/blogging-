import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader } from "./ui/card";
import { ArrowLeft } from "lucide-react";

interface Article {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  videoUrl: string;
  audioUrl: string;
}

interface ArticleEditorProps {
  article?: Article | null;
  onSave: (article: Omit<Article, 'id'>) => void;
  onCancel: () => void;
  saving?: boolean;
}

export function ArticleEditor({ article, onSave, onCancel, saving = false }: ArticleEditorProps) {
  const [title, setTitle] = useState(article?.title || "");
  const [content, setContent] = useState(article?.content || "");
  const [excerpt, setExcerpt] = useState(article?.excerpt || "");
  const [imageUrl, setImageUrl] = useState(article?.imageUrl || "");
  const [videoUrl, setVideoUrl] = useState(article?.videoUrl || "");
  const [audioUrl, setAudioUrl] = useState(article?.audioUrl || "");

  useEffect(() => {
    if (article) {
      setTitle(article.title);
      setContent(article.content);
      setExcerpt(article.excerpt);
      setImageUrl(article.imageUrl || "");
      setVideoUrl(article.videoUrl || "");
      setAudioUrl(article.audioUrl || "");
    }
  }, [article]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      imageUrl: imageUrl || "",
      videoUrl: videoUrl || "",
      audioUrl: audioUrl || "",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button variant="ghost" onClick={onCancel} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        <h2>{article?.id ? 'Edit Article' : 'Create New Article'}</h2>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter article title"
                required
              />
            </div>

            <div>
              <Label htmlFor="excerpt">Excerpt</Label>
              <Textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief summary of the article (optional - auto-generated if empty)"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="content">Content *</Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your article content here..."
                rows={15}
                required
              />
            </div>

            <div className="border-t pt-6">
              <h3 className="mb-4">Rich Media (Optional)</h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">Featured Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="videoUrl">Video Embed URL</Label>
                  <Input
                    id="videoUrl"
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Use YouTube embed URL format
                  </p>
                </div>

                <div>
                  <Label htmlFor="audioUrl">Audio File URL</Label>
                  <Input
                    id="audioUrl"
                    type="url"
                    value={audioUrl}
                    onChange={(e) => setAudioUrl(e.target.value)}
                    placeholder="https://example.com/audio.mp3"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to use automatic text-to-speech
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-6 border-t">
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : article?.id ? 'Update Article' : 'Publish Article'}
              </Button>
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
