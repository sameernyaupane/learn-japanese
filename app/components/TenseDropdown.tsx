import { TENSES } from '~/utils/conjugation/constants';
import type { Tense } from '~/utils/conjugation/constants';

interface Props {
  value: Tense;
  onChange: (value: Tense) => void;
  className?: string;
}

export default function TenseDropdown({ value, onChange, className = '' }: Props) {
  return (
    <select 
      value={value} 
      onChange={(e) => onChange(e.target.value as Tense)}
      className={`p-2 border rounded ${className}`}
    >
      {TENSES.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
} 