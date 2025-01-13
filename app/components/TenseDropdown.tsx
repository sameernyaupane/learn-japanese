import type { Tense } from '~/utils/conjugation/types';

interface Props {
  value: Tense;
  onChange: (value: Tense) => void;
  className?: string;
}

const tenseOptions = [
  { value: 'simple-present', label: 'Simple Present' },
  { value: 'present-continuous', label: 'Present Continuous' },
  { value: 'present-perfect', label: 'Present Perfect' },
  { value: 'simple-past', label: 'Simple Past' },
  { value: 'past-continuous', label: 'Past Continuous' },
  { value: 'past-perfect', label: 'Past Perfect' },
  { value: 'simple-future', label: 'Simple Future' }
] as const;

export default function TenseDropdown({ value, onChange, className = '' }: Props) {
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value as Tense)}
      className={`p-2 border rounded ${className}`}
    >
      {tenseOptions.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
} 