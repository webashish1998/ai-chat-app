-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS chat_rooms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chat_room_members table
CREATE TABLE IF NOT EXISTS chat_room_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    chat_room_id UUID REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chat_room_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_chat_room_id ON chat_room_members(chat_room_id);
CREATE INDEX IF NOT EXISTS idx_chat_room_members_user_id ON chat_room_members(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_rooms_updated_at BEFORE UPDATE ON chat_rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_room_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can read their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Chat rooms policies
CREATE POLICY "Users can view chat rooms they are members of" ON chat_rooms FOR SELECT 
USING (
    id IN (
        SELECT chat_room_id FROM chat_room_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create chat rooms" ON chat_rooms FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Room admins can update chat rooms" ON chat_rooms FOR UPDATE 
USING (
    id IN (
        SELECT chat_room_id FROM chat_room_members 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

-- Messages policies
CREATE POLICY "Users can view messages in rooms they are members of" ON messages FOR SELECT 
USING (
    chat_room_id IN (
        SELECT chat_room_id FROM chat_room_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create messages in rooms they are members of" ON messages FOR INSERT 
WITH CHECK (
    auth.uid() = user_id AND 
    chat_room_id IN (
        SELECT chat_room_id FROM chat_room_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" ON messages FOR DELETE 
USING (auth.uid() = user_id);

-- Chat room members policies
CREATE POLICY "Users can view members of rooms they are in" ON chat_room_members FOR SELECT 
USING (
    chat_room_id IN (
        SELECT chat_room_id FROM chat_room_members WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Room admins can manage members" ON chat_room_members FOR ALL 
USING (
    chat_room_id IN (
        SELECT chat_room_id FROM chat_room_members 
        WHERE user_id = auth.uid() AND role = 'admin'
    )
);

CREATE POLICY "Users can join rooms" ON chat_room_members FOR INSERT 
WITH CHECK (auth.uid() = user_id);
