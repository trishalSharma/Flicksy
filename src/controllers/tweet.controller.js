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

    let { page = 1, limit = 10, query, userId  } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if(page < 1) page = 1;
    if(limit < 10) limit = 10;

    const filter = {};

     if(userId && mongoose.Types.ObjectId.isValid(userId)){
            filter.owner = userId;
        }

         if (query && query.trim() !== "") {
        filter.content = {
            $regex: query,
            $options: "i"
        };
    }

        const skip = (page - 1 ) * limit;

        const tweets = await Tweet.find(filter)
             .sort({ createdAt: -1 })
             .skip(skip)
             .limit(limit)
             .populate("owner", "username avatar")
             .select("-__v");

          const totalTweets =  await Tweet.countDocuments(filter);

          const TotalPages = Math.ceil(
            totalTweets / limit
          );

             return res
                       .status(200)
                       .json(new ApiResponse(200, {
                            tweets,
                            pagination:{
                                totalTweets,
                                currentPage:page,
                                totalPages,
                                limit
                            }
                       },
                        "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet

    const { tweetId } = req.params;
    

    if(!tweetId) {
        throw new ApiError(400, "Tweet Id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Tweet Id not valid")
    }

    const { content } = req.body;

     if(!content || content.trim() === ""){
        throw new ApiError(400, "Content is required");
    }
    if(content.trim().length > 280){
        throw new ApiError(400, "Content must be less than 280 characters");
    }

    const tweet = await Tweet.FindById(tweetId)

    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to update this tweet");
    }

    tweet.content = content.trim();

    await tweet.save({ validateBeforeSave: false });

    const updatedTweet = await Tweet.findById(tweet._id)
                                    .populate("owner", "username avatar");

    return res
             .status(200)
             .json(new ApiResponse(
                        200,
                        updatedTweet,
                        "Tweet updated Successfully"
                    )
                );
});

const deleteTweet = asyncHandler(async (req, res) => {

    //TODO: delete tweet

    const { tweetId } = req.params;

    if(!tweetId){
        throw new ApiError(400, "Tweet Id is requied");
    }

    if(!mongoose.Types.ObjectId.isValid(tweetId)){
        throw new ApiError(400, "Invalid Tweet Id");
    }

    const tweet = await Tweet.findById(tweetId);

    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }

    if(tweet.owner.toString() !== req.user?._id.toString()){
        throw new ApiError(403, "You are not authorized to delete this tweet");
    }
    
    await Tweet.findByIdAndDelete(tweetId);

    return res
              .status(200)
              .json(new ApiResponse(200, {}, "Tweet deleted successfully"));

    
});

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}