import { Calendar, User } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "./ui/card";
import { Button } from "./ui/button";

interface ArticleCardProps {
  article: {
    id: string;
    title: string;
    excerpt: string;
    imageUrl?: string | null;
    createdAt: string;
  };
  onReadMore: (id: string) => void;
}

export function ArticleCard({ article, onReadMore }: ArticleCardProps) {
  const formattedDate = new Date(article.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {article.imageUrl && (
        <div className="w-full h-48 overflow-hidden">
          <img
            src={article.imageUrl}
            alt={article.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <CardHeader>
        <h2 className="cursor-pointer hover:text-blue-600 transition-colors" onClick={() => onReadMore(article.id)}>
          {article.title}
        </h2>
        <div className="flex items-center gap-4 text-gray-500 text-sm mt-2">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600">{article.excerpt}</p>
      </CardContent>
      <CardFooter>
        <Button onClick={() => onReadMore(article.id)} variant="default">
          Read More
        </Button>
      </CardFooter>
    </Card>
  );
}
