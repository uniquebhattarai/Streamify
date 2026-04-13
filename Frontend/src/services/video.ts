import { httpClient } from "@api/clients/http-client";
import { apisRoutes } from "@routes/apiRoutes";
import { useQuery } from "@tanstack/react-query";



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
  ownerDetails: {
    _id: string;
    username: string;
    avatar: string;
  };
}

interface Owner {
  _id: string;
  username: string;
  avatar: string;
  subscribersCount: number;
  isSubscribed: boolean;
}

interface Comment {
  _id: string;
  content: string;
  video: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
  commenter: {
    _id: string;
    username: string;
    avatar: string;
  };
}

interface VideoDetail {
  _id: string;
  videoFile: string;
  thumbnail: string;
  title: string;
  description: string;
  views: number;
  duration: number;
  isPublished: boolean;
  owner: Owner;
  createdAt: string;
  likesCount: number;
  isLiked: boolean;
  comments: Comment[];
  totalComment: number;
}

interface VideoFilters {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

interface VideosResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: {
    videos: Video[];
    totalVideos: number;
    currentPage: number;
    totalPages: number;
  };
}

interface VideoDetailResponse {
  success: boolean;
  message: string;
  statusCode: number;
  data: VideoDetail;
}



const getAllVideos = async (filters?: VideoFilters): Promise<VideosResponse> => {
  const res = await httpClient.get(apisRoutes?.videos?.get, {
    params: filters,
  });
  return res.data;
};

const getVideoById = async (id: string): Promise<Video> => {
  const res = await httpClient.get(apisRoutes?.videos?.getById.replace("{id}", String(id)));
  return res.data;
};

const videoService = { getAllVideos, getVideoById };
export default videoService;



export const useGetAllVideos = (filters?: VideoFilters, options: any = {}) => {
  return useQuery<VideosResponse>({
    queryKey: ["videos", filters],
    queryFn: () => videoService.getAllVideos(filters),
    ...options,
  });
};

export const useGetVideoById = (id: string, options: any = {}) => {
  return useQuery<VideoDetailResponse>({
    queryKey: ["video", id],
    queryFn: () => videoService.getVideoById(id),
    enabled: !!id, 
    ...options,
  });
};