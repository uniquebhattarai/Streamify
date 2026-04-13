import { useParams } from "react-router-dom";
import { useGetVideoById } from "@services/video";
import GlobalLoader from "@components/feedback/GlobalLoader";
import { formatDistanceToNow } from "date-fns";

const VideoDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError } = useGetVideoById(id!);

  if (isLoading) return <GlobalLoader />;
  if (isError)   return <p>Something went wrong.</p>;

  const video = data?.data;  

  return (
    <div className="max-w-4xl mx-auto p-4">

     
      <video
        src={video?.videoFile}
        controls
        className="w-full rounded-xl aspect-video bg-black"
      />

     
      <div className="mt-4">
        <h1 className="text-lg font-medium text-gray-900">{video?.title}</h1>
        <div className="flex items-center justify-between mt-2 text-sm text-gray-500">
          <span>{video?.views} views · {video?.createdAt && formatDistanceToNow(new Date(video.createdAt), { addSuffix: true })}</span>
          <span>{video?.likesCount} likes</span>
        </div>
      </div>

      
      <div className="flex items-center gap-3 mt-4 pb-4 border-b">
        <img src={video?.owner?.avatar} className="w-10 h-10 rounded-full object-cover" />
        <div>
          <p className="text-sm font-medium">{video?.owner?.username}</p>
          <p className="text-xs text-gray-500">{video?.owner?.subscribersCount} subscribers</p>
        </div>
      </div>

     
      <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">{video?.description}</p>

      
      <div className="mt-6">
        <h2 className="text-sm font-medium mb-4">{video?.totalComment} comments</h2>
        {video?.comments.map((comment) => (
          <div key={comment._id} className="flex gap-3 mb-4">
            <img src={comment.commenter.avatar} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
            <div>
              <p className="text-xs font-medium">{comment.commenter.username}</p>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default VideoDetail;