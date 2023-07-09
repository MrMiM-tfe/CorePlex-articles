import {Request, Response} from "express";
import {createCategory, deleteCategory, editCategory, getCategories, getCategory} from "../services/category.service";
import {SendResponse} from "@/core/types/general";
import {IOptArticleCategory, IPreArticleCategory} from "../types/articleCategory";

export const index = async (req: Request, res: Response) => {
    const page = Number(req.query.page) ?? 1;
    const limit = Number(req.query.limit) ?? 10;
    const mother = req.query.mother as string | undefined

    const result = await getCategories(page, limit, mother)

    return SendResponse(res, result)
}

export const single = async (req: Request, res: Response) => {
    const slug = req.params.slug

    const result = await getCategory(slug)

    return SendResponse(res, result)
}

export const create = async (req: Request, res: Response) => {
    const data = req.body as IPreArticleCategory

    const result = await createCategory(data, req.user?._id.toString() as string)

    return SendResponse(res, result)
}

export const edit = async (req: Request, res: Response) => {
    const slug = req.params.slug
    const data = req.body as IOptArticleCategory

    const result = await editCategory(slug, data, req.user?._id.toString() as string)

    return SendResponse(res, result)
}

export const del = async (req: Request, res: Response) => {
    const slug = req.params.slug

    const result = await deleteCategory(slug, req.user?._id.toString() as string)

    return SendResponse(res, result)
}