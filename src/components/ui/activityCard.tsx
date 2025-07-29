import Image from "next/image";
import { ActivityItem } from "@/hooks/useSupabase";

export default function ActivityCard({ activity }: { activity: ActivityItem }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl shadow-lg bg-zinc-900 transition-all hover:scale-[0.98] border border-transparent hover:border-amber-400/30">
      {activity.image_url ? (
        <Image
          src={activity.image_url}
          alt={activity.title || "Activity image"}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover opacity-80"
          unoptimized
        />
      ) : (
        <div className="flex h-full items-center justify-center bg-zinc-800 text-zinc-400">
          No Image
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-zinc-900/90 via-zinc-900/70 to-transparent p-4">
        <div className="mb-1">
          <h3 className="line-clamp-1 text-sm font-extrabold text-white drop-shadow-md">
            {activity.title}
          </h3>
          {activity.location_name && (
            <p className="text-xs text-zinc-300 mt-0.5">{activity.location_name}</p>
          )}
        </div>
        
        <div className="flex justify-between items-end">
          <p className="text-xs font-black text-amber-400 px-2 py-1 rounded bg-amber-400/10">
            {activity.points} PTS
          </p>
          <p className="text-[10px] text-zinc-400">
            {new Date(activity.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>

      {activity.activity_categories?.group_category && (
        <span className="absolute right-2 top-2 rounded-full bg-white/20 px-2 py-1 text-xs text-white font-semibold backdrop-blur">
          {activity.activity_categories.group_category}
        </span>
      )}
    </div>
  );
}