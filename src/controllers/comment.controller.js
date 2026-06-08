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
        const {videoId} = req.params;
        const {content} = req.body;

        if(!videoId){
            throw new ApiError(400, "Video id is required");
        }

        if(!mongoose.Types.ObjectId.isValid(videoId)){
            throw new ApiError(400, "Invalid video Id");
        }

        if(!content || content.trim() === ""){
            throw new ApiError(400, "content is required");
        }

        const video = awaitVideo.findById(videoId);

        if(!video){
            throw new ApiError(404, "video not found");
        }

       const comment = await Comment.create({
            content,
            video:videoId,
            owner: req.user?._id
        });

        const createdComment = await Commnet.findById(comment._id)
                                            .populate("owner", "username avatar")

        return res.status(201).json(
            new ApiResponse(
                201,
                createdComment,
                "Comment created successfully"
            )
        );
});

const updateComment = asyncHandler(async (req, res) => {

    const { videoId, commentId } = req.params;
    const { content } = req.body;

    // Validate IDs
    if (!videoId || !commentId) {
        throw new ApiError(
            400,
            "Video ID and Comment ID are required"
        );
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(
            400,
            "Invalid Video ID"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(
            400,
            "Invalid Comment ID"
        );
    }

    // Validate content
    if (!content || content.trim() === "") {
        throw new ApiError(
            400,
            "Content is required"
        );
    }

    // Check video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        );
    }

    // Update only if comment belongs to current user
    const updatedComment =
        await Comment.findOneAndUpdate(
            {
                _id: commentId,
                owner: req.user?._id,
                video: videoId,
            },
            {
                $set: {
                    content: content.trim(),
                },
            },
            {
                new: true,
                runValidators: true,
            }
        )
            .populate(
                "owner",
                "username avatar"
            );

    if (!updatedComment) {
        throw new ApiError(
            404,
            "Comment not found or unauthorized"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            updatedComment,
            "Comment updated successfully"
        )
    );
});

const deleteComment = asyncHandler(async (req, res) => {

    const { videoId, commentId } = req.params;

    // Validate IDs
    if (!videoId || !commentId) {
        throw new ApiError(
            400,
            "Video ID and Comment ID are required"
        );
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(
            400,
            "Invalid Video ID"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
        throw new ApiError(
            400,
            "Invalid Comment ID"
        );
    }

    // Check video exists
    const video = await Video.findById(videoId);

    if (!video) {
        throw new ApiError(
            404,
            "Video not found"
        );
    }

    // Delete only if comment belongs to current user
    const deletedComment =
        await Comment.findOneAndDelete({
            _id: commentId,
            owner: req.user?._id,
            video: videoId,
        });

    if (!deletedComment) {
        throw new ApiError(
            404,
            "Comment not found or unauthorized"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Comment deleted successfully"
        )
    );
});

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }