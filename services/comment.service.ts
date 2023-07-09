import { EResultTypes, EStatusCodes } from "@/core/types/general"
import { ECommentMSG } from "../messages/comment"
import ArticleComment from "../models/ArticleComment"
import { ArticleCommentResult, ECommentSortOptions, ECommentState, IArticleCommentResult, ICommentFilter, IOptArticleComment, IPreArticleComment } from "../types/articleComment"
import { ConvertToNaturalNumber, findDocByIdentity, getPageData, handleModelErrors } from "@/core/helpers/general"
import Article from "../models/Article"
import { editPermission } from "@/core/helpers/auth"
import User from "@/core/models/User"

/**
 * get single comment
 * @param id comment id
 * @returns `IArticleCommentResult`
 */
export const getComment = async (id: string) => {
    // get comment
    const comment = await ArticleComment.findById(id).populate("children")
    if (!comment) return ArticleCommentResult.singleError("comment", ECommentMSG.COMMENT_NOT_FOUND, EStatusCodes.NOT_FOUND)

    return ArticleCommentResult.success(comment, ECommentMSG.SUCCESS, EStatusCodes.SUCCESS)
}

/**
 * get single article comments
 * @param articleIdentity article slug or id
 * @param page page number
 * @param limit per page limit
 * @returns `IArticleCommentResult`
 */
export const getArticleComments = async (articleIdentity:string, page:number, limit:number) => {
    // validate page and limit
    page = ConvertToNaturalNumber(page);
    limit = ConvertToNaturalNumber(limit);

    // generate skip
    const skip = (page - 1) * limit;

    // get article and create filter obj
    const article = await findDocByIdentity(articleIdentity, Article)
    if (!article) return ArticleCommentResult.singleError("article", ECommentMSG.ARTICLE_NOT_FOUND, EStatusCodes.NOT_FOUND)
    const filter = {article: article._id?.toString() as string, state: ECommentState.ACCEPTED}

    try {
        // get comments
        const comments = await ArticleComment.find(filter).populate("children").skip(skip).limit(limit)

        // get total number of comments base on filter
        const totalComments = await ArticleComment.countDocuments(filter);

        // get page data
        const pageData = getPageData(page, limit, totalComments);

        // create result
        const res: IArticleCommentResult = {
            type: EResultTypes.SUCCESS,
            status: EStatusCodes.SUCCESS,
            data: comments,
            pageData,
        }

        return res
    } catch (error) {
        return handleModelErrors(error);
    }
}

/**
 * get all comments
 * @param page page number
 * @param limit per page limit
 * @param options filter and sort
 * @returns `IArticleCommentResult`
 */
export const getComments = async (page: number, limit: number, { filter, sort }: { filter: ICommentFilter; sort: ECommentSortOptions } = { filter: {}, sort: ECommentSortOptions.NEWEST_FIRST }) => {
    // validate page and limit
    page = ConvertToNaturalNumber(page);
    limit = ConvertToNaturalNumber(limit);

    // generate skip
    const skip = (page - 1) * limit;

    try {
        // get comments
        const comments = await ArticleComment.find(filter).skip(skip).limit(limit).sort(sort);

        // get total number of comments base on filter
        const totalComments = await ArticleComment.countDocuments(filter);

        // get page data
        const pageData = getPageData(page, limit, totalComments);

        // create result
        const res: IArticleCommentResult = {
            type: EResultTypes.SUCCESS,
            status: EStatusCodes.SUCCESS,
            data: comments,
            pageData,
        }

        return res
    } catch (error) {
        return handleModelErrors(error);
    }
};

/**
 * new comment by normal user
 * @param data data to save
 * @param userId creator user id
 * @returns `IArticleCommentResult`
 */
export const newComment = async (data: IPreArticleComment, userId: string) => {
    // check user id
    const user = await User.findById(userId);
    if (!user) return ArticleCommentResult.singleError("user", ECommentMSG.USER_NOT_FOUND, EStatusCodes.CONFLICT);

    // set user for creating comment
    data.user = user._id.toString();

    try {
        const comment = await ArticleComment.create(data);

        return ArticleCommentResult.success(comment, ECommentMSG.SUCCESS_CREATE, EStatusCodes.SUCCESS_CREATE);
    } catch (error) {
        return handleModelErrors(error);
    }
};

/**
 * new comment by admins and sellers from admin panel
 * @param data data to save
 * @param userId creator user id
 * @returns `IArticleCommentResult`
 */
export const createCommentByAdmins = async (data: IPreArticleComment, userId: string) => {
    // check user id
    const user = await User.findById(userId);
    if (!user) return ArticleCommentResult.singleError("user", ECommentMSG.USER_NOT_FOUND, EStatusCodes.CONFLICT);

    // check user permission
    if (!editPermission(user)) return ArticleCommentResult.singleError("user", ECommentMSG.NO_PERMISSION, EStatusCodes.FORBIDDEN);

    // set user for creating comment
    data.user = user._id.toString();

    try {
        const comment = await ArticleComment.create(data);

        return ArticleCommentResult.success(comment, ECommentMSG.SUCCESS_CREATE, EStatusCodes.SUCCESS_CREATE);
    } catch (error) {
        return handleModelErrors(error);
    }
};

/**
 * edit comment
 * @param commentId comment id
 * @param data data to update
 * @param editorId editor user id
 * @returns `IArticleCommentResult`
 */
export const editComment = async (commentId: string, data: IOptArticleComment, editorId: string) => {
    // check if user exist
    const user = await User.findById(editorId);
    if (!user) return ArticleCommentResult.singleError("user", ECommentMSG.USER_NOT_FOUND, EStatusCodes.CONFLICT);

    // check user if user is not seller then set state to waiting
    if (!editPermission(user)) {
        // clear state
        data.state = ECommentState.WAITING;
    }

    try {
        const newComment = await ArticleComment.findByIdAndUpdate(commentId, data, { new: true });

        // check if comment exist
        if (!newComment) return ArticleCommentResult.singleError("commentId", ECommentMSG.COMMENT_NOT_FOUND, EStatusCodes.NOT_FOUND);

        return ArticleCommentResult.success(newComment, ECommentMSG.SUCCESS_EDIT, EStatusCodes.SUCCESS);
    } catch (error) {
        return handleModelErrors(error);
    }
};

/**
 * delete comment
 * @param commentId comment id
 * @param editorId editor user id
 * @returns `IArticleCommentResult`
 */
export const deleteComment = async (commentId: string, editorId: string) => {
    // check if user exist
    const user = await User.findById(editorId);
    if (!user) return ArticleCommentResult.singleError("user", ECommentMSG.USER_NOT_FOUND, EStatusCodes.CONFLICT);

    const comment = await ArticleComment.findById(commentId).populate("children");

    // check if comment exist
    if (!comment) return ArticleCommentResult.singleError("commentId", ECommentMSG.COMMENT_NOT_FOUND, EStatusCodes.NOT_FOUND);

    // check editor permission
    if (user._id.toString() !== comment.user && !editPermission(user)) {
        ArticleCommentResult.singleError("editor", ECommentMSG.NO_PERMISSION, EStatusCodes.FORBIDDEN);
    }

    try {
        // delete comment from db
        await comment.deleteOne();

        // change state of all comment children
        if (comment.children) {
            for (const child of comment.children) {
                await ArticleComment.findByIdAndUpdate(child._id, {state: ECommentState.PARENT_DELETED})
            }
        }

        return ArticleCommentResult.success(comment, ECommentMSG.SUCCESS_DELETE, EStatusCodes.SUCCESS);
    } catch (error) {
        return handleModelErrors(error);
    }
};
