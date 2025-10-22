import { IDatabase } from '../infrastructure/database/IDatabase';
import * as fs from 'fs';
import * as path from 'path';

export interface SiteSettings {
  id: number;
  siteTitle: string;
  siteLogoUrl: string | null;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  cardBackgroundColor: string;
  textColorAuto: boolean;
  textColorPrimary: string;
  textColorSecondary: string;
  textColorMuted: string;
  footerText: string;
  contactEmail: string | null;
  contactPhone: string | null;
  contactAddress: string | null;
  socialFacebook: string | null;
  socialTwitter: string | null;
  socialInstagram: string | null;
  socialLinkedin: string | null;
  updatedAt: string;
  updatedBy: number | null;
}

export interface UpdateSettingsDto {
  siteTitle?: string;
  siteLogoUrl?: string | null;
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  cardBackgroundColor?: string;
  textColorAuto?: boolean;
  textColorPrimary?: string;
  textColorSecondary?: string;
  textColorMuted?: string;
  footerText?: string;
  contactEmail?: string | null;
  contactPhone?: string | null;
  contactAddress?: string | null;
  socialFacebook?: string | null;
  socialTwitter?: string | null;
  socialInstagram?: string | null;
  socialLinkedin?: string | null;
}

export class SettingsService {
  constructor(private db: IDatabase) {}

  // Get current site settings (public - no auth required)
  async getSettings(): Promise<SiteSettings> {
    const settings = this.db.get<any>(
      `SELECT
        id,
        site_title as siteTitle,
        site_logo_url as siteLogoUrl,
        primary_color as primaryColor,
        secondary_color as secondaryColor,
        background_color as backgroundColor,
        card_background_color as cardBackgroundColor,
        text_color_auto as textColorAuto,
        text_color_primary as textColorPrimary,
        text_color_secondary as textColorSecondary,
        text_color_muted as textColorMuted,
        footer_text as footerText,
        contact_email as contactEmail,
        contact_phone as contactPhone,
        contact_address as contactAddress,
        social_facebook as socialFacebook,
        social_twitter as socialTwitter,
        social_instagram as socialInstagram,
        social_linkedin as socialLinkedin,
        updated_at as updatedAt,
        updated_by as updatedBy
      FROM site_settings
      WHERE id = 1`
    );

    if (!settings) {
      throw new Error('Site settings not found');
    }

    // Convert SQLite boolean (0/1) to JavaScript boolean
    settings.textColorAuto = Boolean(settings.textColorAuto);

    return settings;
  }

  // Update site settings (superadmin only)
  async updateSettings(data: UpdateSettingsDto, userId: number): Promise<SiteSettings> {
    // Validate input
    this.validateSettingsData(data);

    // Auto-calculate text colors if enabled
    if (data.textColorAuto && data.backgroundColor) {
      const calculatedColors = this.calculateTextColors(data.backgroundColor);
      data.textColorPrimary = calculatedColors.primary;
      data.textColorSecondary = calculatedColors.secondary;
      data.textColorMuted = calculatedColors.muted;
    }

    // Build UPDATE statement dynamically
    const updates: string[] = [];
    const values: any[] = [];

    if (data.siteTitle !== undefined) {
      updates.push('site_title = ?');
      values.push(data.siteTitle);
    }
    if (data.siteLogoUrl !== undefined) {
      updates.push('site_logo_url = ?');
      values.push(data.siteLogoUrl);
    }
    if (data.primaryColor !== undefined) {
      updates.push('primary_color = ?');
      values.push(data.primaryColor);
    }
    if (data.secondaryColor !== undefined) {
      updates.push('secondary_color = ?');
      values.push(data.secondaryColor);
    }
    if (data.backgroundColor !== undefined) {
      updates.push('background_color = ?');
      values.push(data.backgroundColor);
    }
    if (data.cardBackgroundColor !== undefined) {
      updates.push('card_background_color = ?');
      values.push(data.cardBackgroundColor);
    }
    if (data.textColorAuto !== undefined) {
      updates.push('text_color_auto = ?');
      values.push(data.textColorAuto ? 1 : 0);
    }
    if (data.textColorPrimary !== undefined) {
      updates.push('text_color_primary = ?');
      values.push(data.textColorPrimary);
    }
    if (data.textColorSecondary !== undefined) {
      updates.push('text_color_secondary = ?');
      values.push(data.textColorSecondary);
    }
    if (data.textColorMuted !== undefined) {
      updates.push('text_color_muted = ?');
      values.push(data.textColorMuted);
    }
    if (data.footerText !== undefined) {
      updates.push('footer_text = ?');
      values.push(data.footerText);
    }
    if (data.contactEmail !== undefined) {
      updates.push('contact_email = ?');
      values.push(data.contactEmail);
    }
    if (data.contactPhone !== undefined) {
      updates.push('contact_phone = ?');
      values.push(data.contactPhone);
    }
    if (data.contactAddress !== undefined) {
      updates.push('contact_address = ?');
      values.push(data.contactAddress);
    }
    if (data.socialFacebook !== undefined) {
      updates.push('social_facebook = ?');
      values.push(data.socialFacebook);
    }
    if (data.socialTwitter !== undefined) {
      updates.push('social_twitter = ?');
      values.push(data.socialTwitter);
    }
    if (data.socialInstagram !== undefined) {
      updates.push('social_instagram = ?');
      values.push(data.socialInstagram);
    }
    if (data.socialLinkedin !== undefined) {
      updates.push('social_linkedin = ?');
      values.push(data.socialLinkedin);
    }

    // Always update metadata
    updates.push('updated_at = CURRENT_TIMESTAMP');
    updates.push('updated_by = ?');
    values.push(userId);

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    // Execute UPDATE
    this.db.run(
      `UPDATE site_settings SET ${updates.join(', ')} WHERE id = 1`,
      values
    );

    // Return updated settings
    return this.getSettings();
  }

