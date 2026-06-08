import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => { 
    //TODO: get all comments for a video
    const {videoId} = req.params
    let {page = 1, limit = 10} = req.query

    page = parseInt(page);
    limit = parseInt(limit);

    if(page < 1) page = 1;
    if(limit < 1) limit = 10;

    const skip = (page - 1) * limit;

    if(!videoId){
        throw new ApiError(400, "Video Id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findById(videoId);


    if(!video){
        throw new ApiError(404, "Video not found");
    }

    const comments = await Comment.find({
        video: videoId,
    })
    .populate("owner", "username avatar")
    .sort({creastedAt: -1})
    .skip(skip)
    .limit(limit);


    totalComments = await Comment.countDocuments({
        video:videoId
        });

        totalPages = Math.ceil(
            totalComments / limit
        )

        return res.status(200).json(
            new ApiResponse(
                200,
                {
                    comments,
                    pagination:{
                        totalComments,
                        currentPage: page,
                        totalPages,
                        limit
                        
                    }
                }
            )
        );
});

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }