import mongoose, { isValidObjectId } from "mongoose"
import { Tweet } from "../models/tweet.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    
    //TODO: create tweet

    const { content } = req.body; 

    if(!content || content.trim() === ''){
        throw new ApiError(400, "Content is required");
    }

    if(content.length > 280){
        throw new ApiError(400, "Content must be within 280 characters");
    }

   const tweet =  await Tweet.create({
            content:content.trim(),
            owner: req.user?._id,
    });

    const createdTweet = await Tweet.findById(tweet._id)
                                    .populate("owner", "username avatar");

    if(!createdTweet){
        throw new ApiError(404, "Something wennt wrong while creating tweet");
    }

    return res
             .status(201)
             .json(new ApiResponse(201, createdTweet, "Tweet created Successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}