import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SortProps {
  value: string;
  onChange: (value: string) => void;
}

export const ListingSort = ({ value, onChange }: SortProps) => {
  return (
    <div className="flex items-center gap-2 mb-6">
      <Label htmlFor="sort">Sort by:</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="sort" className="w-[200px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest First</SelectItem>
          <SelectItem value="oldest">Oldest First</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
