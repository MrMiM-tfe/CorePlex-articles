import { Request, Response } from "express";
import { ECommentSortOptions, ICommentFilter, IOptArticleComment, IPreArticleComment } from "../types/articleComment";
import { createCommentByAdmins, deleteComment, editComment, getComment, getComments, getArticleComments, newComment } from "../services/comment.service";
import { SendResponse } from "@/core/types/general";
import { ERole } from "@/core/types/user";

export const index = async (req: Request, res: Response) => {
    const page = Number(req.query.page) ?? 1;
    const limit = Number(req.query.limit) ?? 10;

    const sort = ECommentSortOptions[req.query.sort as keyof typeof ECommentSortOptions]
    const filter = req.body as ICommentFilter;

    console.log(sort, filter)

    const result = await getComments(page, limit, {filter, sort})

    return SendResponse(res, result);
};

export const singleArticle = async (req: Request, res: Response) => {
    const slug = req.params.slug
    const page = Number(req.query.page) ?? 1;
    const limit = Number(req.query.limit) ?? 10;

    const result = await getArticleComments(slug, page, limit)

    return SendResponse(res, result)
}

export const singleComment = async (req: Request, res: Response) => {
    const id = req.params.id

    const result = await getComment(id)

    return SendResponse(res, result)
}

export const create = async (req: Request, res: Response) => {
    const data = req.body as IPreArticleComment

    if (req.user?.role === ERole.ADMIN || req.user?.role === ERole.SELLER) {
        const result = await createCommentByAdmins(data, req.user?._id.toString() as string)
        return SendResponse(res, result)
    }else {
        const result = await newComment(data, req.user?._id.toString() as string)
        return SendResponse(res, result)
    }
}

export const edit = async (req: Request, res: Response) => {
    const id = req.params.id
    const data = req.body as IOptArticleComment

    const result = await editComment(id, data, req.user?._id.toString() as string)

    return SendResponse(res, result)
}

export const del = async (req: Request, res: Response) => {
    const id = req.params.id

    const result = await deleteComment(id, req.user?._id.toString() as string)

    return SendResponse(res, result)
}