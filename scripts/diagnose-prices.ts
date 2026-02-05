import { getValidAccessToken } from "@/lib/auth";
import fs from "fs";
import path from "path";

// Load .env.local manually
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (e) {
  console.log("Could not load .env.local");
}

const BASE_URL = "https://api.mercadolibre.com";

async function diagnose() {
  const itemId = "MLB4323315483"; // ID do item problemático do usuário
  const accessToken = await getValidAccessToken();

  if (!accessToken) {
    console.error("No access token available");
    return;
  }

  console.log(`Diagnosing item: ${itemId}`);

  // 1. Get Item Details (Standard)
  console.log("\n--- Standard Item Details ---");
  const resItem = await fetch(
    `${BASE_URL}/items/${itemId}?include_attributes=all`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  );
  const item = await resItem.json();
  console.log("Status:", item.status);
  console.log("Sub-status:", item.sub_status);
  console.log("Tags:", item.tags);
  console.log("Catalog Listing:", item.catalog_listing);
  console.log("Price:", item.price);
  console.log("Base Price:", item.base_price);
  console.log("Currency:", item.currency_id);
  if (item.variations) {
    console.log("Variations Count:", item.variations.length);
    item.variations.forEach((v: any) => {
      console.log(` - Variation ${v.id}: Price ${v.price}`);
    });
  }

  // 2. Get Prices Endpoint (if exists/accessible)
  console.log("\n--- Prices Endpoint (/items/{id}/prices) ---");
  const resPrices = await fetch(`${BASE_URL}/items/${itemId}/prices`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (resPrices.ok) {
    const pricesData = await resPrices.json();
    console.log(JSON.stringify(pricesData, null, 2));
  } else {
    console.log(
      "Failed to fetch prices endpoint:",
      resPrices.status,
      await resPrices.text(),
    );
  }
}

diagnose();
