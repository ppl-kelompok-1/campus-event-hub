-- Migration: Create site_settings table
-- Description: Stores customizable site-wide settings for appearance and information

CREATE TABLE IF NOT EXISTS site_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,

  -- General Settings
  site_title TEXT NOT NULL DEFAULT 'Campus Event Hub',
  site_logo_url TEXT,

  -- Color Scheme
  primary_color TEXT NOT NULL DEFAULT '#007bff',
  secondary_color TEXT NOT NULL DEFAULT '#28a745',
  background_color TEXT NOT NULL DEFAULT '#f8f9fa',
  card_background_color TEXT NOT NULL DEFAULT '#ffffff',

  -- Text Colors (with auto-calculate option)
  text_color_auto BOOLEAN NOT NULL DEFAULT 1,
  text_color_primary TEXT DEFAULT '#2c3e50',
  text_color_secondary TEXT DEFAULT '#6c757d',
  text_color_muted TEXT DEFAULT '#999999',

  -- Footer & Contact
  footer_text TEXT DEFAULT '© 2025 Campus Event Hub. All rights reserved.',
  contact_email TEXT,
  contact_phone TEXT,
  contact_address TEXT,

  -- Social Media
  social_facebook TEXT,
  social_twitter TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,

  -- Metadata
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER,

  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Insert default settings row
INSERT INTO site_settings (
  id,
  site_title,
  site_logo_url,
  primary_color,
  secondary_color,
  background_color,
  card_background_color,
  text_color_auto,
  text_color_primary,
  text_color_secondary,
  text_color_muted,
  footer_text
) VALUES (
  1,
  'Campus Event Hub',
  NULL,
  '#007bff',
  '#28a745',
  '#f8f9fa',
  '#ffffff',
  1,
  '#2c3e50',
  '#6c757d',
  '#999999',
  '© 2025 Campus Event Hub. All rights reserved.'
);
