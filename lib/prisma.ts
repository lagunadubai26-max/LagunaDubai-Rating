import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

type CafeRow = {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  coverImage: string | null;
  createdAt: Date;
  reviews: ReviewRow[];
  _count: { reviews: number };
};

type ReviewRow = {
  id: string;
  cafeId: string;
  reviewerName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
};

const demoCafeId = "demo-cafe-1";

const demoCafe: Omit<CafeRow, "reviews" | "_count"> = {
  id: demoCafeId,
  name: "ميت غمر أسفل كوبرى زفتى",
  description: "رأيك يهمنا، خبيّرنا عن تجربتك.",
  address: "ميت غمر — أسفل كوبرى زفتى",
  coverImage: null,
  createdAt: new Date(),
};

const demoReviews: ReviewRow[] = [
  {
    id: "demo-r1",
    cafeId: demoCafeId,
    reviewerName: "سارة",
    rating: 5,
    comment: "قهوة الـ latte ممتازة والجو قدام البحر تحفة بصراحة.",
    createdAt: new Date("2026-08-05T10:30:00Z"),
  },
  {
    id: "demo-r2",
    cafeId: demoCafeId,
    reviewerName: "أحمد",
    rating: 4,
    comment: "المكان هادي وجميل، الكابتشينو جامد بس شوية زحمة فالساعة 6.",
    createdAt: new Date("2026-08-06T15:45:00Z"),
  },
  {
    id: "demo-r3",
    cafeId: demoCafeId,
    reviewerName: "نور",
    rating: 5,
    comment: "الغروب من هنا أسطورة. القهوة المثلجة لازم تجربها.",
    createdAt: new Date("2026-08-02T19:00:00Z"),
  },
  {
    id: "demo-r4",
    cafeId: demoCafeId,
    reviewerName: "عمر",
    rating: 3,
    comment: "القهوة كويسة بس الأسعار غالية شوية مقارنة بالكافيهات التانية.",
    createdAt: new Date("2026-08-03T13:20:00Z"),
  },
];

function recentReviews() {
  return [...demoReviews].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

function createDemoPrisma(): PrismaClient {
  return {
    cafe: {
      findFirst: async () => ({
        ...demoCafe,
        reviews: [...demoReviews].sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        ),
        _count: { reviews: demoReviews.length },
      }),
    },
    review: {
      findMany: async () => recentReviews(),
      create: async ({ data }: { data: ReviewRow }) => {
        const created: ReviewRow = {
          id: "demo-r" + (demoReviews.length + 1),
          cafeId: demoCafeId,
          reviewerName: data.reviewerName,
          rating: data.rating,
          comment: data.comment,
          createdAt: new Date(),
        };
        demoReviews.push(created);
        return created;
      },
    },
  } as unknown as PrismaClient;
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  });
  return new PrismaClient({ adapter });
}

const isDemoMode =
  process.env.DEMO_MODE === "1" && process.env.NODE_ENV !== "production";

export const prisma = globalForPrisma.prisma ?? (isDemoMode ? createDemoPrisma() : createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}