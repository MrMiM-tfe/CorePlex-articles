import mongoose from "mongoose";
import { IArticleComment } from "../types/articleComment";

const CommentSchema = new mongoose.Schema(
    {
        title:{
            type:String,
            required:true
        },
        body:{
            type:String,
            required:true
        },
        article:{
            type:mongoose.Types.ObjectId,
            ref:"Article",
            required:true
        },
        user:{
            type:mongoose.Types.ObjectId,
            ref:"User",
            required:true
        },
        parent:{
            type:mongoose.Types.ObjectId,
            ref:"Article_Comment",
        },
        state:{
            type: String,
            enum:["accepted", "waiting", "rejected", "parent_deleted"],
            default: "waiting"
        }
    },
    {
        timestamps: true,
    }
);

CommentSchema.index({ article: 1, user: 1 });


CommentSchema.virtual("children", {
    ref:"Article_Comment",
    localField: "_id",
    foreignField:"parent"
})

export default mongoose.model<IArticleComment>("Article_Comment", CommentSchema)