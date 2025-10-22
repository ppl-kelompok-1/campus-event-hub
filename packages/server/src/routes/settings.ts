import { Router, Request, Response } from 'express';
import { SettingsService } from '../services/SettingsService';
import { AuthService } from '../services/AuthService';
import { asyncHandler } from '../middleware/error';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import { UpdateSettingsDto } from '../services/SettingsService';
import { logoUpload, getLogoUrl } from '../infrastructure/upload/logoUpload';
import fs from 'fs';

export const createSettingsRouter = (settingsService: SettingsService, authService: AuthService): Router => {
  const router = Router();

  // GET /api/v1/settings - Get current site settings (public - no auth required)
  router.get('/',
    asyncHandler(async (req: Request, res: Response) => {
      const settings = await settingsService.getSettings();

      res.json({
        success: true,
        data: settings
      });
    })
  );

  // PUT /api/v1/settings - Update site settings (Superadmin only)
  router.put('/',
    authenticate(authService),
    authorize(UserRole.SUPERADMIN),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const updateDto: UpdateSettingsDto = {
        siteTitle: req.body.siteTitle,
        siteLogoUrl: req.body.siteLogoUrl,
        primaryColor: req.body.primaryColor,
        secondaryColor: req.body.secondaryColor,
        backgroundColor: req.body.backgroundColor,
        cardBackgroundColor: req.body.cardBackgroundColor,
        textColorAuto: req.body.textColorAuto,
        textColorPrimary: req.body.textColorPrimary,
        textColorSecondary: req.body.textColorSecondary,
        textColorMuted: req.body.textColorMuted,
        footerText: req.body.footerText,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
        contactAddress: req.body.contactAddress,
        socialFacebook: req.body.socialFacebook,
        socialTwitter: req.body.socialTwitter,
        socialInstagram: req.body.socialInstagram,
        socialLinkedin: req.body.socialLinkedin
      };

      const settings = await settingsService.updateSettings(updateDto, req.user.userId);

      res.json({
        success: true,
        data: settings,
        message: 'Settings updated successfully'
      });
    })
  );

  // POST /api/v1/settings/logo - Upload site logo (Superadmin only)
  router.post('/logo',
    authenticate(authService),
    authorize(UserRole.SUPERADMIN),
    logoUpload.single('logo'),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No logo file uploaded'
        });
      }

      try {
        // Get the logo URL (relative path for storage)
        const logoUrl = getLogoUrl(req.file.filename);

        // Update settings with new logo URL
        const updateDto: UpdateSettingsDto = {
          siteLogoUrl: logoUrl
        };

        const settings = await settingsService.updateSettings(updateDto, req.user.userId);

        res.json({
          success: true,
          data: settings,
          message: 'Logo uploaded successfully'
        });
      } catch (error) {
        // Clean up uploaded file if there's an error
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        throw error;
      }
    })
  );

  // DELETE /api/v1/settings/logo - Delete site logo (Superadmin only)
  router.delete('/logo',
    authenticate(authService),
    authorize(UserRole.SUPERADMIN),
    asyncHandler(async (req: Request, res: Response) => {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      await settingsService.deleteLogo();

      res.json({
        success: true,
        message: 'Logo deleted successfully'
      });
    })
  );

  return router;
};
