# AI Chat Application

A real-time AI chat application built with Next.js, TypeScript, Tailwind CSS, Supabase, with both OpenAI and Perplexity AI integrations.

## Features

- 🔐 User authentication (simplified for demo)
- 🤖 **AI-powered chat with OpenAI & Perplexity AI integration**
- 💬 Real-time messaging with Supabase subscriptions
- 🏠 Create and manage AI chat rooms
- 👥 AI chat rooms for conversations
- 📱 Responsive design with Tailwind CSS
- 🔄 Real-time updates for AI responses
- 🧠 Conversation history context for AI
- 🎨 Modern and clean UI
- 🔄 **Flexible AI provider switching** (OpenAI or Perplexity)

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Subscriptions
- **AI Providers**: 
  - OpenAI (GPT-3.5-turbo)
  - Perplexity AI (Llama 3.1 Sonar) - **Currently Active**

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
cd chat-app
npm install
```

### 2. Set up Supabase

1. Go to [Supabase](https://supabase.com) and create a new project
2. Copy your project URL and anon key from the API settings
3. Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI Provider - Choose one (Currently using Perplexity)
PERPLEXITY_API_KEY=your_perplexity_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Set up AI Provider (Choose One or Both)

**Option A: Perplexity AI (Currently Active)**
1. Go to [Perplexity](https://www.perplexity.ai/settings/api) and create an account
2. Generate an API key from the API settings
3. Add your Perplexity API key to the `.env.local` file

**Option B: OpenAI**
1. Go to [OpenAI](https://platform.openai.com) and create an account
2. Generate an API key from the API keys section
3. Add your OpenAI API key to the `.env.local` file

**Switching Between AI Providers:**
To switch from Perplexity to OpenAI (or vice versa), simply update the import in `src/app/api/messages/route.ts`:
```typescript
// For Perplexity (current):
import { generateAIResponse, formatConversationHistory } from '@/utils/perplexity'

// For OpenAI:
import { generateAIResponse, formatConversationHistory } from '@/utils/openai'
```

### 4. Set up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `supabase-schema-simple.sql` into the editor
4. Run the SQL to create all necessary tables

### 5. Run the Application

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deploying to Vercel

### 1. Push to GitHub

First, make sure your code is pushed to a GitHub repository.

### 2. Import Project to Vercel

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will detect Next.js automatically

### 3. Configure Environment Variables

**IMPORTANT**: You must add all environment variables in Vercel before deploying:

1. In the Vercel project settings, go to **Settings** → **Environment Variables**
2. Add the following variables one by one:

   **Required Variables (MUST HAVE):**
   - `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (e.g., `https://xxxxx.supabase.co`)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public key

   **Optional but Recommended:**
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)
   - `PERPLEXITY_API_KEY` - Your Perplexity API key (for AI chat features - currently active)
   - `OPENAI_API_KEY` - Your OpenAI API key (alternative AI provider)
   - `NEXTAUTH_SECRET` - A random secret string (for authentication)
   - `NEXTAUTH_URL` - Your Vercel deployment URL (e.g., `https://your-app-name.vercel.app`)

3. **CRITICAL**: For each variable, select **all three environments**:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
   
   (Click on each environment checkbox when adding the variable)

4. After adding all variables, go to **Deployments** tab → Find your latest deployment → Click the three dots (⋯) → Click **Redeploy**

**Troubleshooting:**
- Visit `https://your-app.vercel.app/api/health` after deployment to check if environment variables are set correctly
- Make sure there are **no spaces** before or after the variable values
- Make sure the variable names match **exactly** (case-sensitive)
- After adding/updating environment variables, you **must redeploy** for changes to take effect

### 4. Deploy

Once environment variables are configured, Vercel will automatically deploy your application. If you need to redeploy:

1. Push new changes to your GitHub repository, or
2. Go to the Vercel dashboard → Your project → **Deployments** → Click the three dots on any deployment → **Redeploy**

## Database Schema

The application uses the following tables:

