import VideoCard from "@components/VideoCard";
import { useNavigate } from "react-router-dom";
import GlobalLoader from "@components/feedback/GlobalLoader";
import { useGetAllVideos } from "@services/video";

const VideosPage = () => {
  const navigate = useNavigate();
  const { data:videos, isLoading, isError } = useGetAllVideos({ page: 1, limit: 20 });
  console.log(videos?.data?.videos?.[0])

  if (isLoading) return <GlobalLoader />;
  if (isError) return <p>Something went wrong.</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
      {(videos?.data?.videos ?? []).map((video: any) => (
  <VideoCard
    key={video._id}      
    video={video}
    onClick={(v) => navigate(`/video/${v._id}`)}
  />
))}
    </div>
  );
};

export default VideosPage;