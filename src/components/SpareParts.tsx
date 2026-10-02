import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { SparePart, Availability } from '@/types';
import { Loader2, Search, X, Package, Truck } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

const EQUIPMENT_TYPES = [
  'Tractor',
  'Sprayer',
  'Tiller',
  'Harvester',
  'Pump',
  'Planter',
  'Weeder',
  'Other',
];

const AVAILABILITY_STYLES: Record<Availability, string> = {
  'In Stock': 'bg-green-100 text-green-700',
  'Low Stock': 'bg-amber-100 text-amber-700',
  'Out of Stock': 'bg-red-100 text-red-700',
};

interface Props {
  onClose: () => void;
  initialEquipmentFilter?: string;
}

export default function SpareParts({ onClose, initialEquipmentFilter }: Props) {
  const { t } = useLanguage();
  const [parts, setParts] = useState<SparePart[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState<string>(initialEquipmentFilter || 'All');

  const loadParts = useCallback(async () => {
    const { data, error } = await supabase
      .from('spare_parts')
      .select('*')
      .order('part_name', { ascending: true });

    if (error) {
      console.error('Error loading spare parts:', error);
      return;
    }
    setParts((data || []) as SparePart[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadParts();
  }, [loadParts]);

  const filtered = parts.filter((p) => {
    const matchesEquipment =
      equipmentFilter === 'All' || p.compatible_equipment === equipmentFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      p.part_name.toLowerCase().includes(q) ||
      p.supplier_name.toLowerCase().includes(q);
    return matchesEquipment && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-stone-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-stone-100 text-stone-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-stone-900">{t('parts.title')}</h3>
              <p className="text-xs text-stone-500">{t('parts.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg p-1.5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('parts.search')}
              className="w-full rounded-lg border border-stone-300 pl-10 pr-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent transition"
            />
          </div>

          {/* Equipment filter chips */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setEquipmentFilter('All')}
              className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                equipmentFilter === 'All'
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {t('parts.all')}
            </button>
            {EQUIPMENT_TYPES.map((eq) => (
              <button
                key={eq}
                onClick={() => setEquipmentFilter(eq)}
                className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors ${
                  equipmentFilter === eq
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {t(`eq.${eq}`)}
              </button>
            ))}
          </div>

          {/* Parts list */}
          {loading ? (
            <div className="flex items-center justify-center py-12 text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-100 text-stone-400 mb-3">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-sm text-stone-500">{t('parts.noParts')}</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((part) => (
                <div
                  key={part.id}
                  className="flex items-start justify-between gap-3 rounded-xl border border-stone-100 p-4 hover:border-stone-200 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-stone-900 text-sm">{part.part_name}</h4>
                      <span className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                        {t(`eq.${part.compatible_equipment}`)}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-500">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5 text-stone-400" />
                        {part.supplier_name}
                      </span>
                      <span className="text-stone-600 font-medium">
                        ₹{part.price.toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap ${AVAILABILITY_STYLES[part.availability]}`}
                  >
                    {t(`avail.${part.availability}`)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
