import { findDocByIdentity, getPageData, handleModelErrors } from "@/core/helpers/general"
import ArticleCategory from "../models/ArticleCategory"
import { ArticleCategoryResult, IArticleCategoryResult, IOptArticleCategory, IPreArticleCategory } from "../types/articleCategory"
import { ECategoryMSG } from "../messages/category"
import { EResultTypes, EStatusCodes } from "@/core/types/general"
import User from "@/core/models/User"
import { ERole } from "@/core/types/user"
import { editPermission } from "@/core/helpers/auth"

/**
 * get category and it's items
 * @param identity category slug or id
 * @returns `IArticleCategoryResult`
 */
export const getCategory = async (identity: string) => {
    // get and check category
    const category = await findDocByIdentity(identity, ArticleCategory, "articles")
    if (!category) return ArticleCategoryResult.singleError("category", ECategoryMSG.CATEGORY_NOT_FOUND, EStatusCodes.NOT_FOUND)

    return ArticleCategoryResult.success(category, ECategoryMSG.SUCCESS, EStatusCodes.SUCCESS)
}

/**
 * get all articles
 * @param page page number
 * @param limit per page limit
 * @param motherIdentity slug or id of mother
 * @returns `IArticleCategoryResult`
 */
export const getCategories = async (
    page: number = 1,
    limit: number = 10,
    motherIdentity?: string
) => {
    // generate number of products need to be skip base on page and limit
    const skip = (page - 1) * limit;

    // generate filter object (filter by mother of category)
    const filterObj: any = {}
    if (motherIdentity) {

        const motherCat = await findDocByIdentity(motherIdentity, ArticleCategory)
        if (motherCat) {
            filterObj["mother"] = motherCat._id?.toString()
        }
    }

    try {
        // get categories
        const categories = await ArticleCategory.find(filterObj)
            .skip(skip)
            .limit(limit).populate("articles")


        // get total number of categories
        const totalCategories = await ArticleCategory.countDocuments(filterObj)

        // get page data
        const pageData = getPageData(page, limit, totalCategories)

        // create result
        const res: IArticleCategoryResult = {
            type: EResultTypes.SUCCESS,
            status: EStatusCodes.SUCCESS,
            data: categories,
            pageData,
        }

        return res
    } catch (error) {
        return handleModelErrors(error)
    }
};

/**
 * create new category
 * @param data data to save
 * @param creatorId creator user id
 * @returns `IArticleCategoryResult`
 */
export const createCategory = async (
    data: IPreArticleCategory,
    creatorId: string
) => {
    // check if creator exist
    const user = await User.findById(creatorId);
    if (!user) {
        return ArticleCategoryResult.singleError(
            "user",
            ECategoryMSG.USER_NOT_FOUND,
            EStatusCodes.CONFLICT
        );
    }

    // check creator permission
    if (user.role !== ERole.SELLER && user.role !== ERole.ADMIN) {
        return ArticleCategoryResult.singleError(
            "user",
            ECategoryMSG.NO_PERMISSION,
            EStatusCodes.FORBIDDEN
        );
    }

    try {
        const category = await ArticleCategory.create(data);

        return ArticleCategoryResult.success(
            category,
            ECategoryMSG.SUCCESS_CREATE,
            EStatusCodes.SUCCESS_CREATE
        );
    } catch (error) {
        return handleModelErrors(error)
    }
};

/**
 * edit category
 * @param identity category slug or id
 * @param data data to update
 * @param editorId editor user id
 * @returns `IArticleCategoryResult`
 */
export const editCategory = async (
    identity: string,
    data: IOptArticleCategory,
    editorId: string
) => {
    // check if user exist
    const user = await User.findById(editorId);
    if (!user)
        return ArticleCategoryResult.singleError(
            "user",
            ECategoryMSG.EDITOR_NOT_FOUND,
            EStatusCodes.CONFLICT
        );

    // check editor permission
    if (!editPermission(user))
        return ArticleCategoryResult.singleError(
            "user",
            ECategoryMSG.NO_PERMISSION,
            EStatusCodes.FORBIDDEN
        );

    // get Category by identity and check it
    const category = await findDocByIdentity(identity,ArticleCategory);
    if (!category)
        return ArticleCategoryResult.singleError(
            "category",
            ECategoryMSG.CATEGORY_NOT_FOUND,
            EStatusCodes.NOT_FOUND
        );

    try {
        // update category
        const newCategory = await category.updateOne(data, {new: true});

        return ArticleCategoryResult.success(
            newCategory,
            ECategoryMSG.SUCCESS_EDIT,
            EStatusCodes.SUCCESS
        );
    } catch (error) {
        return handleModelErrors(error)
    }
};

/**
 * delete category
 * @param identity category slug or id
 * @param editorId editor user id
 * @returns `IArticleCategoryResult`
 */
export const deleteCategory = async (identity: string, editorId: string) => {
    // check if user exist
    const user = await User.findById(editorId);
    if (!user)
        return ArticleCategoryResult.singleError(
            "user",
            ECategoryMSG.EDITOR_NOT_FOUND,
            EStatusCodes.CONFLICT
        );

    // check editor permission
    if (!editPermission(user))
        return ArticleCategoryResult.singleError(
            "user",
            ECategoryMSG.NO_PERMISSION,
            EStatusCodes.FORBIDDEN
        );

    // get Category by identity and check it
    const category = await findDocByIdentity(identity,ArticleCategory);
    if (!category)
        return ArticleCategoryResult.singleError(
            "category",
            ECategoryMSG.CATEGORY_NOT_FOUND,
            EStatusCodes.NOT_FOUND
        );

    try {
        // delete category
        const deletedCategory = await category.deleteOne();
        return ArticleCategoryResult.success(
            deletedCategory,
            ECategoryMSG.SUCCESS_DELETE,
            EStatusCodes.SUCCESS
        );
    } catch (error) {
        return handleModelErrors(error)
    }
};
