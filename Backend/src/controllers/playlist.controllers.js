import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!name){
        throw new ApiError(400,"Playlist name is required")
    }
    if(!description){
        throw new ApiError(400,"Playlist description is required")
    }

    try {
        const newPlaylist = await Playlist.create({
            name:name,
            description:description,
            videos: [],
            owner:req.user._id
        })

        if(!newPlaylist){
            throw new ApiError(404, "Could not create playlist")
        }

        res
        .status(201)
        .json(new ApiResponse(201, newPlaylist, "Playlist created successfully"))
    } catch (error) {
        console.log(error)
          throw new ApiError(500, error, "An error while creating playlist : try again later")
    }
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid user id");
    }

    const pipeline=[
          {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $addFields: {
                totalVideos: { $size: "$videos" },
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                totalVideos: 1,
                updatedAt: 1
            }
        }
    ]

  try {
    if (!pipeline || pipeline.length === 0) {
            throw new ApiError(500, "Pipeline initialization failed");
        }
      const playlists = await Playlist.aggregate(pipeline);
  
      return res
          .status(200)
          .json(new ApiResponse(200, playlists, "User playlists fetched successfully"));
  } catch (error) {
    console.log("error in user playlist",error)
    throw new ApiError(500,"Something went wrong while fetching user playlist")
  }
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }


    const pipeline=[
         {
            $match: {
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "videos",
                foreignField: "_id",
                as: "videos",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    { $addFields: { owner: { $first: "$owner" } } }
                ]
            }
        },
        {

            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        { $addFields: { owner: { $first: "$owner" } } }
    ]
    try {
         if (!pipeline || pipeline.length === 0) {
            throw new ApiError(500, "Pipeline initialization failed");
        }
        const playlist = await Playlist.aggregate(pipeline);
    
        if (!playlist.length) {
            throw new ApiError(404, "Playlist not found");
        }
    
        return res
            .status(200)
            .json(new ApiResponse(200, playlist[0], "Playlist fetched successfully"));
    } catch (error) {
         console.log("error in playlist by id",error)
    throw new ApiError(500,"Something went wrong while fetching playlist")
    }
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) throw new ApiError(400, "Invalid IDs");

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) throw new ApiError(404, "Playlist not found");

        if (playlist.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(403, "You cannot add videos to this playlist");
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $addToSet: { videos: videoId } },
            { new: true }
        );

        return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video added to playlist"));
    } catch (error) {
        throw new ApiError(500, error?.message || "Error adding video to playlist");
    }
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params;

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) throw new ApiError(404, "Playlist not found");

        if (playlist.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(403, "You cannot remove videos from this playlist");
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $pull: { videos: videoId } },
            { new: true }
        );

        return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Video removed from playlist"));
    } catch (error) {
        throw new ApiError(500, "Error removing video from playlist");
    }
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    
    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) throw new ApiError(404, "Playlist not found");
        
        if (playlist.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(403, "You do not have permission to delete this playlist");
        }

        await Playlist.findByIdAndDelete(playlistId);

        return res.status(200).json(new ApiResponse(200, {}, "Playlist deleted successfully"));
    } catch (error) {
        throw new ApiError(500, "Error deleting playlist");
    }
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;

    if (!name || !description) throw new ApiError(400, "All fields are required");

    try {
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) throw new ApiError(404, "Playlist not found");

        if (playlist.owner.toString() !== req.user?._id.toString()) {
            throw new ApiError(403, "You cannot edit this playlist");
        }

        const updatedPlaylist = await Playlist.findByIdAndUpdate(
            playlistId,
            { $set: { name, description } },
            { new: true }
        );

        return res.status(200).json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
    } catch (error) {
        throw new ApiError(500, "Error updating playlist");
    }
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}