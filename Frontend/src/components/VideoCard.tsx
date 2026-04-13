import { formatDistanceToNow } from "date-fns";

interface Video {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;      
  videoFile: string;      
  views: number;
  duration: number;
  isPublished: boolean;
  owner: string;
  createdAt: string;
  updatedAt: string;
  ownerDetails: {
    _id: string;
    username: string;
    avatar: string;
  };
}
interface VideoCardProps {
  video: Video;
  onClick?: (video: Video) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatViews = (views: number): string => {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`;
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}K`;
  return views.toString();
};

const formatDuration = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

const getInitials = (name: string): string =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  const weeks   = Math.floor(days / 7);
  const months  = Math.floor(days / 30);
  const years   = Math.floor(days / 365);

  if (years   > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months  > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (weeks   > 0) return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
  if (days    > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours   > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
};

const VideoCard = ({ video, onClick }: VideoCardProps) => {
  const uploadedAt = timeAgo(video.createdAt);
  const ownerName  = video?.ownerDetails?.username ?? "Unknown";
  const avatar     = video?.ownerDetails?.avatar;

  return (
    <div onClick={() => onClick?.(video)} className="group cursor-pointer">

      {/* Thumbnail */}
      <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden mb-3">
        <img
          src={video?.thumbnail}       
          alt={video?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "/fallback-thumbnail.png";
          }}
        />
        <span className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-1.5 py-0.5 rounded">
          {formatDuration(Math.floor(video?.duration ?? 0))}
        </span>
      </div>

      {/* Info */}
      <div className="flex gap-3">
        {avatar ? (
          <img
            src={avatar}             
            alt={ownerName}
            className="w-9 h-9 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-medium flex-shrink-0">
            {getInitials(ownerName)}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-1">
            {video?.title}
          </h3>
          <p className="text-xs text-gray-500">{ownerName}</p> 
          <p className="text-xs text-gray-500">
            {formatViews(video?.views ?? 0)} views · {uploadedAt}
          </p>
        </div>
      </div>
    </div>
  );
};

export default VideoCard;