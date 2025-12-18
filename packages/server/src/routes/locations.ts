import { Router, Request, Response } from 'express';
import { LocationService } from '../services/LocationService';
import { AuthService } from '../services/AuthService';
import { asyncHandler } from '../middleware/error';
import { authenticate, authorize } from '../middleware/auth';
import { CreateLocationDto, UpdateLocationDto } from '../models/Location';
import { UserRole } from '../models/User';

export const createLocationRouter = (locationService: LocationService, authService: AuthService): Router => {
  const router = Router();

  // GET /api/v1/locations - Get all locations (public access)
  router.get('/',
    asyncHandler(async (req: Request, res: Response) => {
      const locations = await locationService.getAllLocations();

      res.json({
        success: true,
        data: locations
      });
    })
  );

  // GET /api/v1/locations/active - Get only active locations for dropdown (public access)
  router.get('/active',
    asyncHandler(async (req: Request, res: Response) => {
      const locations = await locationService.getActiveLocations();

      res.json({
        success: true,
        data: locations
      });
    })
  );

  // GET /api/v1/locations/paginated - Get locations with pagination (admin only)
  router.get('/paginated',
    authenticate(authService),
    authorize(UserRole.ADMIN, UserRole.SUPERADMIN),
    asyncHandler(async (req: Request, res: Response) => {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await locationService.getLocationsPaginated(page, limit);

      res.json({
        success: true,
        data: result.locations,
        pagination: {
          page: result.page,
          limit,
          total: result.total,
          totalPages: result.totalPages
        }
      });
    })
  );

  // GET /api/v1/locations/:id - Get a specific location
  router.get('/:id',
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid location ID'
        });
      }

      const location = await locationService.getLocationById(id);

      if (!location) {
        return res.status(404).json({
          success: false,
          error: 'Location not found'
        });
      }

      res.json({
        success: true,
        data: location
      });
    })
  );

  // POST /api/v1/locations - Create a new location (admin only)
  router.post('/',
    authenticate(authService),
    authorize(UserRole.ADMIN, UserRole.SUPERADMIN),
    asyncHandler(async (req: Request, res: Response) => {
      const { name, maxCapacity } = req.body as CreateLocationDto;

      if (!name) {
        return res.status(400).json({
          success: false,
          error: 'Location name is required'
        });
      }

      const locationData: CreateLocationDto = {
        name,
        maxCapacity: maxCapacity !== undefined ? Number(maxCapacity) : undefined
      };

      const location = await locationService.createLocation(locationData);

      res.status(201).json({
        success: true,
        data: location
      });
    })
  );

  // PUT /api/v1/locations/:id - Update a location (admin only)
  router.put('/:id',
    authenticate(authService),
    authorize(UserRole.ADMIN, UserRole.SUPERADMIN),
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid location ID'
        });
      }

      const { name, isActive, maxCapacity } = req.body as UpdateLocationDto;

      const locationData: UpdateLocationDto = {
        name,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        maxCapacity: maxCapacity !== undefined ? Number(maxCapacity) : undefined
      };

      const location = await locationService.updateLocation(id, locationData);

      res.json({
        success: true,
        data: location
      });
    })
  );

  // PATCH /api/v1/locations/:id/toggle - Toggle location status (admin only)
  router.patch('/:id/toggle',
    authenticate(authService),
    authorize(UserRole.ADMIN, UserRole.SUPERADMIN),
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid location ID'
        });
      }

      const location = await locationService.toggleLocationStatus(id);

      res.json({
        success: true,
        data: location
      });
    })
  );

  // DELETE /api/v1/locations/:id - Delete a location (admin only)
  router.delete('/:id',
    authenticate(authService),
    authorize(UserRole.ADMIN, UserRole.SUPERADMIN),
    asyncHandler(async (req: Request, res: Response) => {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid location ID'
        });
      }

      const success = await locationService.deleteLocation(id);

      if (success) {
        res.json({
          success: true,
          message: 'Location deleted successfully'
        });
      } else {
        res.status(500).json({
          success: false,
          error: 'Failed to delete location'
        });
      }
    })
  );

  return router;
};
