import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video

    if(!videoId){
        throw new ApiError(400, "video Id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "Invalid Video Id");
    }

    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(404, "Video not found");
    }

   const existingLike =  Like.findOne({
            video:videoId,
            likedBy:req.user?._id,
    });

    let isLiked = false;

    if(existinglike){
        await Like.findByIdAndDelete(existingLike._id);
        isLiked: false;
    }

    else{
        await Like.create({
            video:videoId,
            likedBy: req.user?._id,
        });
        isLiked= true;
    }

    const totalLikes = await Like.countDocuments({
        video:videoId,
    });

    return res.status(200).json(
        new ApiResponse(
            200, 
            {
                isLiked,
                totalLikes,
            },
           isLiked? "Video liked successfully": "Video Unlike successfully "
        )
    )
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

    if(!commentId){
        throw new ApiError(400, "Comment Id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(commentId)){
        throw new ApiError(400, "Invalid comment Id");
    }

    const comment = await Comment.findById(commentId);

    if(!comment){
        throw new ApiError(404, "Comment not found");
    }

    let isLiked = false;
    
    const existingLike = Like.findOne({
        comment:commentId,
        likedBy: req.user?._id,
    })

    if(existingLike){
       await Like.findByIdAndDelete(commentId);
        isLiked = false;
    }

    else{
        await Like.create({
            comment:commentId,
            likedBy:req.user?._id,
        });
        isLiked = true;
    }

    const totalLikes = await Like.countDocuments({commnet:commentId})

    return res.status(200).json(
        new ApiResponse(
            200, 
            {
                isLiked,
                totalLikes,
            },
            "Comment liked successfully"
        )
    );
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet

    if(!tweetId){
        throw new ApiError(400, "Tweet Id is required");
    }
    
    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid tweet Id")
    }

    const tweet = await Tweet.findById(tweetid);

    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    let isLiked = false;

    const existingLike = await findOne({
        tweet:tweetId,
        likedBy:req.user?._id,
    });

    if(existingLike){
        await Like.findByIdAndDelete(tweetId);
        isLiked = false;
    }

    else{
        Like.create({
            tweet:tweetId,
            likedBy:req.user?._id,
        });

        isLiked = true;
    }
    
    const totalLikes = await Like.countDocuments(tweetId);

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                isLiked,
                totalLikes,
            },
                "Tweet Liked successfully"
        )
    );
});

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos

    let {page = 1, limit = 10} = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if(page < 1) page = 1;
    if(limit < 1) limit = 10;

const skip = (page -1) * limit;

    const likes = await Like.find({
        likedBy:req.user?._id,
        video:{$exists:true},
    })
    .populate("video")
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

   const totalLikedVideos = await Like.countDocuments({
        likedBy:req.user?._id,
        video:{$exists:true},
    });

    const totalPages = Math.ceil(
        totalLikedVideos/limit
    );

    const likedVideos = likes
        .map((like) => like.video)
        .filter(Boolean);

    return res.status(200).json(
        new ApiResponse(
            200,  
            {    
                likedVideos,      
                pagination:{
                totalLikedVideos,   
                totalPages: totalPages,
                currentPage: page,
            },
        },
            "Liked videos fetched successfully"
        )
    );
});

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}