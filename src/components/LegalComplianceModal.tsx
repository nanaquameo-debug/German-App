import React from 'react';
import { X, ShieldCheck, Scale, FileText, Globe } from 'lucide-react';
import { SupportedCountry, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface LegalComplianceModalProps {
  isOpen: boolean;
  onClose: () => void;
  country: SupportedCountry;
  language: SupportedLanguage;
}

export const LegalComplianceModal: React.FC<LegalComplianceModalProps> = ({
  isOpen,
  onClose,
  country,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto text-xs text-stone-700">
        <div className="flex items-center justify-between pb-3 border-b">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-stone-900 text-white flex items-center justify-center font-bold">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-stone-900">
                {country === 'DE' ? 'Impressum & Rechtliche Hinweise (§5 TMG)' : 'Mentions Légales & Conformité Réglementaire'}
              </h3>
              <p className="text-[11px] text-stone-500">
                VoltDash Logistics Europe B.V. &bull; Operating in Germany & France
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Germany Section */}
        <div className="space-y-3">
          <h4 className="font-bold text-sm text-stone-900 flex items-center space-x-1.5 text-amber-700">
            <span>🇩🇪</span>
            <span>Angaben gemäß § 5 TMG (Deutschland)</span>
          </h4>
          <p>
            <strong>VoltDash Europe Technologies B.V.</strong> (Zweigniederlassung Deutschland)<br />
            Friedrichstraße 176, 10117 Berlin, Deutschland<br />
            Handelsregister: Amtsgericht Charlottenburg (Berlin), HRB 241908 B<br />
            USt-IdNr. gemäß § 27 a UStG: <strong>DE328914022</strong><br />
            Vertreten durch die Geschäftsführung: Dr. Marcus Weber, Elena Bonnet
          </p>
          <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
            <h5 className="font-bold text-stone-900">Mehrwegangebotspflicht (§§ 33, 34 VerpackG)</h5>
            <p className="text-stone-600">
              Seit dem 1. Januar 2023 sind Letztvertreiber von Einweg-Lebensmittelverpackungen gesetzlich verpflichtet, dem Endverbraucher eine Mehrwegalternative anzubieten. VoltDash stellt allen Partnerbetrieben genormte, lebensmittelechte Mehrwegbehälter mit einem Pfandbetrag von 1,50 € je Behälter zur Verfügung. Die Rückgabe ist bei jedem teilnehmenden Partner oder bei der nächsten Kurierlieferung möglich.
            </p>
          </div>
        </div>

        {/* France Section */}
        <div className="pt-4 border-t space-y-3">
          <h4 className="font-bold text-sm text-stone-900 flex items-center space-x-1.5 text-blue-700">
            <span>🇫🇷</span>
            <span>Mentions Légales & Loi AGEC (France)</span>
          </h4>
          <p>
            <strong>VoltDash France SAS</strong><br />
            14 Rue de la Paix, 75002 Paris, France<br />
            RCS Paris B 849 120 481 &bull; Numéro de TVA intracommunautaire : <strong>FR8491204812</strong><br />
            Capital social : 500 000 € &bull; Contact : support-fr@voltdash.eu
          </p>
          <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1">
            <h5 className="font-bold text-blue-950">Dispositions Loi AGEC (Lutte contre le gaspillage et économie circulaire)</h5>
            <p className="text-blue-900">
              Conformément à la Loi n° 2020-105 du 10 février 2020 relative à la lutte contre le gaspillage et à l’économie circulaire (Loi AGEC), VoltDash n’inclut aucun couvert ou serviette jetable par défaut dans les commandes. Les clients doivent obligatoirement cocher la case d’opt-in préalable lors du panier s’ils souhaitent obtenir des couverts compostables.
            </p>
          </div>
        </div>

        {/* GDPR Notice */}
        <div className="pt-4 border-t text-stone-500 text-[11px] space-y-1">
          <p>
            <strong>RGPD / GDPR Compliance:</strong> All telemetry coordinates and GPS courier pings are strictly processed on EU cloud nodes in accordance with Regulation (EU) 2016/679. Delivery tracking coordinates are purged after order completion.
          </p>
        </div>
      </div>
    </div>
  );
};
