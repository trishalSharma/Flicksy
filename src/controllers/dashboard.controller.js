import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscription.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {

    const channelId = req.user?._id;

    // Total videos
    const totalVideos = await Video.countDocuments({
        owner: channelId,
    });

    // Total subscribers
    const totalSubscribers =
        await Subscription.countDocuments({
            channel: channelId,
        });

    // Total views
    const viewsStats = await Video.aggregate([
        {
            $match:{
                owner:channelId
            }
        },
        {
            $group:{
                id:null,
                totalViews:{
                    $sum: "$views"
                },

            },
        },
    ]);

    const totalViews =
        viewsStats.length > 0
            ? viewsStats[0].totalViews
            : 0;

    // Get all channel videos
    const videos = await Video.find(
        {
            owner: channelId,
        },
        "_id"
    );

    const videoIds = videos.map(
        (video) => video._id
    );

    // Total likes received on all videos
    const totalLikes =
        await Like.countDocuments({
            video: {
                $in: videoIds,
            },
        });

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                totalVideos,
                totalSubscribers,
                totalViews,
                totalLikes,
            },
            "Channel stats fetched successfully"
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel

    let {page = 1, limit = 10} = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    if(page < 1) page = 1;
    if(limit < 1) limit = 10;

    const channelId = req.user?._id;

    const skip = (page - 1) * limit;

    const videos = await Video.find(
        {
            owner: channelId,
        },
        "_id"
    )
    .populate("owner", "username avatar")
    .sort({createdAt: -1})
    .skip(skip)
    .limit(limit);

    const totalVideos = await countDocuments({
        owner:channelId,
    });

    const totalPages = Math.ceil(
        totalVideos / limit
    );


    

    return res.status(200).json(
        new ApiResponse(
            200, 
           {
             videos,
            pagination: {
                    totalVideos,
                    currentPage: page,
                    totalPages,
                    limit,
                },
           },
            "Videos fetched successfully"
        )
    );
});

export {
    getChannelStats, 
    getChannelVideos
    }