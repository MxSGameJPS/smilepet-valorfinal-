"use client";

import { useState } from "react";
import Image from "next/image";

export default function PriceCalculator() {
  const [sku, setSku] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [margin, setMargin] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  const handleCalculate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          costPrice: Number(costPrice.replace(",", ".")), // Handle PT-BR comma
          marginPercent: Number(margin.replace(",", ".")),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao calcular");
      }

      setResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleCalculate}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">
            SKU do Produto
          </label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Ex: REF123"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-medium"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">
            Preço de Custo (R$)
          </label>
          <input
            type="number"
            step="0.01"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            placeholder="0,00"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-medium"
            required
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-semibold text-gray-700 mb-2">
            Margem de Lucro (%)
          </label>
          <input
            type="number"
            step="0.1"
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
            placeholder="Ex: 20"
            className="p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 font-medium"
            required
          />
        </div>

        <div className="md:col-span-3">
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 rounded-xl text-white font-bold text-lg shadow-md transition-all ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 hover:scale-[1.01]"}`}
          >
            {loading ? "Calculando..." : "Calcular Preço Sugerido"}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 font-medium rounded animate-fade-in">
          {error}
        </div>
      )}

      {result && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 shadow-sm animate-fade-in-up">
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Item Info */}
            <div className="flex-1 flex gap-4">
              {result.item.thumbnail && (
                <div className="relative w-24 h-24 flex-shrink-0">
                  <Image
                    src={result.item.thumbnail}
                    alt={result.item.title}
                    fill
                    className="object-cover rounded-md border"
                  />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {result.item.title}
                </h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full uppercase">
                    {result.item.listingType}
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 text-xs font-semibold rounded-full">
                    Categoria: {result.item.shippingMode}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Price */}
            <div className="md:text-right">
              <p className="text-sm text-gray-500 uppercase font-bold tracking-wider">
                Preço de Venda Sugerido
              </p>
              <p className="text-4xl font-extrabold text-green-600">
                {formatCurrency(result.calculation.price)}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Cenário: {result.calculation.scenario}
              </p>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="overflow-hidden border rounded-lg bg-white">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Componente
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm">
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Custo do Produto
                  </td>
                  <td className="px-6 py-4 text-right text-gray-800">
                    {formatCurrency(result.calculation.breakdown.baseCost)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {(
                      (result.calculation.breakdown.baseCost /
                        result.calculation.price) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Comissão ML ({(result.rateUsed * 100).toFixed(1)}%)
                  </td>
                  <td className="px-6 py-4 text-right text-red-600">
                    - {formatCurrency(result.calculation.breakdown.mlFee)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {(result.rateUsed * 100).toFixed(1)}%
                  </td>
                </tr>
                {result.calculation.breakdown.fixedFee > 0 && (
                  <tr>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      Taxa Fixa
                    </td>
                    <td className="px-6 py-4 text-right text-red-600">
                      - {formatCurrency(result.calculation.breakdown.fixedFee)}
                    </td>
                    <td className="px-6 py-4 text-right text-gray-500">
                      {(
                        (result.calculation.breakdown.fixedFee /
                          result.calculation.price) *
                        100
                      ).toFixed(1)}
                      %
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    Frete (Pago pelo Vendedor)
                  </td>
                  <td className="px-6 py-4 text-right text-red-600">
                    - {formatCurrency(result.calculation.breakdown.shipping)}
                  </td>
                  <td className="px-6 py-4 text-right text-gray-500">
                    {(
                      (result.calculation.breakdown.shipping /
                        result.calculation.price) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td className="px-6 py-4 font-bold text-green-900">
                    Margem de Lucro (Líquido)
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-700">
                    + {formatCurrency(result.calculation.breakdown.profit)}
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-green-700">
                    {(
                      (result.calculation.breakdown.profit /
                        result.calculation.price) *
                      100
                    ).toFixed(1)}
                    %
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
