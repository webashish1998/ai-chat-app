# AI Chat Application

A real-time AI chat application built with Next.js, TypeScript, Tailwind CSS, Supabase, and OpenAI integration.

## Features

- 🔐 User authentication (simplified for demo)
- 🤖 **AI-powered chat with OpenAI integration**
- 💬 Real-time messaging with Supabase subscriptions
- 🏠 Create and manage AI chat rooms
- 👥 AI chat rooms for conversations
- 📱 Responsive design with Tailwind CSS
- 🔄 Real-time updates for AI responses
- 🧠 Conversation history context for AI
- 🎨 Modern and clean UI

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Subscriptions
- **AI**: OpenAI GPT-3.5-turbo

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
OPENAI_API_KEY=your_openai_api_key_here
NEXTAUTH_SECRET=your_nextauth_secret_key_here
NEXTAUTH_URL=http://localhost:3000
```

### 3. Set up OpenAI

1. Go to [OpenAI](https://platform.openai.com) and create an account
2. Generate an API key from the API keys section
3. Add your OpenAI API key to the `.env.local` file

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