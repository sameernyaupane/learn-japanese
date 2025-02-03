import type { ReactNode } from 'react';

export function FrequencyBadge({ code, label }: { code: string; label?: ReactNode }) {
  const getBadgeColor = (badgeCode: string) => {
    if (badgeCode.startsWith('nf')) {
      const rank = parseInt(badgeCode.replace('nf', ''));
      if (rank <= 12) return 'bg-purple-100 text-purple-800';
      if (rank <= 24) return 'bg-fuchsia-100 text-fuchsia-800';
      if (rank <= 36) return 'bg-violet-100 text-violet-800';
      return 'bg-indigo-100 text-indigo-800';
    }

    const priorityColors = {
      news1: 'bg-emerald-100 text-emerald-800',
      ichi1: 'bg-blue-100 text-blue-800',
      spec1: 'bg-orange-100 text-orange-800',
      gai1: 'bg-pink-100 text-pink-800',
      news2: 'bg-teal-100 text-teal-800',
      ichi2: 'bg-indigo-100 text-indigo-800',
      spec2: 'bg-amber-100 text-amber-800',
      gai2: 'bg-rose-100 text-rose-800',
    };

    return priorityColors[badgeCode as keyof typeof priorityColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded ${getBadgeColor(code)}`}>
      {label || 'Less Common'}
    </span>
  );
} 