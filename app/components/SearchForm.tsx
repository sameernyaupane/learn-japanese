import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Form } from '@remix-run/react';

export function SearchForm({
  initialQuery = '',
  initialFrequency = '',
}: {
  initialQuery?: string;
  initialFrequency?: string;
}) {
  return (
    <Form method="get" className="mb-6">
      <div className="flex gap-2 flex-wrap">
        <input
          type="text"
          name="q"
          defaultValue={initialQuery}
          placeholder="Search Japanese or English..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 min-w-[200px]"
        />
        <select
          name="frequency"
          defaultValue={initialFrequency}
          className="rounded-lg border border-gray-300 px-4 py-2"
        >
          <option value="">All Frequencies</option>
          <option value="news1">Very Common (News)</option>
          <option value="ichi1">Common (Ichimango)</option>
          <option value="nf01-nf12">Top 6000 Words</option>
          <option value="nf13-nf24">Next 6000 Words</option>
          <option value="uncommon">Less Common</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Search
        </button>
      </div>
    </Form>
  );
} 