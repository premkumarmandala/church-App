"""Pydantic validation schemas for Church Website CMS."""
from typing import Any, Optional
from pydantic import BaseModel, Field


class SiteSettingsUpdate(BaseModel):
    church_name: Optional[str] = None
    church_tagline: Optional[str] = None
    logo_url: Optional[str] = None
    primary_color: Optional[str] = None
    footer_text: Optional[str] = None
    copyright_text: Optional[str] = None
    seo_title: Optional[str] = None
    seo_description: Optional[str] = None
    seo_keywords: Optional[str] = None


class HomeSectionUpdate(BaseModel):
    welcome_text: Optional[str] = None
    hero_title: Optional[str] = None
    hero_subtitle: Optional[str] = None
    hero_verse: Optional[str] = None
    hero_bg_image: Optional[str] = None
    cta_primary_text: Optional[str] = None
    cta_primary_link: Optional[str] = None
    cta_secondary_text: Optional[str] = None
    cta_secondary_link: Optional[str] = None


class AboutSectionUpdate(BaseModel):
    history_text: Optional[str] = None
    mission_text: Optional[str] = None
    vision_text: Optional[str] = None
    beliefs_json: Optional[str] = None
    lead_pastor_name: Optional[str] = None
    lead_pastor_title: Optional[str] = None
    lead_pastor_bio: Optional[str] = None
    lead_pastor_image: Optional[str] = None
    campus_image: Optional[str] = None


class BibleDisplaySettingsUpdate(BaseModel):
    default_translation: Optional[str] = None
    allow_parallel_reading: Optional[bool] = None
    show_verse_numbers: Optional[bool] = None
    daily_verse_enabled: Optional[bool] = None


class SermonCreateUpdate(BaseModel):
    title: Optional[str] = None
    speaker: Optional[str] = None
    date_text: Optional[str] = None
    duration: Optional[str] = None
    thumbnail: Optional[str] = None
    video_url: Optional[str] = None
    audio_url: Optional[str] = None
    passage: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None
    order_index: Optional[int] = None


class EventCreateUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    date_text: Optional[str] = None
    time_text: Optional[str] = None
    location: Optional[str] = None
    image: Optional[str] = None
    action_text: Optional[str] = None
    registration_link: Optional[str] = None
    registration_open: Optional[bool] = None
    category_tag: Optional[str] = None
    description: Optional[str] = None
    is_published: Optional[bool] = None
    order_index: Optional[int] = None


class MinistryCreateUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    short_description: Optional[str] = None
    full_description: Optional[str] = None
    photo: Optional[str] = None
    leader_name: Optional[str] = None
    meeting_time: Optional[str] = None
    is_published: Optional[bool] = None
    order_index: Optional[int] = None


class GalleryCreateUpdate(BaseModel):
    title: Optional[str] = None
    caption: Optional[str] = None
    media_type: Optional[str] = None
    media_url: Optional[str] = None
    thumbnail_url: Optional[str] = None
    category: Optional[str] = None
    is_published: Optional[bool] = None
    order_index: Optional[int] = None


class ServiceTimingCreateUpdate(BaseModel):
    title: Optional[str] = None
    hours: Optional[str] = None
    subtitle: Optional[str] = None
    card_class: Optional[str] = None
    icon_name: Optional[str] = None
    day_of_week: Optional[str] = None
    is_published: Optional[bool] = None
    order_index: Optional[int] = None


class AnnouncementCreateUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    date_text: Optional[str] = None
    time_text: Optional[str] = None
    location: Optional[str] = None
    image: Optional[str] = None
    action_text: Optional[str] = None
    action_link: Optional[str] = None
    tag: Optional[str] = None
    tag_class: Optional[str] = None
    is_published: Optional[bool] = None
    order_index: Optional[int] = None


class ContactInfoUpdate(BaseModel):
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city_state_zip: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    google_maps_url: Optional[str] = None
    facebook_url: Optional[str] = None
    youtube_url: Optional[str] = None
    instagram_url: Optional[str] = None
    whatsapp_number: Optional[str] = None
    church_exterior_image: Optional[str] = None


class PublishToggleInput(BaseModel):
    is_published: bool


class CMSOverviewStats(BaseModel):
    total_content_items: int
    total_prayer_requests: int
    published_sermons: int
    upcoming_events: int
    active_announcements: int
    total_ministries: int
    gallery_items: int
    service_timings: int
    recent_activities: list[dict[str, Any]]
