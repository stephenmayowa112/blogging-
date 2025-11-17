# Blog Website Development

A modern, full-featured blog platform with admin capabilities, built with React, TypeScript, Vite, and Supabase.

## Features

- 📝 **Rich Content Management** - Create and edit articles with images, videos, and audio
- 💬 **Comment System** - User comments with admin moderation
- 🎵 **Audio Support** - Custom audio files or automatic text-to-speech
- 🔐 **Admin Dashboard** - Secure authentication and content management
- 📱 **Responsive Design** - Mobile-first design with Tailwind CSS
- 🎨 **Modern UI** - Built with shadcn/ui components

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: Supabase (Edge Functions, Auth, Database)
- **UI**: Tailwind CSS, Radix UI, shadcn/ui
- **State Management**: React Hooks
- **Notifications**: Sonner

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd blogging
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the `.env.example` file to `.env`:

```bash
cp .env.example .env
```

Then update the `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_ANON_KEY=your_anon_key
```

You can find these values in your [Supabase Dashboard](https://supabase.com/dashboard) under Settings → API.

### 4. Set up Supabase

#### Create the database table

In your Supabase SQL Editor, run:

```sql
CREATE TABLE kv_store_2b00e03f (
  key TEXT NOT NULL PRIMARY KEY,
  value JSONB NOT NULL
);
```

#### Deploy the Edge Function

The backend API is located in `src/supabase/functions/server/`. Deploy it to your Supabase project:

```bash
# Install Supabase CLI if you haven't
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your_project_id

# Deploy the function
supabase functions deploy make-server-2b00e03f
```

### 5. Run the development server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Usage

### Public Access

- Browse published articles on the home page
- Read full articles with media content
- Leave comments on articles

### Admin Access

1. Click the "Admin" button in the header
2. Sign up for an admin account (first time)
3. Log in with your credentials
4. Access the admin dashboard to:
   - Create new articles
   - Edit existing articles
   - Delete articles
   - Manage comments

## Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist/` directory.

## Project Structure

```txt
blogging/
├── src/
│   ├── components/       # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminLogin.tsx
│   │   ├── ArticleCard.tsx
│   │   ├── ArticleEditor.tsx
│   │   ├── AudioPlayer.tsx
│   │   ├── CommentSection.tsx
│   │   └── ...
│   ├── supabase/
│   │   └── functions/   # Backend Edge Functions
│   ├── utils/          # Utility functions
│   ├── App.tsx         # Main application component
│   └── main.tsx        # Application entry point
├── .env                # Environment variables (not in git)
├── .env.example        # Environment template
├── package.json
└── vite.config.ts
```

## Security Notes

- Never commit your `.env` file to version control
- The `.gitignore` file is configured to exclude sensitive files
- Admin authentication uses Supabase Auth with JWT tokens
- Sessions are persisted in localStorage for convenience

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project uses components from [shadcn/ui](https://ui.shadcn.com/) under MIT license.

## Support

For issues and questions, please open an issue on GitHub.

---

Original design from [Figma](https://www.figma.com/design/sMX6i9bhhIWAYnbHLfStbP/Blog-Website-Development)
