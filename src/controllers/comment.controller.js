import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

    let pipeline = []
    let criteria = []
    let options = {
        page,
        limit
    }

    if (!videoId) {
        throw new ApiError(400,"videoId is required!")
    }

    criteria.video = videoId

    pipeline.push( { $match:criteria } )

    const Aggregate = Comment.aggregate(pipeline)
    const comments = await Comment.aggregatePaginate(Aggregate,options)

    return res
    .status(200)
    .json(
        new ApiResponse(200,comments,"Success!")
    )
    

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const { videoId } = req?.params
    const { comment } = req?.body

    if (!videoId || !comment?.trim()?.length) {
        throw new ApiError(400,"videoId and Comment is required!")
    }

    let commentObj = {
        video: videoId,
        owner: req?.user?._id,
        content:comment 
    }

    const response = await Comment.create(commentObj)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "Comment Added"
        )
    )
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const { commentId } = req?.params
    const { comment } = req?.body

    if (!commentId || !comment?.trim()?.length) {
        throw new ApiError(400,"commentId and Comment is required!")
    }


    const response = await Comment.findByIdAndUpdate(
        commentId,
        { content:comment },
        { new: true, lean: true }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "Comment Updated"
        )
    )
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const { commentId } = req?.params

    if (!commentId) {
        throw new ApiError(400,"commentId is required!")
    }

    const resp = await Comment.findByIdAndDelete(commentId)

    return res
    .status(200)
    .json(
        new ApiResponse(200,{},"Comment removed")
    )

})

export {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
}
