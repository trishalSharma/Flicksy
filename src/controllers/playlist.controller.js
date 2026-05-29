import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { User } from "../models/user.model.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    //TODO: create playlist

    if([name, description].some((field) => !field || field.trim() === "")){
        throw new ApiError(400, "Name and description is required");
    }

    const duplicatePlaylist = await Playlist.findOne({
        name:name.trim(),
        owner:req.user?._id,
    });

    if(duplicatePlaylist){
        throw new ApiError(400, "Playlist already exists");
}

    const playlist = await Playlist.create({
                              name:name.trim() ,
                              description:description.trim(),
                              videos:[],
                              owner: req.user?._id,
});

        const createdPlaylist = await Playlist.findById(playlist._id)
                                              .populate("owner", "username avatar");

        if(!createPlaylist){
            throw new ApiError(500, "something went wrong while creating playlist");
        }

return res.status(201).json(
                new ApiResponse(
                    201,
                    createdPlaylist,
                    "Playlist created successfully"
                )
            );

});

const getUserPlaylists = asyncHandler(async (req, res) => {

    let {page, limit, query} = req.query;
    const {userId} = req.params;

    page = parseInt(page);
    limit = parseInt(limit);

    if( page < 1 ) page = 1;
    if( limit < 1) limit = 10; 

    
    if(!userId){
        throw new ApiError(400, "userID is required");
    }

    if(!mongoose.Types.ObjectId.isValid(userId)){
        throw new ApiError(400, "UserId not valid");
    }

    const user = await User.findById(userId);

    if(!user) {
        throw new ApiError(404, "UserId not found");
    }
    
    const filter = {
        owner:userId
    }

      if (query && query.trim() !== "") {
        filter.name = {
            $regex: query,
            $options: "i",
        };
    }

    const skip = (page - 1 ) * limit;
    
            const playlists = await Playlist.find(filter)
                                            .populate("owner", "username avatar")                                
                                            .sort({ createdAt: -1})
                                            .skip(skip)
                                            .limit(limit)
                                            .select("-__v");

    
              const totalPlaylists =  await Playlist.countDocuments(filter);
    
              const totalPages = Math.ceil(
                totalPlaylists / limit
              );
    
                 return res
                           .status(200)
                           .json(new ApiResponse(200, {
                                playlists,
                                pagination:{
                                    totalPlaylists,
                                    currentPage:page, 
                                    totalPlaylists,
                                    limit,
                                },
                           },
                            "Playlists fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params

    //TODO: get playlist by id

    if(!playlistId){
        throw new ApiError(400, "Playlist Id is required"); 
    }

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "Invalid playlist Id ");
    }

    const playlist = await Playlist.findById(playlistId)
                                   .populate("owner", "username avatar")
                                   .populate("videos");

    if(!playlist){
        throw new ApiError(404, "playlist not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            playlist,
            "Playlist fetched successfully"
        )
    );
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    
    if(playlistId || videoId){
        throw new ApiError(400, "playlist Id and video Id  is required");
    }

    if(!mongoose.Types.ObjectId.isValid(playlistId)){
        throw new ApiError(400, "playlistId is required");
    }

    if(!mongoose.Types.ObjectId.isValid(videoId)){
        throw new ApiError(400, "videoId is required");
    }

    const playlist = await Playlist.findById(playlistId); 
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}