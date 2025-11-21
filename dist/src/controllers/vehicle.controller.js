// backend/src/controllers/vehicle.controller.ts
import prisma from '../lib/prisma';
import { Prisma } from '@prisma/client';
import { io } from '../server';
import slugify from "slugify"; // ✅ ADD SLUGIFY
// ============================================
// GET ALL VEHICLES
// ============================================
export const getAllVehicles = async (req, res) => {
    try {
        const { page = '1', limit = '12', brand, fuelType, transmission, minPrice, maxPrice, status, featured, sortBy = 'createdAt', order = 'desc', } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const where = {};
        if (brand)
            where.brand = brand;
        if (fuelType)
            where.fuelType = fuelType;
        if (transmission)
            where.transmission = transmission;
        if (status)
            where.status = status;
        if (featured)
            where.featured = featured === 'true';
        if (minPrice || maxPrice) {
            where.cashPrice = {};
            if (minPrice)
                where.cashPrice.gte = new Prisma.Decimal(minPrice);
            if (maxPrice)
                where.cashPrice.lte = new Prisma.Decimal(maxPrice);
        }
        const total = await prisma.vehicle.count({ where });
        const vehicles = await prisma.vehicle.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: {
                [sortBy]: order === 'asc' ? 'asc' : 'desc',
            },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                images: { orderBy: { order: 'asc' } },
            },
        });
        res.status(200).json({
            success: true,
            data: vehicles,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicles',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
// ============================================
// GET VEHICLE BY SLUG
// ============================================
export const getVehicleBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const vehicle = await prisma.vehicle.findUnique({
            where: { slug },
            include: {
                category: true,
                images: { orderBy: { order: 'asc' } },
            },
        });
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found',
            });
        }
        res.status(200).json({
            success: true,
            data: vehicle,
        });
    }
    catch (error) {
        console.error('Error fetching vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch vehicle',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
// ============================================
// GET FEATURED VEHICLES
// ============================================
export const getFeaturedVehicles = async (req, res) => {
    try {
        const { limit = '6' } = req.query;
        const vehicles = await prisma.vehicle.findMany({
            where: { featured: true, status: 'AVAILABLE' },
            take: parseInt(limit),
            orderBy: { createdAt: 'desc' },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                images: { orderBy: { order: 'asc' }, take: 1 },
            },
        });
        res.status(200).json({
            success: true,
            data: vehicles,
        });
    }
    catch (error) {
        console.error('Error fetching featured vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch featured vehicles',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
// ============================================
// SEARCH VEHICLES
// ============================================
export const searchVehicles = async (req, res) => {
    try {
        const { q, page = '1', limit = '12' } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Search query is required',
            });
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const searchQuery = q.toLowerCase();
        const where = {
            OR: [
                { brand: { contains: searchQuery, mode: 'insensitive' } },
                { model: { contains: searchQuery, mode: 'insensitive' } },
                { variant: { contains: searchQuery, mode: 'insensitive' } },
                { description: { contains: searchQuery, mode: 'insensitive' } },
            ],
        };
        const total = await prisma.vehicle.count({ where });
        const vehicles = await prisma.vehicle.findMany({
            where,
            skip,
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                images: { orderBy: { order: 'asc' }, take: 1 },
            },
        });
        res.status(200).json({
            success: true,
            data: vehicles,
            query: q,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        console.error('Error searching vehicles:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to search vehicles',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
// ============================================
// CREATE VEHICLE  (UPDATED WITH AUTO-SLUG)
// ============================================
export const createVehicle = async (req, res) => {
    try {
        const { brand, model, year, variant, cashPrice, downPayment, monthlyPayment, leaseTerm, transmission, fuelType, engineSize, horsepower, seatingCapacity, cargoSpace, features, specifications, description, videos, model3dUrl, thumbnailUrl, status, availability, featured, stockCount, metaTitle, metaDescription, categoryId, images, } = req.body;
        // 🔥 AUTO-GENERATE SLUG
        const slug = slugify(`${brand} ${model} ${year}`, { lower: true });
        // check duplicates
        const existing = await prisma.vehicle.findUnique({ where: { slug } });
        if (existing) {
            return res.status(409).json({
                success: false,
                message: 'Vehicle with this slug already exists',
            });
        }
        const vehicle = await prisma.vehicle.create({
            data: {
                slug,
                brand,
                model,
                year: parseInt(year),
                variant,
                cashPrice: new Prisma.Decimal(cashPrice),
                downPayment: new Prisma.Decimal(downPayment),
                monthlyPayment: new Prisma.Decimal(monthlyPayment),
                leaseTerm: parseInt(leaseTerm),
                transmission,
                fuelType,
                engineSize,
                horsepower: horsepower ? parseInt(horsepower) : null,
                seatingCapacity: parseInt(seatingCapacity),
                cargoSpace,
                features: features || [],
                specifications: specifications || {},
                description,
                videos: videos || [],
                model3dUrl,
                thumbnailUrl,
                status: status || 'AVAILABLE',
                availability,
                featured: featured || false,
                stockCount: stockCount ? parseInt(stockCount) : 0,
                metaTitle,
                metaDescription,
                categoryId,
                images: images
                    ? {
                        create: images.map((img, index) => ({
                            url: img.url,
                            alt: img.alt,
                            type: img.type,
                            order: img.order || index,
                        })),
                    }
                    : undefined,
            },
            include: {
                category: true,
                images: { orderBy: { order: 'asc' } },
            },
        });
        io.emit("vehicle:created", vehicle);
        io.to("admin").emit("admin:vehicles", {
            type: "created",
            vehicle,
        });
        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            data: vehicle,
        });
    }
    catch (error) {
        console.error('Error creating vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create vehicle',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
// ============================================
// UPDATE VEHICLE
// ============================================
export const updateVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const existing = await prisma.vehicle.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found',
            });
        }
        const { images, ...vehicleData } = updateData;
        if (vehicleData.cashPrice)
            vehicleData.cashPrice = new Prisma.Decimal(vehicleData.cashPrice);
        if (vehicleData.downPayment)
            vehicleData.downPayment = new Prisma.Decimal(vehicleData.downPayment);
        if (vehicleData.monthlyPayment)
            vehicleData.monthlyPayment = new Prisma.Decimal(vehicleData.monthlyPayment);
        const vehicle = await prisma.vehicle.update({
            where: { id },
            data: vehicleData,
            include: {
                category: true,
                images: { orderBy: { order: 'asc' } },
            },
        });
        if (images && Array.isArray(images)) {
            await prisma.vehicleImage.deleteMany({ where: { vehicleId: id } });
            await prisma.vehicleImage.createMany({
                data: images.map((img, index) => ({
                    vehicleId: id,
                    url: img.url,
                    alt: img.alt,
                    type: img.type,
                    order: img.order || index,
                })),
            });
        }
        const updated = await prisma.vehicle.findUnique({
            where: { id },
            include: {
                category: true,
                images: { orderBy: { order: 'asc' } },
            },
        });
        io.emit("vehicle:updated", updated);
        io.to(`vehicle:${id}`).emit("vehicle:updated", updated);
        io.to("admin").emit("admin:vehicles", {
            type: "updated",
            vehicle: updated,
        });
        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: updated,
        });
    }
    catch (error) {
        console.error('Error updating vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update vehicle',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
// ============================================
// DELETE VEHICLE
// ============================================
export const deleteVehicle = async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.vehicle.findUnique({ where: { id } });
        if (!existing) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found',
            });
        }
        await prisma.vehicle.delete({ where: { id } });
        io.emit("vehicle:deleted", { id });
        io.to(`vehicle:${id}`).emit("vehicle:deleted", { id });
        io.to("admin").emit("admin:vehicles", {
            type: "deleted",
            id,
        });
        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully',
        });
    }
    catch (error) {
        console.error('Error deleting vehicle:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete vehicle',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
};
//# sourceMappingURL=vehicle.controller.js.map