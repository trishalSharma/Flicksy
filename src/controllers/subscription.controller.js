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


// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}