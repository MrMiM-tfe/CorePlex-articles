// core imports
import { ERole } from "@/core/types/user";
import User from "@/core/models/User";
import { EResultTypes, EStatusCodes } from "@/core/types/general";

// module imports
import { ArticleResult, EArticleStates, ESortingOptions, IArticle, IArticleResult, IOptArticle, IPreArticle } from "../types/article";
import { EArticleMSG } from "../messages/article";
import Article from "../models/Article";
import { ConvertToNaturalNumber, findDocByIdentity, getPageData, handleModelErrors } from "@/core/helpers/general";

/**
 * function to get article by id and slug
 * @param identity slug string or article id string
 */
export const getArticle = async (identity: string) => {
    const article = await findDocByIdentity(identity, Article)
    if(!article) return ArticleResult.singleError("article", EArticleMSG.ARTICLE_NOT_FOUND, EStatusCodes.NOT_FOUND)

    return ArticleResult.success(article, EArticleMSG.SUCCESS)
}

/**
 * get paginated articles
 * @param page page number
 * @param limit pre page
 * @param sort sort by
 * @returns `ArticleResult`
 */
export const getArticles = async (
    page: number,
    limit: number,
    {sort = [ESortingOptions.NEWEST_FIRST], userId}: {
        sort?: ESortingOptions[],
        userId?: string
    }
) => {
    // validate page and limit
    page = ConvertToNaturalNumber(page);
    limit = ConvertToNaturalNumber(limit);

    // generate skip
    const skip = (page - 1) * limit;

    // generate filter object for mongoose
    let filter: {state?: EArticleStates} = {
        state: EArticleStates.PUBLISHED
    }

    // check if user is admin or seller to show all articles
    if (userId) {
        const user = await User.findById(userId)
        if (user?.role === ERole.ADMIN || user?.role === ERole.SELLER) {
            filter = {}
        }
    }

    try {
        // get articles
        const articles = await Article.find(filter)
            .sort(sort.join(' '))
            .skip(skip)
            .limit(limit)
        
        // get total number of articles
        const totalArticles = await Article.countDocuments(filter)

        // get page data
        const pageData = getPageData(page, limit, totalArticles);

        // create result
        const result: IArticleResult = {
            status: 200,
            type: EResultTypes.SUCCESS,
            data: articles as IArticle[],
            pageData
        }

        return result
    } catch (error) {
        return handleModelErrors(error)
    }
}

/**
 * create article service
 * @param data you want to save
 * @param authorId user id of article author
 * @returns `ArticleResult`
 */
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

/**
 * edit existing article
 * @param identity string of slug or id
 * @param data saving data
 * @param editorId user id of editor
 * @returns `ArticleResult`
 */
export const editArticle = async (identity: string, data: IOptArticle, editorId: string) => {
    // find article by identity
    const article = await findDocByIdentity(identity, Article)
    
    // check if article exist
    if (!article) return ArticleResult.singleError("article", EArticleMSG.AUTHOR_NOT_FOUND, EStatusCodes.NOT_FOUND)
    
    // check if editor exist
    const user = await User.findById(editorId)
    if (!user) return ArticleResult.singleError("user", EArticleMSG.USER_NOT_FOUND, EStatusCodes.UNAUTHORIZED)

    // check editor permission
    if (user.role !== ERole.ADMIN && user.id !== article.authorId) {
        return ArticleResult.singleError("editor", EArticleMSG.NO_PERMISSION, EStatusCodes.FORBIDDEN)
    }

    // check if article author changed author
    if (data.authorId) {
        // check if new article author exist
        const newAuthor = await User.findById(data.authorId)
        if (!newAuthor) return ArticleResult.singleError("new_author", EArticleMSG.USER_NOT_FOUND, EStatusCodes.NOT_FOUND)

        // check if new author is Seller or Admin
        if (newAuthor.role !== ERole.ADMIN && newAuthor.role !== ERole.SELLER) {
            return ArticleResult.singleError("new_author", EArticleMSG.NEW_AUTHOR_IS_NOT_VALID, EStatusCodes.BAD_REQUEST)
        }
    }

    try {
        // save new data to DB
        const newArticle = await Article.findByIdAndUpdate(article.id, data) as IArticle

        return ArticleResult.success(newArticle, EArticleMSG.SUCCESS_CREATE, EStatusCodes.SUCCESS_CREATE)
    } catch (error) {
        return handleModelErrors(error)
    }
}

/**
 * delete article from DB
 * @param identity slug or id string
 * @param authorId user id for article author or user id of an Admin
 * @returns `ArticleResult`
 */
export const deleteArticle = async (identity: string, authorId: string) => {
    // check article
    const article = await findDocByIdentity(identity, Article)
    if (!article) return ArticleResult.singleError("article", EArticleMSG.ARTICLE_NOT_FOUND, EStatusCodes.NOT_FOUND)

    // check if author exist
    const author = await User.findById(authorId)
    if(!author) return ArticleResult.singleError("author", EArticleMSG.AUTHOR_NOT_FOUND, EStatusCodes.UNAUTHORIZED)

    // check author permission
    if(author.id !== article.authorId && author.role !== ERole.ADMIN) {
        return ArticleResult.singleError("author", EArticleMSG.NO_PERMISSION, EStatusCodes.FORBIDDEN)
    }

    try {
        // delete article from DB
        await article.deleteOne()

        return ArticleResult.success(article, EArticleMSG.SUCCESS_DELETE, EStatusCodes.SUCCESS)
    } catch (error) {
        return handleModelErrors(error)
    }
}