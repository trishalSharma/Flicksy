import mongoose, { isValidObjectId } from "mongoose"
import { User } from "../models/user.model.js"
import { Subscription } from "../models/subscription.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    
    // TODO: toggle subscription

    if(!channelId){
        throw new ApiError(400, "channel Id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400, "Invalid channel Id");
    }

    if(channelId.toString() === req.user?._id.toString()){
        throw new ApiError(400, "Self Subscription not allowed");
    }

    const channel = await User.findByid(channelId);

    if(!channel){
        throw new ApiError(404, "Channel not found");
    }

    // if subscription exists

    const existingSubscription = await Subscription.findOne({
                                             subscriber:req.user?._id,
                                             channel:channelId,
    });

    if(existingSubscription){
        await Subscription.findByIdAndDelete(existingSubscription._id);

        return res
                 .status(200)
                 .json(new ApiResponse(200, {}, "Unsubscribe Successfully")
                
                );
    }

    // if subscription not exists

    const Subscription = await Subscription.create({
        subscriber: req.user?._id,
        channel: channelId,
    });

    const createdSubscription = await Subscription.findById(subscription._id);

    if(!createdSubscription){
        throw new ApiError(400, "something went wrong while subscribing");
    }

    return res
             .status(200)
             .json(new ApiResponse(200, createdSubscription, "Subscribed sucessfully"));
});


const getUserChannelSubscribers = asyncHandler(async (req, res) => {

    let { page, limit } = req.query
    const { channelId } = req.params
    

    page = parseInt(page);
    limit = parseInt(limit);

    if( page < 1 ) page = 1;
    if( limit < 1 ) limit = 10; 

    if(!channelId){
        throw new ApiError(400, "Channel Id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(channelId)){
        throw new ApiError(400, "Invalid channel Id");
    }


    const channel = await User.findById(channelId);

    if(!channel){
        throw new ApiError(404, "Channel not found")
    }

    const skip = ( page - 1 ) * limit;

   const subscribers =  await Subscription.find({ channel: channelId })
                                          .populate("subscriber", "username avatar")
                                          .sort({ createdAt: -1})
                                          .skip(skip)
                                          .limit(limit);

    

const totalSubscribers = await Subscription.countDocuments({channel: channelId});

const totalPages = Math.ceil(
            totalSubscribers / limit
          );

return res
          .status(200).json(
            new ApiResponse(
                200,
                 {
                    subscribers,
                     pagination:{
                        totalSubscribers,
                        currentPage: page,
                        totalpages,
                        limit,

          },
        }, 
        "subscribers fetched successfully"
    )
);

});


const getSubscribedChannels = asyncHandler(async (req, res) => {
    
    let {page, limit} = req.query
    const { subscriberId } = req.params

    page = parseInt(page);
    limit = parseInt(limit);

    if ( page < 1 ) page = 1;
    if( limit < 1 ) limit = 1;

    if(!subscriberId){
        throw new ApiError(400, "Subscriber Id required");
    }

    if(!mongoose.Types.ObjectId.isValid(subscriberId)){
        throw new ApiError(400, "Invalid subscriber id");
    }

    const subscriber = await User.findById(subscriberId);

    if(!subscriber){
        throw new ApiError(404, "subscriber not found");
    }

    const skip = ( page - 1 ) * limit;


    const subscribedChannels = await Subscription.find({subscriber: subscriberId})
                                                 .populate("channel", "username avatar")
                                                 .sort({createdAt: -1})
                                                 .skip(skip)
                                                 .limit(limit) 
                                                 

    const totalSubscribedChannels = await Subscription.countDocuments({subscriber:subscriberId});

    const totalPages = Math.ceil(
            totalSubscribedChannels / limit
    );


    return res.status(200).json(
        new ApiResponse(
            200,{
                subscribedchannels,
            pagination:{
                    totalSubscribedChannels,
                    currentPage:page,
                    totalPages,
                    limit,
            },
            }, "Subscribed channels fetched successfully"
        )
    );    
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}