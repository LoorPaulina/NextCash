"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type YearSelectProps = {
  years: number[];
  selectedYear: number;
};

export default function YearSelect({ years, selectedYear }: YearSelectProps) {
  const router = useRouter();

  return (
    <Select
      items={years.map((year) => ({ value: String(year), label: String(year) }))}
      value={String(selectedYear)}
      onValueChange={(value) => {
        if (value) {
          router.push(`/dashboard?year=${value}`);
        }
      }}
    >
      <SelectTrigger aria-label="Select year" className="h-10 px-3 text-base">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {years.map((year) => (
          <SelectItem key={year} value={String(year)}>
            {year}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
