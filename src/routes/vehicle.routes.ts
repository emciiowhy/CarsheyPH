// backend/src/routes/vehicle.routes.ts
import { Router } from 'express';
import {
  getAllVehicles,
  getVehicleBySlug,
  getFeaturedVehicles,
  searchVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicle.controller.js'; // <- add .js for ESM

import { validateRequired } from '../middleware/security.js'; // <- add .js for ESM

const router = Router();

// ============================
// PUBLIC ROUTES
// ============================
router.get('/', getAllVehicles);  
router.get('/featured', getFeaturedVehicles);
router.get('/search', searchVehicles);
router.get('/:slug', getVehicleBySlug);

// ============================
// ADMIN ROUTES
// ============================
router.post(
  '/',
  validateRequired([
    'slug',
    'brand',
    'model',
    'year',
    'cashPrice',
    'downPayment',
    'monthlyPayment',
    'leaseTerm',
    'transmission',
    'fuelType',
    'seatingCapacity',
    'thumbnailUrl',
    'availability',
    'categoryId',
  ]),
  createVehicle
);

router.put('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
