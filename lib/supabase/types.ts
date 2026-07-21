export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_id: string | null
          body: string
          category: string | null
          cover_image_url: string | null
          created_at: string
          excerpt: string | null
          id: string
          published_at: string | null
          slug: string
          status: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          body?: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug: string
          status?: Database["public"]["Enums"]["post_status"]
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          body?: string
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          published_at?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["post_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          inquiry_type: string
          is_read: boolean
          message: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          inquiry_type?: string
          is_read?: boolean
          message: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          inquiry_type?: string
          is_read?: boolean
          message?: string
          name?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          user_one_id: string
          user_two_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_one_id: string
          user_two_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          user_one_id?: string
          user_two_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_user_one_id_fkey"
            columns: ["user_one_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_one_id_fkey"
            columns: ["user_one_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_two_id_fkey"
            columns: ["user_two_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_two_id_fkey"
            columns: ["user_two_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          order_id: string
          raised_by: string
          reason: string
          resolved_at: string | null
          resolved_by: string | null
          status: Database["public"]["Enums"]["dispute_status"]
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          order_id: string
          raised_by: string
          reason: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          order_id?: string
          raised_by?: string
          reason?: string
          resolved_at?: string | null
          resolved_by?: string | null
          status?: Database["public"]["Enums"]["dispute_status"]
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_raised_by_fkey"
            columns: ["raised_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      focus_areas: {
        Row: {
          id: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_type: string | null
          attachment_url: string | null
          body: string
          conversation_id: string
          created_at: string
          id: string
          read_at: string | null
          sender_id: string
        }
        Insert: {
          attachment_type?: string | null
          attachment_url?: string | null
          body: string
          conversation_id: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id: string
        }
        Update: {
          attachment_type?: string | null
          attachment_url?: string | null
          body?: string
          conversation_id?: string
          created_at?: string
          id?: string
          read_at?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_kes: number
          brand_id: string
          created_at: string
          creative_id: string
          id: string
          package_id: string | null
          proposal_id: string | null
          status: Database["public"]["Enums"]["order_status"]
          updated_at: string
        }
        Insert: {
          amount_kes: number
          brand_id: string
          created_at?: string
          creative_id: string
          id?: string
          package_id?: string | null
          proposal_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Update: {
          amount_kes?: number
          brand_id?: string
          created_at?: string
          creative_id?: string
          id?: string
          package_id?: string | null
          proposal_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_kes: number
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["payment_kind"]
          order_id: string
          provider: string
          provider_ref: string | null
          raw_callback: Json | null
          status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          amount_kes: number
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["payment_kind"]
          order_id: string
          provider?: string
          provider_ref?: string | null
          raw_callback?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          amount_kes?: number
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["payment_kind"]
          order_id?: string
          provider?: string
          provider_ref?: string | null
          raw_callback?: Json | null
          status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_items: {
        Row: {
          created_at: string
          file_type: string
          file_url: string
          id: string
          link_url: string | null
          profile_id: string
          sort_order: number
          title: string | null
        }
        Insert: {
          created_at?: string
          file_type?: string
          file_url: string
          id?: string
          link_url?: string | null
          profile_id: string
          sort_order?: number
          title?: string | null
        }
        Update: {
          created_at?: string
          file_type?: string
          file_url?: string
          id?: string
          link_url?: string | null
          profile_id?: string
          sort_order?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "portfolio_items_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          first_name: string
          id: string
          is_suspended: boolean
          last_name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          social_links: Json
          updated_at: string
          username: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          first_name?: string
          id: string
          is_suspended?: boolean
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json
          updated_at?: string
          username: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          first_name?: string
          id?: string
          is_suspended?: boolean
          last_name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          social_links?: Json
          updated_at?: string
          username?: string
          website_url?: string | null
        }
        Relationships: []
      }
      project_focus_areas: {
        Row: {
          focus_area_id: string
          project_id: string
        }
        Insert: {
          focus_area_id: string
          project_id: string
        }
        Update: {
          focus_area_id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_focus_areas_focus_area_id_fkey"
            columns: ["focus_area_id"]
            isOneToOne: false
            referencedRelation: "focus_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_focus_areas_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_images: {
        Row: {
          created_at: string
          file_url: string
          id: string
          project_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          project_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          project_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          brand_id: string
          budget_max: number
          budget_min: number
          category_id: string | null
          created_at: string
          description: string
          id: string
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
        }
        Insert: {
          brand_id: string
          budget_max: number
          budget_min: number
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          slug: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
        }
        Update: {
          brand_id?: string
          budget_max?: number
          budget_min?: number
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "projects_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          created_at: string
          creative_id: string
          id: string
          message: string
          project_id: string
          rate: number
          status: Database["public"]["Enums"]["proposal_status"]
        }
        Insert: {
          created_at?: string
          creative_id: string
          id?: string
          message?: string
          project_id: string
          rate: number
          status?: Database["public"]["Enums"]["proposal_status"]
        }
        Update: {
          created_at?: string
          creative_id?: string
          id?: string
          message?: string
          project_id?: string
          rate?: number
          status?: Database["public"]["Enums"]["proposal_status"]
        }
        Relationships: [
          {
            foreignKeyName: "proposals_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string
          communication_rating: number | null
          created_at: string
          id: string
          order_id: string
          overall_rating: number
          quality_rating: number | null
          reviewee_id: string
          reviewer_id: string
          timeliness_rating: number | null
          value_rating: number | null
        }
        Insert: {
          comment?: string
          communication_rating?: number | null
          created_at?: string
          id?: string
          order_id: string
          overall_rating: number
          quality_rating?: number | null
          reviewee_id: string
          reviewer_id: string
          timeliness_rating?: number | null
          value_rating?: number | null
        }
        Update: {
          comment?: string
          communication_rating?: number | null
          created_at?: string
          id?: string
          order_id?: string
          overall_rating?: number
          quality_rating?: number | null
          reviewee_id?: string
          reviewer_id?: string
          timeliness_rating?: number | null
          value_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_focus_areas: {
        Row: {
          focus_area_id: string
          service_id: string
        }
        Insert: {
          focus_area_id: string
          service_id: string
        }
        Update: {
          focus_area_id?: string
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_focus_areas_focus_area_id_fkey"
            columns: ["focus_area_id"]
            isOneToOne: false
            referencedRelation: "focus_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_focus_areas_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_images: {
        Row: {
          created_at: string
          file_url: string
          id: string
          service_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          file_url: string
          id?: string
          service_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          file_url?: string
          id?: string
          service_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "service_images_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      service_packages: {
        Row: {
          delivery_days: number
          description: string
          id: string
          price_kes: number
          revisions: number
          service_id: string
          sort_order: number
          tier: string
          title: string
        }
        Insert: {
          delivery_days: number
          description?: string
          id?: string
          price_kes: number
          revisions?: number
          service_id: string
          sort_order?: number
          tier?: string
          title: string
        }
        Update: {
          delivery_days?: number
          description?: string
          id?: string
          price_kes?: number
          revisions?: number
          service_id?: string
          sort_order?: number
          tier?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_packages_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string | null
          created_at: string
          creative_id: string
          description: string
          id: string
          slug: string
          status: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          creative_id: string
          description?: string
          id?: string
          slug: string
          status?: Database["public"]["Enums"]["listing_status"]
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          category_id?: string | null
          created_at?: string
          creative_id?: string
          description?: string
          id?: string
          slug?: string
          status?: Database["public"]["Enums"]["listing_status"]
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_creative_id_fkey"
            columns: ["creative_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_pages: {
        Row: {
          content: Json
          id: string
          slug: string
          title: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          content?: Json
          id?: string
          slug: string
          title: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          content?: Json
          id?: string
          slug?: string
          title?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_pages_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "site_pages_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          social_links: Json | null
          username: string | null
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          username?: string | null
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string | null
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          social_links?: Json | null
          username?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      dispute_status:
        | "open"
        | "resolved_refunded"
        | "resolved_released"
        | "resolved_split"
      listing_status: "pending_review" | "published" | "rejected" | "archived"
      order_status:
        | "pending_payment"
        | "paid"
        | "in_progress"
        | "delivered"
        | "completed"
        | "disputed"
        | "refunded"
        | "cancelled"
      payment_kind: "collection" | "payout"
      payment_status: "pending" | "successful" | "failed"
      post_status: "draft" | "published"
      pricing_type: "fixed" | "hourly"
      proposal_status: "pending" | "accepted" | "rejected" | "withdrawn"
      user_role: "creative" | "brand" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dispute_status: [
        "open",
        "resolved_refunded",
        "resolved_released",
        "resolved_split",
      ],
      listing_status: ["pending_review", "published", "rejected", "archived"],
      order_status: [
        "pending_payment",
        "paid",
        "in_progress",
        "delivered",
        "completed",
        "disputed",
        "refunded",
        "cancelled",
      ],
      payment_kind: ["collection", "payout"],
      payment_status: ["pending", "successful", "failed"],
      post_status: ["draft", "published"],
      pricing_type: ["fixed", "hourly"],
      proposal_status: ["pending", "accepted", "rejected", "withdrawn"],
      user_role: ["creative", "brand", "admin"],
    },
  },
} as const
