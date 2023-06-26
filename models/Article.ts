import mongoose from "mongoose";
import { IArticle } from "../types/article";
import { GenerateSlug } from "@/core/helpers/general";

const ArticleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    slug: {
        type: String,
        unique: true
    },
    body: {
        type: String
    },
    coverImage: {
        type: String
    },
    categories: {
        type: [mongoose.Types.ObjectId],
        ref: "Article_Category"
    },
    authorId: {
        type: mongoose.Types.ObjectId,
        ref: "User"
    },
    ratingsAverage: {
        type: Number,
        default: 5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: (val: number) => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    }
},{
    timestamps: true
})

ArticleSchema.index({name: "text", string: "text"})

ArticleSchema.index({name: 1, ratingsAverage: -1});
ArticleSchema.index({slug: 1})

ArticleSchema.virtual('comments', {
    ref: "Article_Comment",
    foreignField: "article", 
    localField: '_id'
})

ArticleSchema.virtual("author", {
    ref: "User",
    foreignField: "_id",
    localField: "authorId",
    justOne: true
})

// generate slug
ArticleSchema.pre("save", async function (this: IArticle, next: Function) {

    this.slug = await GenerateSlug(this, mongoose.models.Article)

    next()
})

export default mongoose.model<IArticle>("Article", ArticleSchema)