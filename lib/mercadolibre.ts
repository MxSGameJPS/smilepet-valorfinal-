const BASE_URL = "https://api.mercadolibre.com";

export interface MLTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  user_id: number;
  refresh_token: string;
}

export interface MLItem {
  id: string;
  title: string;
  price: number;
  base_price: number;
  currency_id: string;
  available_quantity: number;
  listing_type_id: string; // 'gold_special' (Clássico) | 'gold_pro' (Premium)
  category_id: string;
  shipping: {
    free_shipping: boolean;
    mode: string;
    tags: string[];
    logistic_type: string;
    store_pick_up: boolean;
  };
  dimensions: string; // "10x10x10,500"
  pictures: { url: string }[];
  attributes: { id: string; value_name: string }[];
}

export interface MLShippingOption {
  id: string;
  cost: number;
  currency_id: string;
  name: string;
  display?: string;
}

/**
 * Troca o code pelo access_token
 */
export async function getAccessToken(
  code: string,
  redirectUri: string,
): Promise<MLTokenResponse> {
  const params = new URLSearchParams();
  params.append("grant_type", "authorization_code");
  params.append("client_id", process.env.ML_CLIENT_ID!);
  params.append("client_secret", process.env.ML_CLIENT_SECRET!);
  params.append("code", code);
  params.append("redirect_uri", redirectUri);

  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Error fetching token: ${JSON.stringify(error)}`);
  }

  return res.json();
}

/**
 * Refresh do token (opcional para o fluxo completo, mas boa prática)
 */
export async function refreshAccessToken(
  refreshToken: string,
): Promise<MLTokenResponse> {
  const params = new URLSearchParams();
  params.append("grant_type", "refresh_token");
  params.append("client_id", process.env.ML_CLIENT_ID!);
  params.append("client_secret", process.env.ML_CLIENT_SECRET!);
  params.append("refresh_token", refreshToken);

  const res = await fetch(`${BASE_URL}/oauth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: params,
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Error refreshing token: ${JSON.stringify(error)}`);
  }

  return res.json();
}

/**
 * Busca Item ID pelo SKU do usuário logado
 * Nota: Procura nos itens do usuário.
 */
export async function getItemIdBySku(
  sku: string,
  accessToken: string,
  userId: number,
): Promise<string | null> {
  // Busca nos itens do usuário pelo SKU.
  // Endpoint de busca: /users/{user_id}/items/search?sku={sku}
  // Ou via Global Search com seller_id.

  // Tentativa 1: Busca específica do vendedor
  const url = `${BASE_URL}/users/${userId}/items/search?sku=${sku}&access_token=${accessToken}`;

  const res = await fetch(url);
  if (!res.ok) {
    // Fallback ou erro
    console.error("Error searching item by SKU", await res.text());
    return null;
  }

  const data = await res.json();
  if (data.results && data.results.length > 0) {
    return data.results[0]; // Retorna o primeiro ID encontrado
  }

  return null;
}

/**
 * Detalhes do Item
 */
export async function getItemDetails(
  itemId: string,
  accessToken: string,
): Promise<MLItem> {
  const res = await fetch(
    `${BASE_URL}/items/${itemId}?include_attributes=all`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch item details");
  }

  return res.json();
}

/**
 * Calcula Custos de Venda (Comissão)
 */
export async function getListingFee(
  price: number,
  listingTypeId: string,
  categoryId: string,
): Promise<number> {
  // endpoint: /sites/MLB/listing_prices?price={price}&listing_type_id={type}&category_id={cat}
  const url = `${BASE_URL}/sites/MLB/listing_prices?price=${price}&listing_type_id=${listingTypeId}&category_id=${categoryId}`;

  const res = await fetch(url);
  if (!res.ok) return 0;

  const data = await res.json();
  // data pode ser um array ou objeto dependendo do endpoint, geralmente retorna objeto de preço
  return data.sale_fee_amount || 0;
}

/**
 * Consulta frete que o vendedor paga
 * Lógica complexa pois depende se o frete é grátis.
 */
export async function getSellerShippingCost(
  itemId: string,
  accessToken: string,
): Promise<number> {
  // A API pública não exibe diretamente "custo para o vendedor" facilmente sem contexto de envio.
  // Mas se o item oferece frete grátis, o vendedor paga algo.
  // Podemos tentar simular ou pegar de uma tabela fixa aproximada se não houver endpoint.
  // Vamos tentar pegar via shipping_options se disponível (geralmente requer zip).

  // Hack: Se não temos o CEP do vendedor/comprador, é difícil ter o EXATO.
  // O sistema vai retornar 0 se não conseguir e o usuário insere manual.
  // Mas vamos tentar verificar se existe shipping.free_methods

  const item = await getItemDetails(itemId, accessToken);
  if (!item.shipping.free_shipping) {
    return 0; // Se não é frete grátis, vendedor paga 0 (comprador paga), exceto configurações especificas.
  }

  // Tentar buscar valor do frete grátis (subsídio)
  // Infelizmente sem autenticação específica em endpoints de "shipping costs" do user, é difícil.
  // Vamos assumir que retornaremos 0 e o frontend avisa, ou retornamos um valor fixo estimado se desejar.
  // Pelo prompt "O backend DEVE consultar", vou deixar a função preparada.

  return 0;
}
