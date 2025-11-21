import { PrismaClient, Prisma } from "@prisma/client";
import slugify from "slugify";
const prisma = new PrismaClient();
async function main() {
    console.log("🌱 Seeding database...");
    // ======================================================
    // 1. Dealership + Branches
    // ======================================================
    const dealership = await prisma.dealership.create({
        data: {
            name: "Carshey Motors",
            slug: "carshey-motors",
            description: "Multi-brand automotive dealership",
            website: "https://carshey.ph",
            branches: {
                create: [
                    {
                        name: "Quezon City Branch",
                        address: "QC, Metro Manila",
                        phone: "0917-123-4567",
                        email: "qc@carshey.ph",
                    },
                    {
                        name: "Makati Branch",
                        address: "Makati, Metro Manila",
                        phone: "0917-234-5678",
                        email: "makati@carshey.ph",
                    },
                    {
                        name: "Cebu Branch",
                        address: "Cebu City",
                        phone: "0917-345-6789",
                        email: "cebu@carshey.ph",
                    },
                ],
            },
        },
        include: {
            branches: true,
        },
    });
    const qc = dealership.branches[0];
    const makati = dealership.branches[1];
    const cebu = dealership.branches[2];
    // ======================================================
    // 2. Categories
    // ======================================================
    const categories = await prisma.category.createMany({
        data: [
            { name: "Sedan", slug: "sedan", order: 1 },
            { name: "SUV", slug: "suv", order: 2 },
            { name: "Hatchback", slug: "hatchback", order: 3 },
            { name: "Truck", slug: "truck", order: 4 },
        ],
    });
    const sedan = await prisma.category.findUnique({ where: { slug: "sedan" } });
    const suv = await prisma.category.findUnique({ where: { slug: "suv" } });
    const hatch = await prisma.category.findUnique({ where: { slug: "hatchback" } });
    // ======================================================
    // 3. Vehicles (MEDIUM SET)
    // ======================================================
    const vehiclesData = [
        {
            brand: "Toyota",
            model: "Vios",
            year: 2024,
            variant: "1.3 XE CVT",
            cashPrice: "735000",
            downPayment: "50000",
            monthlyPayment: "13500",
            leaseTerm: 60,
            transmission: "Automatic",
            fuelType: "Gasoline",
            engineSize: "1.3L",
            horsepower: 98,
            seatingCapacity: 5,
            features: ["ABS", "Airbags", "Bluetooth"],
            specifications: { length: "4420mm", width: "1730mm" },
            description: "Reliable entry-level sedan.",
            thumbnailUrl: "/cars/vios-thumb.jpg",
            videos: [],
            availability: "Same Day Release",
            categoryId: sedan?.id,
            featured: true,
        },
        {
            brand: "Honda",
            model: "City",
            year: 2024,
            variant: "1.5 S CVT",
            cashPrice: "973000",
            downPayment: "70000",
            monthlyPayment: "16000",
            leaseTerm: 60,
            transmission: "Automatic",
            fuelType: "Gasoline",
            engineSize: "1.5L",
            horsepower: 119,
            seatingCapacity: 5,
            features: ["Cruise Control", "Hill Start Assist"],
            specifications: {},
            description: "Best-selling sedan of Honda.",
            thumbnailUrl: "/cars/city-thumb.jpg",
            videos: [],
            availability: "1 Day Release",
            categoryId: sedan?.id,
        },
        {
            brand: "Mitsubishi",
            model: "Xpander",
            year: 2024,
            variant: "GLS A/T",
            cashPrice: "1100000",
            downPayment: "80000",
            monthlyPayment: "18500",
            leaseTerm: 60,
            transmission: "Automatic",
            fuelType: "Gasoline",
            engineSize: "1.5L",
            horsepower: 103,
            seatingCapacity: 7,
            features: [],
            specifications: {},
            description: "Top-selling 7-seater MPV.",
            thumbnailUrl: "/cars/xpander-thumb.jpg",
            videos: [],
            availability: "3 Days Release",
            categoryId: suv?.id,
        },
        {
            brand: "Toyota",
            model: "Fortuner",
            year: 2024,
            variant: "2.4 G Diesel",
            cashPrice: "1900000",
            downPayment: "150000",
            monthlyPayment: "28000",
            leaseTerm: 60,
            transmission: "Automatic",
            fuelType: "Diesel",
            engineSize: "2.4L",
            horsepower: 147,
            seatingCapacity: 7,
            features: [],
            specifications: {},
            description: "Premium mid-size SUV.",
            thumbnailUrl: "/cars/fortuner-thumb.jpg",
            videos: [],
            availability: "Same Day Release",
            featured: true,
            categoryId: suv?.id,
        },
        {
            brand: "Suzuki",
            model: "Swift",
            year: 2024,
            variant: "1.2 GL CVT",
            cashPrice: "900000",
            downPayment: "60000",
            monthlyPayment: "14500",
            leaseTerm: 60,
            transmission: "Automatic",
            fuelType: "Gasoline",
            engineSize: "1.2L",
            horsepower: 82,
            seatingCapacity: 5,
            features: [],
            specifications: {},
            description: "Compact and stylish hatchback.",
            thumbnailUrl: "/cars/swift-thumb.jpg",
            videos: [],
            availability: "Same Day Release",
            categoryId: hatch?.id,
        },
        {
            brand: "Kia",
            model: "Stonic",
            year: 2024,
            variant: "EX A/T",
            cashPrice: "935000",
            downPayment: "65000",
            monthlyPayment: "15500",
            leaseTerm: 60,
            transmission: "Automatic",
            fuelType: "Gasoline",
            engineSize: "1.4L",
            horsepower: 99,
            seatingCapacity: 5,
            features: [],
            specifications: {},
            description: "Affordable compact crossover.",
            thumbnailUrl: "/cars/stonic-thumb.jpg",
            videos: [],
            availability: "Same Day Release",
            categoryId: suv?.id,
        },
        {
            brand: "Ford",
            model: "Ranger",
            year: 2024,
            variant: "2.0 XLS",
            cashPrice: "1300000",
            downPayment: "90000",
            monthlyPayment: "21000",
            leaseTerm: 60,
            transmission: "Automatic",
            fuelType: "Diesel",
            engineSize: "2.0L",
            horsepower: 170,
            seatingCapacity: 5,
            features: [],
            specifications: {},
            description: "Powerful, stylish pickup truck.",
            thumbnailUrl: "/cars/ranger-thumb.jpg",
            videos: [],
            availability: "Same Day Release",
            categoryId: suv?.id,
        },
        {
            brand: "Hyundai",
            model: "Tucson",
            year: 2024,
            variant: "2.0 GLS",
            cashPrice: "1800000",
            downPayment: "130000",
            monthlyPayment: "26000",
            leaseTerm: 60,
            transmission: "Automatic",
            fuelType: "Gasoline",
            engineSize: "2.0L",
            horsepower: 155,
            seatingCapacity: 5,
            features: [],
            specifications: {},
            description: "Modern, efficient compact SUV.",
            thumbnailUrl: "/cars/tucson-thumb.jpg",
            videos: [],
            availability: "1 Day Release",
            categoryId: suv?.id,
        },
    ];
    const createdVehicles = [];
    for (const v of vehiclesData) {
        const slug = slugify(`${v.brand}-${v.model}-${v.year}`, { lower: true });
        const vehicle = await prisma.vehicle.create({
            data: {
                ...v,
                slug,
                cashPrice: new Prisma.Decimal(v.cashPrice),
                downPayment: new Prisma.Decimal(v.downPayment),
                monthlyPayment: new Prisma.Decimal(v.monthlyPayment),
                images: {
                    create: [
                        {
                            url: v.thumbnailUrl,
                            alt: `${v.brand} ${v.model} thumbnail`,
                            type: "exterior",
                            order: 0,
                        },
                    ],
                },
            },
        });
        createdVehicles.push(vehicle);
    }
    // ======================================================
    // 4. Branch Inventory (YES)
    // ======================================================
    const allBranches = [qc, makati, cebu];
    for (const branch of allBranches) {
        for (const vehicle of createdVehicles) {
            await prisma.branchInventory.create({
                data: {
                    branchId: branch.id,
                    vehicleId: vehicle.id,
                    stock: Math.floor(Math.random() * 5) + 1,
                    price: vehicle.cashPrice,
                },
            });
        }
    }
    console.log("🌱 Seed complete!");
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed.js.map