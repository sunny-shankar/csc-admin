import { REPORT_STATUSES } from '@/lib/constants';
import { reportStatusLabel } from '@/lib/statusLabels';
import type { ReportStatus } from '@/lib/types';
import { FilterSelect, Select } from '@/components/ui/Input';
import type { SelectHTMLAttributes } from 'react';

interface ReportStatusSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  allowEmpty?: boolean;
  emptyLabel?: string;
  exclude?: ReportStatus[];
  /** Use compact toolbar styling */
  filter?: boolean;
}

export function ReportStatusSelect({
  allowEmpty = false,
  emptyLabel = 'All statuses',
  exclude = [],
  filter = false,
  className,
  ...props
}: ReportStatusSelectProps) {
  const options = REPORT_STATUSES.filter((s) => !exclude.includes(s));
  const SelectComponent = filter ? FilterSelect : Select;

  return (
    <SelectComponent className={className} {...props}>
      {allowEmpty ? <option value="">{emptyLabel}</option> : null}
      {options.map((s) => (
        <option key={s} value={s}>
          {reportStatusLabel(s)}
        </option>
      ))}
    </SelectComponent>
  );
}
