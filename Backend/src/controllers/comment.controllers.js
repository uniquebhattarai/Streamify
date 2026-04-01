import mongoose, { isValidObjectId } from "mongoose"
import { Like } from "../models/like.models.js"
import { Comment } from "../models/comment.models.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { commentContent } = req.body

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }

    if (!commentContent) {
        throw new ApiError(400, "Comment is required")
    }
    try {
        const newComment = await Comment.create({
            content: commentContent,
            video: videoId,
            owner: req.user._id
        })

        if (!newComment) {
            throw new ApiError(500, "Comment is not added to the video");
        }

        res.status(200)
            .json(new ApiResponse(200, newComment, "Comment added successfully"));

    } catch (error) {
        console.log(error)
        throw new ApiError(500, error, "Error while adding comments");
    }
})

const updateComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;
    const {newComment}=req.body
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }
    if(!newComment){
        throw new ApiError(400,"cannot add empty comment")
    }
     const comment = await Comment.findById(commentId);

    if (!comment) {
        throw new ApiError(404, "Comment not found");
    }

    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to edit this comment");
    }
    try {
        const updatedComment = await Comment.findByIdAndUpdate(commentId,
            {
            content:newComment
        },
        {new:true}
    )

    return res.status(200).json(new ApiResponse(201,updatedComment,"Comment Successfully updated"))


    } catch (error) {
        console.log("Error while updating comment",error)
        throw new ApiError(500,error,"Error while updating comment")
    }
})

const deleteComment = asyncHandler(async (req, res) => {
    const {commentId} = req.params;

     if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment id")
    }

    try {
        const comment = await Comment.findById({_id:commentId})
         if (!comment) {
            throw new ApiError(404, "comment not found ")
        }
         if (comment.owner.toString() !== req.user._id.toString()) {
            throw new ApiError(403, "You are not allowed to delete this comment")
        }
        const deletedComment = await Comment.findByIdAndDelete(commentId)

        await Like.deleteMany({ comment: commentId });

          if (!deletedComment) {
            throw new ApiError(500, "Comment could not deleted: try again")
        }
          res
        .status(200)
        .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"))

    } catch (error) {
        console.log(error)
        throw new ApiError(500,error?.message, "An error occurred while deleting your comment")
    }
})

export {
    addComment,
    updateComment,
    deleteComment
}