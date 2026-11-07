-- ============================================================================
-- Grace Fellowship Church - Master PostgreSQL Database Migration for Supabase
-- Initial Schema & Seed Data
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. Pastoral Prayer Requests & Attachments
-- ============================================================================

CREATE TABLE IF NOT EXISTS prayer_requests (
    id VARCHAR(40) PRIMARY KEY,
    name VARCHAR(120),
    email VARCHAR(255),
    phone VARCHAR(50),
    category VARCHAR(80) NOT NULL,
    message TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE NOT NULL,
    contact_permission BOOLEAN DEFAULT TRUE NOT NULL,
    status VARCHAR(20) DEFAULT 'Pending' NOT NULL,
    pastoral_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prayer_requests_category ON prayer_requests(category);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_status ON prayer_requests(status);
CREATE INDEX IF NOT EXISTS idx_prayer_requests_created_at ON prayer_requests(created_at);

CREATE TABLE IF NOT EXISTS prayer_attachments (
    id VARCHAR(40) PRIMARY KEY,
    request_id VARCHAR(40) NOT NULL REFERENCES prayer_requests(id) ON DELETE CASCADE,
    original_filename VARCHAR(255) NOT NULL,
    stored_filename VARCHAR(255) NOT NULL UNIQUE,
    file_type VARCHAR(30) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    duration_seconds INTEGER,
    storage_path VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_prayer_attachments_request_id ON prayer_attachments(request_id);

-- ============================================================================
-- 2. Website Content Management System (CMS) Tables
-- ============================================================================

-- Site Settings
CREATE TABLE IF NOT EXISTS cms_site_settings (
    id SERIAL PRIMARY KEY,
    church_name VARCHAR(200) DEFAULT 'Grace Fellowship Church' NOT NULL,
    church_tagline VARCHAR(255) DEFAULT 'Worship • Grow • Serve • Share' NOT NULL,
    logo_url VARCHAR(500) DEFAULT '' NOT NULL,
    primary_color VARCHAR(50) DEFAULT '#0f1e36' NOT NULL,
    footer_text TEXT DEFAULT 'A Bible-believing family church dedicated to worship, discipleship, and community outreach.' NOT NULL,
    copyright_text VARCHAR(255) DEFAULT '© 2026 Grace Fellowship Church. All rights reserved.' NOT NULL,
    seo_title VARCHAR(255) DEFAULT 'Grace Fellowship Church - Worship • Grow • Serve • Share' NOT NULL,
    seo_description TEXT DEFAULT 'Welcome to Grace Fellowship Church. Join us for Sunday worship, service timings, announcements, and online Bible study.' NOT NULL,
    seo_keywords VARCHAR(500) DEFAULT 'Grace Fellowship Church, Sunday Service, Holy Bible Telugu English, Prayer Requests' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Home Hero Section
CREATE TABLE IF NOT EXISTS cms_home_sections (
    id SERIAL PRIMARY KEY,
    welcome_text VARCHAR(100) DEFAULT 'Welcome to' NOT NULL,
    hero_title VARCHAR(200) DEFAULT 'Grace Fellowship Church' NOT NULL,
    hero_subtitle TEXT DEFAULT 'A family of believers growing together in Christ''s love.' NOT NULL,
    hero_verse TEXT DEFAULT '“For where two or three gather in my name, there am I with them.” — Matthew 18:20' NOT NULL,
    hero_bg_image VARCHAR(500) DEFAULT 'home/assets/hero_cross_sunset.jpg' NOT NULL,
    cta_primary_text VARCHAR(100) DEFAULT 'Join Us This Sunday' NOT NULL,
    cta_primary_link VARCHAR(200) DEFAULT '#service-timings' NOT NULL,
    cta_secondary_text VARCHAR(100) DEFAULT 'Watch Sermons' NOT NULL,
    cta_secondary_link VARCHAR(200) DEFAULT '#sermons' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- About Us Section
CREATE TABLE IF NOT EXISTS cms_about_section (
    id SERIAL PRIMARY KEY,
    history_text TEXT DEFAULT 'Founded in faith, Grace Fellowship Church has stood as a beacon of Christ''s love and grace in our community for over two decades.' NOT NULL,
    mission_text TEXT DEFAULT 'To glorify God by making disciples of Jesus Christ who love God, love people, and transform communities.' NOT NULL,
    vision_text TEXT DEFAULT 'A vibrant, Christ-centered, multi-generational church impacting generations with the Gospel.' NOT NULL,
    beliefs_json TEXT DEFAULT '["The Authority of Scripture", "The Trinity (Father, Son, Holy Spirit)", "Salvation by Grace Through Faith", "Water Baptism and Communion", "The Power of Prayer and Intercession"]' NOT NULL,
    lead_pastor_name VARCHAR(150) DEFAULT 'Pastor John Samuel' NOT NULL,
    lead_pastor_title VARCHAR(100) DEFAULT 'Senior Pastor' NOT NULL,
    lead_pastor_bio TEXT DEFAULT 'Serving with humility and love, Pastor John Samuel has dedicated his life to teaching God''s Word with clarity, passion, and pastoral care.' NOT NULL,
    lead_pastor_image VARCHAR(500) DEFAULT 'home/assets/sermon_pastor.jpg' NOT NULL,
    campus_image VARCHAR(500) DEFAULT 'home/assets/church_building.jpg' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bible Reader Settings
CREATE TABLE IF NOT EXISTS cms_bible_settings (
    id SERIAL PRIMARY KEY,
    daily_verse_book VARCHAR(100) DEFAULT 'psalms' NOT NULL,
    daily_verse_chapter INTEGER DEFAULT 23 NOT NULL,
    daily_verse_number INTEGER DEFAULT 1 NOT NULL,
    daily_verse_text_kjv TEXT DEFAULT 'The Lord is my shepherd; I shall not want.' NOT NULL,
    daily_verse_text_telugu TEXT DEFAULT 'యెహోవా నా కాపరి నాకు లేమి కలుగదు.' NOT NULL,
    default_translation VARCHAR(20) DEFAULT 'kjv' NOT NULL,
    is_daily_verse_active BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Service Timings
CREATE TABLE IF NOT EXISTS cms_service_timings (
    id SERIAL PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    hours VARCHAR(100) NOT NULL,
    subtitle VARCHAR(200) NOT NULL,
    card_class VARCHAR(50) DEFAULT 'standard' NOT NULL,
    icon_name VARCHAR(50) DEFAULT 'church' NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Announcements
CREATE TABLE IF NOT EXISTS cms_announcements (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(255) NOT NULL,
    date_text VARCHAR(100) NOT NULL,
    time_text VARCHAR(100) NOT NULL,
    location VARCHAR(200) NOT NULL,
    image VARCHAR(500) NOT NULL,
    action_text VARCHAR(100) DEFAULT 'Register Now' NOT NULL,
    action_link VARCHAR(500) DEFAULT '#contact' NOT NULL,
    tag VARCHAR(80) DEFAULT 'Announcement' NOT NULL,
    tag_class VARCHAR(50) DEFAULT 'blue' NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sermons
CREATE TABLE IF NOT EXISTS cms_sermons (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    speaker VARCHAR(150) NOT NULL,
    date_text VARCHAR(100) NOT NULL,
    duration VARCHAR(50) NOT NULL,
    thumbnail VARCHAR(500) NOT NULL,
    passage VARCHAR(200) NOT NULL,
    video_url VARCHAR(500) DEFAULT '' NOT NULL,
    audio_url VARCHAR(500) DEFAULT '' NOT NULL,
    description TEXT DEFAULT '' NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Events
CREATE TABLE IF NOT EXISTS cms_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(255) DEFAULT '' NOT NULL,
    date_text VARCHAR(100) NOT NULL,
    time_text VARCHAR(100) DEFAULT '' NOT NULL,
    location VARCHAR(200) NOT NULL,
    image VARCHAR(500) NOT NULL,
    action_text VARCHAR(100) DEFAULT 'Register Now' NOT NULL,
    registration_link VARCHAR(500) DEFAULT '#contact' NOT NULL,
    registration_open BOOLEAN DEFAULT TRUE NOT NULL,
    category_tag VARCHAR(80) DEFAULT 'Church Event' NOT NULL,
    description TEXT DEFAULT '' NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Ministries
CREATE TABLE IF NOT EXISTS cms_ministries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(100) DEFAULT '' NOT NULL,
    short_description VARCHAR(255) NOT NULL,
    full_description TEXT DEFAULT '' NOT NULL,
    photo VARCHAR(500) NOT NULL,
    leader_name VARCHAR(150) DEFAULT '' NOT NULL,
    meeting_time VARCHAR(150) DEFAULT '' NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Gallery
CREATE TABLE IF NOT EXISTS cms_gallery (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    caption VARCHAR(255) DEFAULT '' NOT NULL,
    category VARCHAR(80) DEFAULT 'Worship' NOT NULL,
    media_type VARCHAR(20) DEFAULT 'image' NOT NULL,
    media_url VARCHAR(500) NOT NULL,
    is_published BOOLEAN DEFAULT TRUE NOT NULL,
    order_index INTEGER DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contact Info
CREATE TABLE IF NOT EXISTS cms_contact_info (
    id SERIAL PRIMARY KEY,
    address_line1 VARCHAR(200) DEFAULT '123 Faith Avenue' NOT NULL,
    address_line2 VARCHAR(200) DEFAULT '' NOT NULL,
    city VARCHAR(100) DEFAULT 'Hyderabad' NOT NULL,
    state VARCHAR(100) DEFAULT 'Telangana' NOT NULL,
    postal_code VARCHAR(30) DEFAULT '500001' NOT NULL,
    phone_primary VARCHAR(50) DEFAULT '+91 98765 43210' NOT NULL,
    phone_secondary VARCHAR(50) DEFAULT '' NOT NULL,
    email_primary VARCHAR(255) DEFAULT 'info@gracefellowship.org' NOT NULL,
    email_prayer VARCHAR(255) DEFAULT 'prayer@gracefellowship.org' NOT NULL,
    google_maps_link VARCHAR(500) DEFAULT 'https://maps.google.com/?q=Grace+Fellowship+Church+Hyderabad' NOT NULL,
    map_embed_lat DOUBLE PRECISION DEFAULT 17.385044 NOT NULL,
    map_embed_lng DOUBLE PRECISION DEFAULT 78.486671 NOT NULL,
    church_exterior_image VARCHAR(500) DEFAULT 'home/assets/church_building.jpg' NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Admin Users
CREATE TABLE IF NOT EXISTS cms_admin_users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Editor' NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- ============================================================================
-- 3. Initial Seed Records
-- ============================================================================

INSERT INTO cms_site_settings (id, church_name, church_tagline, primary_color, copyright_text)
VALUES (1, 'Grace Fellowship Church', 'Worship • Grow • Serve • Share', '#0f172a', '© 2026 Grace Fellowship Church. All rights reserved.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cms_home_sections (id, welcome_text, hero_title, hero_subtitle, hero_verse, hero_bg_image)
VALUES (1, 'Welcome to', 'Grace Fellowship Church', 'A family of believers growing together in Christ''s love.', '“For where two or three gather in my name, there am I with them.” — Matthew 18:20', 'home/assets/hero_cross_sunset.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cms_about_section (id, lead_pastor_name, lead_pastor_title, lead_pastor_bio, lead_pastor_image)
VALUES (1, 'Pastor John Samuel', 'Senior Pastor', 'Serving with humility and love, Pastor John Samuel has dedicated his life to teaching God''s Word with clarity, passion, and pastoral care.', 'home/assets/sermon_pastor.jpg')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cms_bible_settings (id, daily_verse_book, daily_verse_chapter, daily_verse_number, daily_verse_text_kjv, daily_verse_text_telugu)
VALUES (1, 'psalms', 23, 1, 'The Lord is my shepherd; I shall not want.', 'యెహోవా నా కాపరి నాకు లేమి కలుగదు.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO cms_contact_info (id, address_line1, city, state, postal_code, phone_primary, email_primary)
VALUES (1, '123 Faith Avenue', 'Hyderabad', 'Telangana', '500001', '+91 98765 43210', 'info@gracefellowship.org')
ON CONFLICT (id) DO NOTHING;

