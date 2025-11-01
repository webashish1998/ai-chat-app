export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          username: string
          avatar_url?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          username: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          username?: string
          avatar_url?: string
          created_at?: string
          updated_at?: string
        }
      }
      chat_rooms: {
        Row: {
          id: string
          name: string
          description?: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          content: string
          user_id: string
          chat_room_id: string
          message_type: 'text' | 'image' | 'file'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          content: string
          user_id: string
          chat_room_id: string
          message_type?: 'text' | 'image' | 'file'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          content?: string
          user_id?: string
          chat_room_id?: string
          message_type?: 'text' | 'image' | 'file'
          created_at?: string
          updated_at?: string
        }
      }
      chat_room_members: {
        Row: {
          id: string
          chat_room_id: string
          user_id: string
          role: 'admin' | 'member'
          joined_at: string
        }
        Insert: {
          id?: string
          chat_room_id: string
          user_id: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
        Update: {
          id?: string
          chat_room_id?: string
          user_id?: string
          role?: 'admin' | 'member'
          joined_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type User = Database['public']['Tables']['users']['Row']
export type ChatRoom = Database['public']['Tables']['chat_rooms']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type ChatRoomMember = Database['public']['Tables']['chat_room_members']['Row']

export type InsertUser = Database['public']['Tables']['users']['Insert']
export type InsertChatRoom = Database['public']['Tables']['chat_rooms']['Insert']
export type InsertMessage = Database['public']['Tables']['messages']['Insert']
export type InsertChatRoomMember = Database['public']['Tables']['chat_room_members']['Insert']
