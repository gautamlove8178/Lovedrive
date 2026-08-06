import {
  FolderOpen,
  HardDrive,
  Upload,
  Share2,
} from "lucide-react";

import StatCard from "@/components/cards/StatCard";

export default function StorageCard() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Files"
        value="125"
        icon={FolderOpen}
      />

      <StatCard
        title="Storage Used"
        value="8.2 GB"
        icon={HardDrive}
      />

      <StatCard
        title="Uploads"
        value="68"
        icon={Upload}
      />

      <StatCard
        title="Shared Files"
        value="24"
        icon={Share2}
      />
    </div>
  );
}