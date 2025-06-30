import { drizzle } from "drizzle-orm/expo-sqlite";
import { currencies, expenseCategories } from "./schema";

export async function seedDatabase(db: ReturnType<typeof drizzle>) {
  await seedCurrencies(db);
  await seedExpenseCategories(db);
}

async function seedCurrencies(db: ReturnType<typeof drizzle>) {
  const existing = await db.select().from(currencies).limit(1);
  if (existing.length > 0) return;

  await db.insert(currencies).values([
    { code: "USD", description: "US Dollar", symbol: "$" },
    { code: "EUR", description: "Euro", symbol: "€" },
    { code: "BDT", description: "Bangladeshi Taka", symbol: "৳" },
    { code: "GBP", description: "British Pound", symbol: "£" },
    { code: "JPY", description: "Japanese Yen", symbol: "¥" },
    { code: "AUD", description: "Australian Dollar", symbol: "A$" },
    { code: "CAD", description: "Canadian Dollar", symbol: "C$" },
    { code: "CHF", description: "Swiss Franc", symbol: "CHF" },
    { code: "CNY", description: "Chinese Yuan", symbol: "¥" },
    { code: "INR", description: "Indian Rupee", symbol: "₹" },
  ]);
}

async function seedExpenseCategories(db: ReturnType<typeof drizzle>) {
  const existing = await db.select().from(expenseCategories).limit(1);
  if (existing.length > 0) return;

  const cats = [
    {
      name: "Food",
      children: [
        { name: "Breakfast" },
        { name: "Lunch" },
        { name: "Dinner" },
        { name: "Snack" },
        { name: "Fruit" },
        { name: "Ingredients" },
      ],
    },

    {
      name: "Clothing/Beauty",
      children: [
        { name: "Shirt" },
        { name: "Pants" },
        { name: "Jacket" },
        { name: "Shoes" },
        { name: "Bag" },
        { name: "Accessories" },
        { name: "Haircut" },
        { name: "Cosmetics" },
      ],
    },
    {
      name: "Living",
      children: [
        { name: "Furniture" },
        { name: "Appliances" },
        { name: "Rent" },
        { name: "Management Fees" },
        { name: "Water" },
        { name: "Electricity" },
        { name: "Gas" },
        { name: "Cable TV" },
        { name: "Internet" },
      ],
    },
    {
      name: "Transportation",
      children: [
        { name: "Bus" },
        { name: "Subway" },
        { name: "Taxi" },
        { name: "High Speed Rail" },
        { name: "Airplane" },
      ],
    },
    {
      name: "Education",
      children: [
        { name: "Stationary" },
        { name: "Tutoring Fee" },
        { name: "Tution" },
      ],
    },
    {
      name: "Entertainment",
      children: [
        { name: "Mobile" },
        { name: "Toys" },
        { name: "Tarvel" },
        { name: "Shopping" },
      ],
    },
    {
      name: "Personal 3C",
      children: [
        { name: "Telephone" },
        { name: "PC Related" },
        { name: "Cell Phone" },
        { name: "Camera" },
      ],
    },
    {
      name: "Publications",
      children: [
        { name: "Books" },
        { name: "Newspaper" },
        { name: "Magazine" },
      ],
    },
    {
      name: "Medical",
      children: [
        { name: "Medical fee" },
        { name: "Drugs" },
        { name: "Physical Checkup" },
        { name: "Health Insurance" },
      ],
    },
    {
      name: "Social",
      children: [
        { name: "Gifts" },
        { name: "Social Activities" },
        { name: "Wedding" },
        { name: "Funeral" },
      ],
    },
    {
      name: "Others",
      children: [
        { name: "Pet" },
        { name: "Lending Money" },
        { name: "Charity" },
        { name: "Incidental Expenses" },
      ],
    },
    { name: "Fee", children: [{ name: "Transfer Fee", parentId: 12 }] },
  ];

  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    const ids = await db
      .insert(expenseCategories)
      .values({
        name: cat.name,
        parentId: null,
      })
      .returning({ id: expenseCategories.id });

    const parentId = ids[0].id;

    for (let j = 0; j < cat.children.length; j++) {
      await db.insert(expenseCategories).values({
        name: cat.children[j].name,
        parentId: parentId,
      });
    }
  }
}
