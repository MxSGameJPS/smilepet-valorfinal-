import { query } from "../lib/db";

async function createTable() {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS valorideal (
      id SERIAL PRIMARY KEY,
      sku_mlb TEXT NOT NULL,
      valor_atual NUMERIC,
      tipo_anuncio TEXT,
      tipo_envio TEXT,
      preco_custo NUMERIC,
      margem_lucro NUMERIC,
      comissao_ml NUMERIC,
      valor_frete NUMERIC,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  try {
    await query(createTableQuery);
    console.log("Table 'valorideal' created successfully.");
  } catch (err) {
    console.error("Error creating table:", err);
  } finally {
    process.exit();
  }
}

createTable();
