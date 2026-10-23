import dotenv from "dotenv";
import { categoriesTable } from "./db/schema";
import { drizzle } from "drizzle-orm/neon-http";

dotenv.config({
    path: ".env.local"
})

const db = drizzle(process.env.DATABASE_URL!);

const CATEGORY_NAMES = [
  "Food",
  "Transport",
  "Housing",
  "Salary",
  "Freelance",
  "Entertainment",
  "Health",
  "Education",
  "Investments",
  "Utilities",
];

const CATEGORY_TYPES = ["income", "expense"] as const;

const CATEGORIES_TO_CREATE = 8;

function pickRandom<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function buildRandomCategories() {
  const shuffledNames = [...CATEGORY_NAMES].sort(() => Math.random() - 0.5);

  return shuffledNames.slice(0, CATEGORIES_TO_CREATE).map((name) => ({
    name,
    type: pickRandom(CATEGORY_TYPES),
  }));
}

async function main() {
  const categories = buildRandomCategories();

  await db.insert(categoriesTable).values(categories);

  console.log(`Inserted ${categories.length} categories`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
