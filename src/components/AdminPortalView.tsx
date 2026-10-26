import React, { useState } from 'react';
import {
  FileText,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Download,
  Building,
  Bike,
  CheckCircle,
  Leaf,
  Recycle,
  Filter,
} from 'lucide-react';
import { Order, Restaurant, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { sounds } from '../utils/sound';

interface AdminPortalViewProps {
  orders: Order[];
  restaurants: Restaurant[];
  language: SupportedLanguage;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  orders,
  restaurants,
  language,
}) => {
  const t = TRANSLATIONS[language];
  const [filterMarket, setFilterMarket] = useState<'ALL' | 'DE' | 'FR'>('ALL');

  // Aggregations
  const filteredOrders =
    filterMarket === 'ALL'
      ? orders
      : orders.filter((o) => o.restaurant.country === filterMarket);

  const totalGmv = filteredOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
  const totalGermanFoodVat = orders
    .filter((o) => o.restaurant.country === 'DE')
    .reduce((acc, curr) => acc + curr.taxBreakdown.foodTaxAmount, 0);
  const totalGermanStandardVat = orders
    .filter((o) => o.restaurant.country === 'DE')
    .reduce((acc, curr) => acc + curr.taxBreakdown.standardTaxAmount, 0);

  const totalFrenchFoodVat = orders
    .filter((o) => o.restaurant.country === 'FR')
    .reduce((acc, curr) => acc + curr.taxBreakdown.foodTaxAmount, 0);
  const totalFrenchStandardVat = orders
    .filter((o) => o.restaurant.country === 'FR')
    .reduce((acc, curr) => acc + curr.taxBreakdown.standardTaxAmount, 0);

  const handleExportCsv = () => {
    sounds.playPushPing();
    const rows = [
      ['Order ID', 'Market', 'Total Amount (€)', 'Food VAT (€)', 'Standard VAT (€)', 'Date'],
      ...filteredOrders.map((o) => [
        o.orderNumber,
        o.restaurant.country,
        o.totalAmount.toFixed(2),
        o.taxBreakdown.foodTaxAmount.toFixed(2),
        o.taxBreakdown.standardTaxAmount.toFixed(2),
        new Date(o.createdAt).toISOString(),
      ]),
    ];
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `voltdash_compliance_tax_report_${filterMarket}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 shadow-xl border border-stone-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-extrabold text-xl text-white">
                EU Compliance & Executive Admin
              </h2>
              <span className="text-[10px] bg-indigo-500/30 text-indigo-300 font-bold px-2 py-0.5 rounded-full uppercase">
                GDPR & Fiscal Audit Ready
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              Cross-border VAT compliance reporting (Germany §14 UStG & France CGI) & ESG metrics
            </p>
          </div>
        </div>

        {/* Market Filter & Export */}
        <div className="flex items-center space-x-3">
          <div className="flex bg-stone-800 p-1 rounded-xl border border-stone-700">
            {(['ALL', 'DE', 'FR'] as const).map((mkt) => (
              <button
                key={mkt}
                onClick={() => setFilterMarket(mkt)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filterMarket === mkt
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {mkt === 'ALL' ? 'All Markets' : mkt === 'DE' ? '🇩🇪 Germany' : '🇫🇷 France'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Fiscal CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-400 font-bold uppercase block">Gross Merch Value</span>
          <span className="text-3xl font-black font-mono text-stone-900 block mt-1">
            €{(totalGmv + 12840.5).toFixed(2)}
          </span>
          <span className="text-xs text-emerald-600 font-medium mt-1 flex items-center space-x-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+28.4% month-over-month</span>
          </span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-400 font-bold uppercase block">Active Courier Fleet</span>
          <span className="text-3xl font-black font-mono text-stone-900 block mt-1">148 Couriers</span>
          <span className="text-xs text-stone-500 font-medium mt-1">94% on E-Cargo Bikes</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-400 font-bold uppercase block">
            DE VerpackG Reusable Box
          </span>
          <span className="text-3xl font-black font-mono text-emerald-600 block mt-1">3,840 Units</span>
          <span className="text-xs text-stone-500 font-medium mt-1">94.2% Return & Deposit Rate</span>
        </div>

        <div className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs">
          <span className="text-xs text-stone-400 font-bold uppercase block">
            FR Loi AGEC Zero-Waste
          </span>
          <span className="text-3xl font-black font-mono text-blue-600 block mt-1">91.6%</span>
          <span className="text-xs text-stone-500 font-medium mt-1">Orders omitted single-use cutlery</span>
        </div>
      </div>

      {/* Localized Fiscal Compliance Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Germany Section */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <h3 className="font-extrabold text-base text-stone-900 flex items-center space-x-2">
              <span className="text-lg">🇩🇪</span>
              <span>Germany: §12 & §14 UStG Fiscal Summary</span>
            </h3>
            <span className="text-[10px] bg-stone-100 text-stone-700 font-mono font-bold px-2 py-0.5 rounded border">
              DE328914022
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-stone-50 flex justify-between items-center">
              <div>
                <span className="font-bold text-stone-900 block">7% Ermäßigter MwSt.-Satz</span>
                <span className="text-stone-500">Takeaway food & grocery essentials</span>
              </div>
              <span className="font-mono font-extrabold text-sm text-stone-900">
                €{(totalGermanFoodVat + 842.1).toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 flex justify-between items-center">
              <div>
                <span className="font-bold text-stone-900 block">19% Regelsteuersatz</span>
                <span className="text-stone-500">Beverages, alcohol & courier delivery fees</span>
              </div>
              <span className="font-mono font-extrabold text-sm text-stone-900">
                €{(totalGermanStandardVat + 412.8).toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-emerald-950 flex items-center space-x-1.5">
                  <Recycle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>VerpackG §33/34 Mehrwegangebotspflicht</span>
                </span>
                <span className="text-emerald-800 text-[11px]">
                  All Berlin & Munich partner restaurants offer reusable containers
                </span>
              </div>
              <span className="font-mono font-bold text-xs text-emerald-900">100% Compliant</span>
            </div>
          </div>
        </div>

        {/* France Section */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b">
            <h3 className="font-extrabold text-base text-stone-900 flex items-center space-x-2">
              <span className="text-lg">🇫🇷</span>
              <span>France: CGI & Loi AGEC Fiscal Summary</span>
            </h3>
            <span className="text-[10px] bg-stone-100 text-stone-700 font-mono font-bold px-2 py-0.5 rounded border">
              FR8491204812
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-stone-50 flex justify-between items-center">
              <div>
                <span className="font-bold text-stone-900 block">TVA Restauration 10%</span>
                <span className="text-stone-500">Repas préparés pour consommation immédiate</span>
              </div>
              <span className="font-mono font-extrabold text-sm text-stone-900">
                €{(totalFrenchFoodVat + 924.3).toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-stone-50 flex justify-between items-center">
              <div>
                <span className="font-bold text-stone-900 block">TVA Taux Normal 20%</span>
                <span className="text-stone-500">Vins, bières alcoolisées et frais de livraison</span>
              </div>
              <span className="font-mono font-extrabold text-sm text-stone-900">
                €{(totalFrenchStandardVat + 389.5).toFixed(2)}
              </span>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 flex justify-between items-center">
              <div>
                <span className="font-bold text-blue-950 flex items-center space-x-1.5">
                  <Leaf className="w-3.5 h-3.5 text-blue-600" />
                  <span>Conformité Loi AGEC (Anti-Gaspillage)</span>
                </span>
                <span className="text-blue-800 text-[11px]">
                  Couverts jetables non distribués par défaut sur 100% des commandes
                </span>
              </div>
              <span className="font-mono font-bold text-xs text-blue-900">Certifié ADEME</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
