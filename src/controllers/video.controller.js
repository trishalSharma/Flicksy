import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body

    // TODO: get video, upload to cloudinary, create video
    
    if ([title, description].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400,"Title and description is required");
    }

    const videoLocalPath = req.files?.video?.[0]?.path;
    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    if (!videoLocalPath || !thumbnailLocalPath) {
        throw new ApiError(400,"Video file or thumbnail is required");
    }

    const videoUploading = await uploadOnCloudinary(videoLocalPath);
    const thumbnailUploading = await uploadOnCloudinary(thumbnailLocalPath)

    if (!videoUploading?.url) {
        throw new ApiError(500, "Something went wrong while uploading video")
    }
    if (!thumbnailUploading?.url) {
        throw new ApiError(500, "Something went wrong while uploading thumbnail")
    }


    const video = await Video.create({
        title: title.trim(),
        description: description.trim(),
        videoFile: videoUploading.url,
        thumbnail: thumbnailUploading.url,
        owner:req.user?._id
    });

    const createdVideo = await Video.findById(video._id);

    if (!createdVideo) {
        throw new ApiError(
            500,
            "Something went wrong while publishing video"
        );
    }

    return res
             .status(201)
             .json(new ApiResponse(201, createdVideo, "Video published sucessfully"));

});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id

    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400,"Invalid video ID");
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video Id does not exist");
    }

    return res
              .status(200)
              .json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    
    if (!videoId) {
        throw new ApiError(400, "Video ID is required");
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(404, "Video ID not found");
    }

    const { title, description } = req.body

    if (
        !title &&
        !description &&
        !req.files?.thumbnail?.[0]?.path
    ) {
        throw new ApiError(
            400,
            "At least one field is required to update"
        );
    }
    const video = await Video.findById(videoId);

    if(!video){
        throw new ApiError(400, "Video not found");
    }

     const updatedFields = {};

     if (title && title.trim() !== "") {
        updatedFields.title = title.trim();
     }
    if (description && description.trim() !== "") {
        updatedFields.description = description.trim();
    }

    const thumbnailLocalPath = req.files?.thumbnail?.[0]?.path;

    const uploadingThumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    if(!uploadingThumbnail.url){
        throw new ApiError(500, "Something went wrong while uploading thumbnail on cloudinary")
    }

    updatedFiels.thumbnail = thumbnailLocalPath.url;

     const updatedVideo = await findByIdAndUpdate(
        video_id,
        {
        $set: updatedFields,

        },{
            new:true
        }
     )
     return res 
               .status(200)
               .json(new ApiResponse(200,updatedVideo, "Video updated successfully")) 

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if(!videoId) {
        throw new ApiError(400, "Video Id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(404, "Invalid video Id");
    }

    const video = await Video.findById(videoId);

    if(!video) {
        throw new ApiError(404, "Video couldn't find");
    }


    const videoOwner = video.owner.toString() === req.user?._id.toString();

    if (!videoOwner) {
        throw new ApiError(403, "Unauthorized");
    }

    await deleteFromCloudinary(video.videoPublicId, "video");
    await deleteFromCloudinary(video.thumbnailPublicId,"image");

    await Video.findByIdAndDelete(videoId);

    return res
            .status(200)
            .json(
                new ApiResponse(
                    200, 
                    {}, 
                    "Video deleted successfully"
                ));

});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}