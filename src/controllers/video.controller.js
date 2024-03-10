import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    //get all videos based on query, sort, pagination
    const { page = 1, limit = 10, query, sortBy, sortType = -1, userId } = req.query

    let pipeline = []
    let criteria = {}

    if (userId) {
        criteria.owner = new mongoose.Types.ObjectId(userId)
    }
    
    if (query?.trim()?.length) {

        if (!criteria?.title) {
            criteria.title = {}
        }

        criteria.title.$regex = query
        pipeline.push({$match:criteria})
    }
    
    if (sortBy && ["title","views","createdAt","duration"].includes(sortBy) && [1,-1].includes(sortType)) {
        let sortByOption = {}
        sortByOption[sortBy] = sortType
        pipeline.push({$sort:sortByOption})
    }

    let options = {
        page,
        limit
    }

    const Aggregate = Video.aggregate(pipeline)
    const videos = await Video.aggregatePaginate(Aggregate,options)

    return res
    .status(200)
    .json(
        new ApiResponse(200, videos, "Videos loaded!")
    )

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    const { user } = req;

    if (!title || !description) {
        throw new ApiError(400,"Title and Description are required")
    }   

    const videoLocalPath = req.files?.videoFile && req.files.videoFile[0].path

    if (!videoLocalPath) {
        throw new ApiError(400,"Video File is required")
    }

    const thumbnailLocalPath = req.files?.thumbnail && req.files.thumbnail[0].path

    if (!thumbnailLocalPath) {
        throw new ApiError(400,"Thumbnail File is required")
    }

    const videoFile = await uploadOnCloudinary(videoLocalPath);
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);

    const videoObj = {
        videoFile:videoFile?.url,
        thumbnail:thumbnail?.url,
        title,
        description,
        duration:videoFile?.duration,
        owner:user?._id
    }

    const video = await Video.create(videoObj)

    if (!video) {
        throw new ApiError(500,"Something went Wrong while Publishing the video")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(200, video, "Videos Published!")
    )
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
})

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
