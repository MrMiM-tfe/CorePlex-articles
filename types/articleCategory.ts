import { Types } from "mongoose";
import { Response } from "express";
import { IResultType } from "@/core/types/general";
import { TypedResult } from "@/core/types/Result";
import { IArticle } from "./article";
import { ECategoryMSG } from "../messages/category";

export interface IPreArticleCategory {
    name:string,
    slug?:string,
    mother?:string,
    des?:string
}

export interface IArticleCategory extends IPreArticleCategory {
    _id: Types.ObjectId,
    slug:string,
    articles?: IArticle[]
}

export interface IOptArticleCategory extends Partial<IArticleCategory> {}

// article category result types --------------------------------------------------------
export interface IArticleCategoryResult extends IResultType {
    data?: IArticleCategory | IArticleCategory[];
    message?:ECategoryMSG
}

export const ArticleCategoryResult = new TypedResult<IArticleCategoryResult, IArticleCategory, ECategoryMSG>()

// article category response types ------------------------------------------------------
export interface IArticleCategoryResponse extends IArticleCategoryResult {
}

export const ArticleCategoryResponse = (res: Response, result: IResultType) => {
    const resp: IArticleCategoryResponse = result as IArticleCategoryResponse

    return res.status(resp.status).json(resp)
}
