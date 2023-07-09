import mongoose from "mongoose";
import { GenerateSlug } from "@/core/helpers/general";
import { IArticleCategory } from "../types/articleCategory";

const CategorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        slug: {
            type: String,
            unique: true,
        },
        mother: {
            type: mongoose.Types.ObjectId,
            ref: "Product_Category",
        },
        des: {
            type: String,
        },
    },
    {
        timestamps: true,
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

CategorySchema.index({slug: 1})

// set articles virtual
CategorySchema.virtual('articles', {
    ref: "Article",
    foreignField: 'categories',
    localField: '_id'
})

CategorySchema.pre("save", async function (this: IArticleCategory, next: Function) {

    this.slug = await GenerateSlug(this, mongoose.models.Article_Category)

    next()
})

export default mongoose.model<IArticleCategory>("Article_Category", CategorySchema)