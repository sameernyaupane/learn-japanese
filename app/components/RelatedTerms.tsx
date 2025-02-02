import { ArrowRightIcon } from '@heroicons/react/24/outline';

export function RelatedTerms({ xref }: { xref: string }) {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex items-center gap-2 text-xs text-blue-600">
        <ArrowRightIcon className="h-3 w-3" />
        <span>Related: {xref}</span>
      </div>
    </div>
  );
} 