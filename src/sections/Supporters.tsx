import { useState, useEffect } from 'react';
import type { Supporter } from '../types';

export function Supporters() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);

  useEffect(() => {
    const fetchSupporters = async () => {
      try {
        const res = await fetch('/.netlify/functions/get-supporters');
        const data = await res.json();
        if (data.supporters && data.supporters.length > 0) {
          setSupporters(data.supporters);
        }
      } catch (err) {
        console.error('Failed to fetch supporters:', err);
      }
    };
    fetchSupporters();
  }, []);

  if (supporters.length === 0) return null;

  const goldSupporters = supporters.filter(s => s.level === 'gold');
  const silverSupporters = supporters.filter(s => s.level === 'silver');
  const bronzeSupporters = supporters.filter(s => s.level === 'bronze');

  const levelConfig = {
    gold: {
      label: 'Gold Supporters',
      logoSize: 'h-24 sm:h-28 md:h-32',
      color: 'text-yellow-600',
      borderColor: 'border-yellow-300',
      bgColor: 'bg-yellow-50',
    },
    silver: {
      label: 'Silver Supporters',
      logoSize: 'h-18 sm:h-20 md:h-24',
      color: 'text-gray-500',
      borderColor: 'border-gray-300',
      bgColor: 'bg-gray-50',
    },
    bronze: {
      label: 'Bronze Supporters',
      logoSize: 'h-14 sm:h-16 md:h-20',
      color: 'text-amber-700',
      borderColor: 'border-amber-300',
      bgColor: 'bg-amber-50/50',
    },
  };

  const renderGroup = (items: Supporter[], level: 'gold' | 'silver' | 'bronze') => {
    if (items.length === 0) return null;
    const config = levelConfig[level];
    const rows: Supporter[][] = [];
    for (let i = 0; i < items.length; i += 3) {
      rows.push(items.slice(i, i + 3));
    }
    return (
      <div className="mb-8 last:mb-0">
        <h3 className={`text-sm font-semibold uppercase tracking-wider ${config.color} text-center mb-6`}>
          {config.label}
        </h3>
        <div className="flex flex-col items-center gap-6 md:gap-8">
          {rows.map((row, idx) => (
            <div
              key={idx}
              className={`grid items-center justify-items-center gap-6 md:gap-8 w-full max-w-4xl mx-auto ${
                row.length === 1
                  ? 'grid-cols-1'
                  : row.length === 2
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3'
              }`}
            >
              {row.map((supporter) => (
                <a
                  key={supporter.id}
                  href={supporter.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={supporter.name}
                  className="group block p-4 transition-all duration-300 hover:-translate-y-1"
                >
                  <img
                    src={`/.netlify/functions/get-supporter-logo?key=${encodeURIComponent(supporter.logoKey)}`}
                    alt={supporter.name}
                    className={`${config.logoSize} w-auto object-contain opacity-80 group-hover:opacity-100 transition-opacity`}
                  />
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section id="supporters" className="py-16 sm:py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            <span className="gradient-text">Our Supporters</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We are grateful to the businesses and organisations that have contributed to making this festival possible.
          </p>
        </div>

        {renderGroup(goldSupporters, 'gold')}
        {renderGroup(silverSupporters, 'silver')}
        {renderGroup(bronzeSupporters, 'bronze')}
      </div>
    </section>
  );
}
