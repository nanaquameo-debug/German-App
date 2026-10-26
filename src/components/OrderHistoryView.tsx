import React, { useState } from 'react';
import {
  Clock,
  FileText,
  RotateCcw,
  CheckCircle,
  Truck,
  Star,
  Printer,
  X,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { Order, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { formatCurrency } from '../utils/tax';

interface OrderHistoryViewProps {
  orders: Order[];
  language: SupportedLanguage;
  onReorder: (order: Order) => void;
  onTrackOrder: (order: Order) => void;
  onRateOrder: (order: Order) => void;
}

export const OrderHistoryView: React.FC<OrderHistoryViewProps> = ({
  orders,
  language,
  onReorder,
  onTrackOrder,
  onRateOrder,
}) => {
  const t = TRANSLATIONS[language];
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            {t.pastOrders}
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Access compliant tax receipts, track active orders, or reorder your favorite meals
          </p>
        </div>
        <span className="px-3 py-1 bg-stone-100 text-stone-700 font-mono text-xs font-bold rounded-full border border-stone-200">
          {orders.length} {orders.length === 1 ? 'Order' : 'Orders'}
        </span>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-xs">
          <Clock className="w-12 h-12 text-stone-300 mx-auto mb-3" />
          <h3 className="font-bold text-stone-800 text-base">No orders yet</h3>
          <p className="text-xs text-stone-500 mt-1">
            Place your first order from local restaurants to see your history here!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div
              key={ord.id}
              className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 font-bold flex items-center justify-center">
                    🍔
                  </div>
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base">{ord.restaurant.name}</h3>
                    <p className="text-xs text-stone-500">
                      {ord.orderNumber} • {new Date(ord.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold capitalize flex items-center space-x-1.5 ${
                      ord.status === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800 animate-pulse'
                    }`}
                  >
                    {ord.status === 'delivered' ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Truck className="w-3.5 h-3.5 text-amber-600" />
                    )}
                    <span>{ord.status.replace('_', ' ')}</span>
                  </span>

                  <span className="font-mono font-extrabold text-base text-stone-900 ml-2">
                    €{ord.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Items summary */}
              <div className="py-3 text-xs text-stone-600 space-y-1">
                {ord.items.map((it) => (
                  <div key={it.cartItemId} className="flex justify-between">
                    <span>
                      {it.quantity}x {it.menuItem.name}
                    </span>
                    <span className="font-mono text-stone-800">€{it.itemSubtotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  {/* Official VAT Receipt Button */}
                  <button
                    onClick={() => setSelectedInvoiceOrder(ord)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                    aria-label={`View VAT tax receipt for order ${ord.orderNumber}`}
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{t.viewInvoice}</span>
                  </button>

                  {/* Reorder Button */}
                  <button
                    onClick={() => onReorder(ord)}
                    className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                    aria-label={`Reorder items from ${ord.restaurant.name}`}
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{t.reorder}</span>
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  {ord.status !== 'delivered' ? (
                    <button
                      onClick={() => onTrackOrder(ord)}
                      className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <Truck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Track Live Delivery</span>
                    </button>
                  ) : ord.driverRating ? (
                    <span className="text-xs bg-amber-50 text-amber-900 border border-amber-200 px-3 py-1.5 rounded-xl font-medium flex items-center space-x-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                      <span>Rated: {ord.driverRating.stars}.0 Stars</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => onRateOrder(ord)}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 text-xs font-bold rounded-xl flex items-center space-x-1 transition-colors cursor-pointer shadow-xs"
                    >
                      <Star className="w-3.5 h-3.5" />
                      <span>Rate Driver</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Tax Invoice / Receipt Modal */}
      {selectedInvoiceOrder && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            {/* Invoice Top Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-xl tracking-tight text-stone-900">VoltDash</span>
                  <span className="text-[10px] font-mono bg-stone-100 text-stone-700 font-bold px-1.5 py-0.5 rounded border">
                    {selectedInvoiceOrder.restaurant.country === 'DE' ? 'DE §14 UStG' : 'FR Code Général Impôts'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  VoltDash Logistics Europe B.V. &bull; VAT ID:{' '}
                  {selectedInvoiceOrder.restaurant.country === 'DE'
                    ? 'DE328914022'
                    : 'FR8491204812'}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                  title="Print invoice"
                >
                  <Printer className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedInvoiceOrder(null)}
                  className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Bill To & Order metadata */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-stone-400 font-bold uppercase block text-[10px]">
                  Restaurant Merchant
                </span>
                <p className="font-bold text-stone-900">{selectedInvoiceOrder.restaurant.name}</p>
                <p className="text-stone-600">{selectedInvoiceOrder.restaurant.address}</p>
              </div>
              <div className="text-right">
                <span className="text-stone-400 font-bold uppercase block text-[10px]">
                  Tax Invoice
                </span>
                <p className="font-mono font-bold text-stone-900">{selectedInvoiceOrder.orderNumber}</p>
                <p className="text-stone-500">
                  {new Date(selectedInvoiceOrder.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Itemized Table */}
            <div className="border rounded-2xl overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead className="bg-stone-50 text-stone-700 font-semibold border-b">
                  <tr>
                    <th className="p-3">Pos.</th>
                    <th className="p-3">Description</th>
                    <th className="p-3 text-right">Tax Rate</th>
                    <th className="p-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {selectedInvoiceOrder.items.map((it, idx) => (
                    <tr key={it.cartItemId}>
                      <td className="p-3 font-mono">{idx + 1}</td>
                      <td className="p-3 font-medium text-stone-900">
                        {it.quantity}x {it.menuItem.name}
                      </td>
                      <td className="p-3 text-right font-mono text-stone-500">
                        {it.menuItem.taxCategory === 'beverage_alcohol'
                          ? selectedInvoiceOrder.restaurant.country === 'DE'
                            ? '19%'
                            : '20%'
                          : selectedInvoiceOrder.restaurant.country === 'DE'
                          ? '7%'
                          : '10%'}
                      </td>
                      <td className="p-3 text-right font-mono font-semibold text-stone-900">
                        €{it.itemSubtotal.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="p-3 font-mono">-</td>
                    <td className="p-3 font-medium text-stone-900">Express Courier Delivery Fee</td>
                    <td className="p-3 text-right font-mono text-stone-500">
                      {selectedInvoiceOrder.restaurant.country === 'DE' ? '19%' : '20%'}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-stone-900">
                      €{selectedInvoiceOrder.deliveryFee.toFixed(2)}
                    </td>
                  </tr>
                  {selectedInvoiceOrder.mehrwegPackagingFee > 0 && (
                    <tr className="bg-emerald-50/50">
                      <td className="p-3 font-mono">-</td>
                      <td className="p-3 font-medium text-emerald-900">
                        Mehrwegbehälter-Pfand (§33 VerpackG refundable)
                      </td>
                      <td className="p-3 text-right font-mono text-emerald-700">0% (Deposit)</td>
                      <td className="p-3 text-right font-mono font-semibold text-emerald-900">
                        +€{selectedInvoiceOrder.mehrwegPackagingFee.toFixed(2)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Tax Compliance Details Box */}
            <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
              <div className="flex justify-between font-bold text-stone-900">
                <span>{selectedInvoiceOrder.taxBreakdown.taxLabel}</span>
                <span className="font-mono">
                  €{selectedInvoiceOrder.taxBreakdown.totalTax.toFixed(2)}
                </span>
              </div>
              {selectedInvoiceOrder.taxBreakdown.complianceNotes.map((note, i) => (
                <p key={i} className="text-[11px] text-stone-500">
                  &bull; {note}
                </p>
              ))}
            </div>

            {/* Grand Total */}
            <div className="pt-2 border-t flex justify-between items-center">
              <div>
                <span className="text-xs text-stone-500 font-semibold">Total Paid (EUR)</span>
                <p className="text-[11px] text-stone-400">
                  Payment via {selectedInvoiceOrder.payment.method} &bull; Auth: 3D Secure 2.0
                </p>
              </div>
              <div className="text-2xl font-black font-mono text-stone-900">
                €{selectedInvoiceOrder.totalAmount.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