- **users**: Store user information (id, email, username, avatar_url)
- **chat_rooms**: Store chat room details (id, name, description, created_by)
- **messages**: Store chat messages (id, content, user_id, chat_room_id, message_type)
- **chat_room_members**: Store chat room membership (id, chat_room_id, user_id, role)

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `GET /api/users/[id]` - Get user by ID
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Chat Rooms
- `GET /api/chat-rooms` - Get all chat rooms (with optional userId filter)
- `POST /api/chat-rooms` - Create a new chat room
- `GET /api/chat-rooms/[id]` - Get chat room by ID
- `PUT /api/chat-rooms/[id]` - Update chat room
- `DELETE /api/chat-rooms/[id]` - Delete chat room

### Messages
- `GET /api/messages` - Get messages for a chat room
- `POST /api/messages` - Create a new message
- `GET /api/messages/[id]` - Get message by ID
- `PUT /api/messages/[id]` - Update message
- `DELETE /api/messages/[id]` - Delete message

### Chat Room Members
- `GET /api/chat-rooms/[id]/members` - Get members of a chat room
- `POST /api/chat-rooms/[id]/members` - Add member to chat room
- `PUT /api/chat-rooms/[id]/members/[userId]` - Update member role
- `DELETE /api/chat-rooms/[id]/members/[userId]` - Remove member from chat room

## How to Use

1. **Register/Login**: Create a new account or login with existing credentials
2. **Create AI Chat Room**: Click "New AI Chat" to create an AI chat room
3. **Start AI Conversation**: Select a chat room from the sidebar to start chatting with AI
4. **Send Messages**: Type your message and press Enter to send to AI
5. **Get AI Responses**: AI will respond automatically with contextual answers
6. **Real-time Updates**: AI responses appear instantly in the chat

## Security Features

- Row Level Security (RLS) policies on all tables
- Users can only see chat rooms they're members of
- Users can only edit/delete their own messages
- Room admins can manage members and room settings

## AI Provider Integration

This project supports **both OpenAI and Perplexity AI** as AI providers:

### Available AI Providers

**1. Perplexity AI (Currently Active)**
- **File**: `src/utils/perplexity.ts`
- **Model**: `llama-3.1-sonar-small-128k-online`
- **Features**: Real-time web search capabilities, up-to-date information
- **Best For**: Questions requiring current information, research tasks

**2. OpenAI**
- **File**: `src/utils/openai.ts`
- **Model**: `gpt-3.5-turbo`
- **Features**: Conversational AI, general knowledge
- **Best For**: General conversations, creative tasks, coding help

### Switching Between Providers

Both integrations are ready to use. To switch between them:

1. Open `src/app/api/messages/route.ts`
2. Change the import statement at the top:

```typescript
// Currently using Perplexity:
import { generateAIResponse, formatConversationHistory } from '@/utils/perplexity'

// To switch to OpenAI, change to:
// import { generateAIResponse, formatConversationHistory } from '@/utils/openai'
```

3. Make sure the corresponding API key is set in your `.env.local` file
4. Restart your development server

Both providers use the same function interface, making switching seamless with zero code changes!

## Development

### Project Structure

```
src/
├── app/
│   ├── api/           # API routes
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Main page
├── components/        # React components
├── hooks/            # Custom React hooks
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
    ├── openai.ts      # OpenAI integration
    ├── perplexity.ts  # Perplexity AI integration
    └── supabase.ts    # Supabase client
```

### Key Components

- **AuthModal**: Handles user authentication
- **ChatSidebar**: Shows chat rooms and user info
- **ChatWindow**: Main chat interface
- **MessageBubble**: Individual message display
- **MessageInput**: Message composition
- **CreateChatRoomModal**: Chat room creation form

### Real-time Features

The application uses Supabase's real-time subscriptions to provide instant updates:

- New messages appear immediately
- Message updates and deletions are reflected in real-time
- Multiple users can chat simultaneously without page refreshes

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the MIT License.