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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          metadata: Json
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          metadata?: Json
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          metadata?: Json
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          color: string | null
          id: string
          line_total: number
          order_id: string
          product_code: string | null
          product_id: string | null
          product_name: string
          quantity: number
          size: string | null
          unit_price: number
        }
        Insert: {
          color?: string | null
          id?: string
          line_total: number
          order_id: string
          product_code?: string | null
          product_id?: string | null
          product_name: string
          quantity: number
          size?: string | null
          unit_price: number
        }
        Update: {
          color?: string | null
          id?: string
          line_total?: number
          order_id?: string
          product_code?: string | null
          product_id?: string | null
          product_name?: string
          quantity?: number
          size?: string | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          city: string | null
          created_at: string
          customer_name: string
          id: string
          items_total: number
          note: string | null
          order_number: string
          order_status: string
          payment_ref: string | null
          payment_status: string
          phone: string
          postal_code: string | null
          province: string | null
          shipping_cost: number
          total: number
          updated_at: string
        }
        Insert: {
          address: string
          city?: string | null
          created_at?: string
          customer_name: string
          id?: string
          items_total?: number
          note?: string | null
          order_number?: string
          order_status?: string
          payment_ref?: string | null
          payment_status?: string
          phone: string
          postal_code?: string | null
          province?: string | null
          shipping_cost?: number
          total?: number
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          items_total?: number
          note?: string | null
          order_number?: string
          order_status?: string
          payment_ref?: string | null
          payment_status?: string
          phone?: string
          postal_code?: string | null
          province?: string | null
          shipping_cost?: number
          total?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_images: {
        Row: {
          created_at: string
          id: string
          product_id: string
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: string | null
          category_id: string
          code: string
          colors: string[]
          compare_at_price: number | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_featured: boolean
          main_image_url: string | null
          material: string | null
          name: string
          price: number
          sizes: string[]
          stock: number
          updated_at: string
        }
        Insert: {
          brand?: string | null
          category_id: string
          code: string
          colors?: string[]
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          main_image_url?: string | null
          material?: string | null
          name: string
          price?: number
          sizes?: string[]
          stock?: number
          updated_at?: string
        }
        Update: {
          brand?: string | null
          category_id?: string
          code?: string
          colors?: string[]
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_featured?: boolean
          main_image_url?: string | null
          material?: string | null
          name?: string
          price?: number
          sizes?: string[]
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      public_request_log: {
        Row: {
          action: string
          created_at: string
          fingerprint: string
          id: string
        }
        Insert: {
          action: string
          created_at?: string
          fingerprint: string
          id?: string
        }
        Update: {
          action?: string
          created_at?: string
          fingerprint?: string
          id?: string
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wholesale_inquiries: {
        Row: {
          approx_quantity: string | null
          city: string | null
          created_at: string
          full_name: string
          id: string
          note: string | null
          phone: string
          products_wanted: string | null
          status: string
          store_name: string | null
        }
        Insert: {
          approx_quantity?: string | null
          city?: string | null
          created_at?: string
          full_name: string
          id?: string
          note?: string | null
          phone: string
          products_wanted?: string | null
          status?: string
          store_name?: string | null
        }
        Update: {
          approx_quantity?: string | null
          city?: string | null
          created_at?: string
          full_name?: string
          id?: string
          note?: string | null
          phone?: string
          products_wanted?: string | null
          status?: string
          store_name?: string | null
        }
        Relationships: []
      }
      wholesale_products: {
        Row: {
          code: string
          colors: string[]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          main_image_url: string | null
          material: string | null
          min_order_qty: number
          name: string
          sizes: string[]
          stock: number
          updated_at: string
          wholesale_price: number
        }
        Insert: {
          code: string
          colors?: string[]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          main_image_url?: string | null
          material?: string | null
          min_order_qty?: number
          name: string
          sizes?: string[]
          stock?: number
          updated_at?: string
          wholesale_price?: number
        }
        Update: {
          code?: string
          colors?: string[]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          main_image_url?: string | null
          material?: string | null
          min_order_qty?: number
          name?: string
          sizes?: string[]
          stock?: number
          updated_at?: string
          wholesale_price?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin"
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
      app_role: ["admin"],
    },
  },
} as const
