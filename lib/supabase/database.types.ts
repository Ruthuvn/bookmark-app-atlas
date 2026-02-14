export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string | null;
          order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon: string;
          color?: string | null;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string | null;
          order?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      bookmarks: {
        Row: {
          id: string;
          user_id: string;
          category_id: string | null;
          title: string;
          description: string | null;
          url: string;
          og_image_url: string | null;
          og_image_url_thumb: string | null;
          favicon_url: string | null;
          favicon_url_thumb: string | null;
          media_type: string | null;
          media_embed_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          category_id?: string | null;
          title: string;
          description?: string | null;
          url: string;
          og_image_url?: string | null;
          og_image_url_thumb?: string | null;
          favicon_url?: string | null;
          favicon_url_thumb?: string | null;
          media_type?: string | null;
          media_embed_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          category_id?: string | null;
          title?: string;
          description?: string | null;
          url?: string;
          og_image_url?: string | null;
          og_image_url_thumb?: string | null;
          favicon_url?: string | null;
          favicon_url_thumb?: string | null;
          media_type?: string | null;
          media_embed_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_preferences: {
        Row: {
          id: string;
          user_id: string;
          sidebar_expanded: boolean;
          theme: string;
          // Desktop preferences
          view_mode_desktop: "card" | "list";
          card_columns_desktop: number;
          list_columns_desktop: number;
          group_columns_desktop: number;
          // Mobile preferences
          view_mode_mobile: "card" | "list";
          card_columns_mobile: number;
          list_columns_mobile: number;
          group_columns_mobile: number;
          // Collapsed categories
          collapsed_categories: string[];
          // Sort preferences
          sort_by: "created_at" | "updated_at" | "title";
          sort_order: "asc" | "desc";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          sidebar_expanded?: boolean;
          theme?: string;
          view_mode_desktop?: "card" | "list";
          card_columns_desktop?: number;
          list_columns_desktop?: number;
          group_columns_desktop?: number;
          view_mode_mobile?: "card" | "list";
          card_columns_mobile?: number;
          list_columns_mobile?: number;
          group_columns_mobile?: number;
          collapsed_categories?: string[];
          sort_by?: "created_at" | "updated_at" | "title";
          sort_order?: "asc" | "desc";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          sidebar_expanded?: boolean;
          theme?: string;
          view_mode_desktop?: "card" | "list";
          card_columns_desktop?: number;
          list_columns_desktop?: number;
          group_columns_desktop?: number;
          view_mode_mobile?: "card" | "list";
          card_columns_mobile?: number;
          list_columns_mobile?: number;
          group_columns_mobile?: number;
          collapsed_categories?: string[];
          sort_by?: "created_at" | "updated_at" | "title";
          sort_order?: "asc" | "desc";
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
