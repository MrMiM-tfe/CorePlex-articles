// core imports
import { ERole } from "@/core/types/user";
import User from "@/core/models/User";
import { EStatusCodes } from "@/core/types/general";

// module imports
import { ArticleResult, IPreArticle } from "../types/article";
import { EArticleMSG } from "../messages/article";
import Article from "../models/Article";
import { handleModelErrors } from "@/core/helpers/general";

export const createArticle = async (data: IPreArticle, authorId: string) => {
    // check author
    const user = await User.findById(authorId);
    if (!user) return ArticleResult.singleError("author", EArticleMSG.AUTHOR_NOT_FOUND, EStatusCodes.NOT_FOUND);
    
    // check author permission
    if (user.role !== ERole.ADMIN && user.role !== ERole.SELLER) return ArticleResult.singleError("author", EArticleMSG.NO_PERMISSION, EStatusCodes.FORBIDDEN)

    // set article author id
    data.authorId = authorId

    try {
        // save article to DB
        const article = await Article.create(data);

        return ArticleResult.success(article, EArticleMSG.SUCCESS_CREATE, EStatusCodes.SUCCESS_CREATE)
    } catch (error) {
        return handleModelErrors(error)
    }
};