  // Delete logo file from disk
  async deleteLogo(): Promise<void> {
    const settings = await this.getSettings();

    if (settings.siteLogoUrl) {
      // siteLogoUrl is stored as "/uploads/logos/filename.ext", so we need to convert it to actual file path
      // Remove leading slash and construct full path
      const relativePath = settings.siteLogoUrl.replace(/^\//, '');
      const logoPath = path.join(process.cwd(), relativePath);

      if (fs.existsSync(logoPath)) {
        fs.unlinkSync(logoPath);
      }

      // Update database to remove logo URL
      this.db.run(
        'UPDATE site_settings SET site_logo_url = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = 1'
      );
    }
  }

  // Calculate contrasting text colors from background color
  calculateTextColors(backgroundColor: string): {
    primary: string;
    secondary: string;
    muted: string;
  } {
    const luminance = this.getColorLuminance(backgroundColor);

    // If background is dark (luminance < 0.5), use light text
    // If background is light (luminance >= 0.5), use dark text
    if (luminance < 0.5) {
      return {
        primary: '#ffffff',
        secondary: '#e0e0e0',
        muted: '#b0b0b0'
      };
    } else {
      return {
        primary: '#2c3e50',
        secondary: '#6c757d',
        muted: '#999999'
      };
    }
  }

  // Calculate relative luminance of a color
  private getColorLuminance(hexColor: string): number {
    // Remove # if present
    const hex = hexColor.replace('#', '');

    // Parse RGB values
    const r = parseInt(hex.substr(0, 2), 16) / 255;
    const g = parseInt(hex.substr(2, 2), 16) / 255;
    const b = parseInt(hex.substr(4, 2), 16) / 255;

    // Apply gamma correction
    const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4);
    const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4);
    const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4);

    // Calculate relative luminance
    return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  }

  // Validate settings data
  private validateSettingsData(data: UpdateSettingsDto): void {
    // Validate hex colors
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

    if (data.primaryColor && !hexColorRegex.test(data.primaryColor)) {
      throw new Error('Invalid primary color format. Must be a hex color (e.g., #007bff)');
    }
    if (data.secondaryColor && !hexColorRegex.test(data.secondaryColor)) {
      throw new Error('Invalid secondary color format. Must be a hex color (e.g., #28a745)');
    }
    if (data.backgroundColor && !hexColorRegex.test(data.backgroundColor)) {
      throw new Error('Invalid background color format. Must be a hex color (e.g., #f8f9fa)');
    }
    if (data.cardBackgroundColor && !hexColorRegex.test(data.cardBackgroundColor)) {
      throw new Error('Invalid card background color format. Must be a hex color (e.g., #ffffff)');
    }
    if (data.textColorPrimary && !hexColorRegex.test(data.textColorPrimary)) {
      throw new Error('Invalid text primary color format. Must be a hex color (e.g., #2c3e50)');
    }
    if (data.textColorSecondary && !hexColorRegex.test(data.textColorSecondary)) {
      throw new Error('Invalid text secondary color format. Must be a hex color (e.g., #6c757d)');
    }
    if (data.textColorMuted && !hexColorRegex.test(data.textColorMuted)) {
      throw new Error('Invalid text muted color format. Must be a hex color (e.g., #999999)');
    }

    // Validate URLs
    const urlRegex = /^https?:\/\/.+/;
    if (data.socialFacebook && data.socialFacebook.trim() && !urlRegex.test(data.socialFacebook)) {
      throw new Error('Invalid Facebook URL. Must start with http:// or https://');
    }
    if (data.socialTwitter && data.socialTwitter.trim() && !urlRegex.test(data.socialTwitter)) {
      throw new Error('Invalid Twitter URL. Must start with http:// or https://');
    }
    if (data.socialInstagram && data.socialInstagram.trim() && !urlRegex.test(data.socialInstagram)) {
      throw new Error('Invalid Instagram URL. Must start with http:// or https://');
    }
    if (data.socialLinkedin && data.socialLinkedin.trim() && !urlRegex.test(data.socialLinkedin)) {
      throw new Error('Invalid LinkedIn URL. Must start with http:// or https://');
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (data.contactEmail && data.contactEmail.trim() && !emailRegex.test(data.contactEmail)) {
      throw new Error('Invalid email format');
    }

    // Validate site title
    if (data.siteTitle !== undefined && data.siteTitle.trim().length === 0) {
      throw new Error('Site title cannot be empty');
    }
  }
}
