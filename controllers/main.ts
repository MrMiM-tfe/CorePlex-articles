import {Request, Response} from "express";
import { ArticleResponse, ESortingOptions, IOptArticle, IPreArticle } from "../types/article";
import { createArticle, deleteArticle, editArticle, getArticle, getArticles } from "../services/article.service";

export const index = async (req: Request, res: Response) => {
    const page = Number(req.query.page) ?? 1;
    const limit = Number(req.query.limit) ?? 10;

    const sortStringList = req.body.sort?.split(",");

    // validate sort
    let sort = undefined;
    if (sortStringList) {
        sort = [];
        sortStringList.map((sortString: string) => {
            sort.push(
                ESortingOptions[sortString as keyof typeof ESortingOptions]
            );
        });
    }

    const result = await getArticles(page, limit, {sort});

    return ArticleResponse(res, result)
};

export const create = async (req: Request, res: Response) => {
    const data = req.body as IPreArticle;

    const result = await createArticle(data, req.user?._id.toString() as string);

    return ArticleResponse(res, result);
};

export const edit = async (req: Request, res: Response) => {
    const slug = req.params.slug;
    const data = req.body as IOptArticle;
    const userId = req.user?._id.toString() as string;

    const result = await editArticle(slug, data, userId);

    return ArticleResponse(res, result);
};

export const del = async (req: Request, res: Response) => {

    const slug = req.params.slug
    const userId = req.user?._id.toString() as string

    const result = await deleteArticle(slug, userId)

    return ArticleResponse(res, result);
}

export const singleArticle = async (req: Request, res: Response) => {

    const slug = req.params.slug

    const result = await getArticle(slug)

    return ArticleResponse(res, result);
}