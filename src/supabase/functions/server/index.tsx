import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client for auth
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Health check endpoint
app.get("/make-server-2b00e03f/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== AUTH ROUTES =====

// Sign up new admin user
app.post("/make-server-2b00e03f/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: 'Email, password, and name are required' }, 400);
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Sign up error during user creation:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Verify authentication middleware
async function verifyAuth(request: Request): Promise<string | null> {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) return null;
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  if (error || !user?.id) return null;
  
  return user.id;
}

// ===== ARTICLE ROUTES =====

// Get all published articles
app.get("/make-server-2b00e03f/articles", async (c) => {
  try {
    const articles = await kv.getByPrefix('article:');
    
    // Sort by createdAt (newest first)
    const sortedArticles = articles
      .map(item => item.value)
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return c.json({ articles: sortedArticles });
  } catch (error) {
    console.log('Error fetching articles:', error);
    return c.json({ error: 'Failed to fetch articles' }, 500);
  }
});

// Get single article by ID
app.get("/make-server-2b00e03f/articles/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const article = await kv.get(`article:${id}`);
    
    if (!article) {
      return c.json({ error: 'Article not found' }, 404);
    }
    
    return c.json({ article });
  } catch (error) {
    console.log('Error fetching article:', error);
    return c.json({ error: 'Failed to fetch article' }, 500);
  }
});

// Create new article (requires auth)
app.post("/make-server-2b00e03f/articles", async (c) => {
  try {
    const userId = await verifyAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const { title, content, excerpt, imageUrl, videoUrl, audioUrl } = await c.req.json();
    
    if (!title || !content) {
      return c.json({ error: 'Title and content are required' }, 400);
    }

    const id = crypto.randomUUID();
    const article = {
      id,
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      imageUrl: imageUrl || null,
      videoUrl: videoUrl || null,
      audioUrl: audioUrl || null,
      authorId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`article:${id}`, article);
    
    return c.json({ success: true, article });
  } catch (error) {
    console.log('Error creating article:', error);
    return c.json({ error: 'Failed to create article' }, 500);
  }
});

// Update article (requires auth)
app.put("/make-server-2b00e03f/articles/:id", async (c) => {
  try {
    const userId = await verifyAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const id = c.req.param('id');
    const existingArticle = await kv.get(`article:${id}`);
    
    if (!existingArticle) {
      return c.json({ error: 'Article not found' }, 404);
    }

    const { title, content, excerpt, imageUrl, videoUrl, audioUrl } = await c.req.json();
    
    const updatedArticle = {
      ...existingArticle,
      title: title ?? existingArticle.title,
      content: content ?? existingArticle.content,
      excerpt: excerpt ?? existingArticle.excerpt,
      imageUrl: imageUrl !== undefined ? imageUrl : existingArticle.imageUrl,
      videoUrl: videoUrl !== undefined ? videoUrl : existingArticle.videoUrl,
      audioUrl: audioUrl !== undefined ? audioUrl : existingArticle.audioUrl,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(`article:${id}`, updatedArticle);
    
    return c.json({ success: true, article: updatedArticle });
  } catch (error) {
    console.log('Error updating article:', error);
    return c.json({ error: 'Failed to update article' }, 500);
  }
});

// Delete article (requires auth)
app.delete("/make-server-2b00e03f/articles/:id", async (c) => {
  try {
    const userId = await verifyAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const id = c.req.param('id');
    const article = await kv.get(`article:${id}`);
    
    if (!article) {
      return c.json({ error: 'Article not found' }, 404);
    }

    await kv.del(`article:${id}`);
    
    // Also delete all comments for this article
    const comments = await kv.getByPrefix(`comment:${id}:`);
    const commentKeys = comments.map(item => item.key);
    if (commentKeys.length > 0) {
      await kv.mdel(commentKeys);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting article:', error);
    return c.json({ error: 'Failed to delete article' }, 500);
  }
});

// ===== COMMENT ROUTES =====

// Get comments for an article
app.get("/make-server-2b00e03f/comments/:articleId", async (c) => {
  try {
    const articleId = c.req.param('articleId');
    const comments = await kv.getByPrefix(`comment:${articleId}:`);
    
    // Sort by createdAt (oldest first)
    const sortedComments = comments
      .map(item => item.value)
      .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    
    return c.json({ comments: sortedComments });
  } catch (error) {
    console.log('Error fetching comments:', error);
    return c.json({ error: 'Failed to fetch comments' }, 500);
  }
});

// Create new comment
app.post("/make-server-2b00e03f/comments/:articleId", async (c) => {
  try {
    const articleId = c.req.param('articleId');
    const { name, content } = await c.req.json();
    
    if (!name || !content) {
      return c.json({ error: 'Name and content are required' }, 400);
    }

    // Verify article exists
    const article = await kv.get(`article:${articleId}`);
    if (!article) {
      return c.json({ error: 'Article not found' }, 404);
    }

    const commentId = crypto.randomUUID();
    const comment = {
      id: commentId,
      articleId,
      name,
      content,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`comment:${articleId}:${commentId}`, comment);
    
    return c.json({ success: true, comment });
  } catch (error) {
    console.log('Error creating comment:', error);
    return c.json({ error: 'Failed to create comment' }, 500);
  }
});

// Delete comment (requires auth)
app.delete("/make-server-2b00e03f/comments/:articleId/:commentId", async (c) => {
  try {
    const userId = await verifyAuth(c.req.raw);
    if (!userId) {
      return c.json({ error: 'Unauthorized - Please log in' }, 401);
    }

    const articleId = c.req.param('articleId');
    const commentId = c.req.param('commentId');
    
    const comment = await kv.get(`comment:${articleId}:${commentId}`);
    if (!comment) {
      return c.json({ error: 'Comment not found' }, 404);
    }

    await kv.del(`comment:${articleId}:${commentId}`);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting comment:', error);
    return c.json({ error: 'Failed to delete comment' }, 500);
  }
});

Deno.serve(app.fetch);
