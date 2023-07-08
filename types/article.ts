import { ArticleMSG } from "../messages/article";
import { TypedResult } from "@/core/types/Result";
import { IResultType } from "@/core/types/general";
import { Response } from "express";

// article types --------------------------------------------------------
export enum EArticleStates {
    PUBLISHED = "published",
    DRAFT = "draft",
}

export enum ESortingOptions {
    PRICE_HIGH_TO_LOW = '-price',
    PRICE_LOW_TO_HIGH = 'price',
    NEWEST_FIRST = '-createdAt',
    OLDEST_FIRST = 'createdAt',
    RATINGS_HIGH_TO_LOW = '-ratingsAverage',
    RATINGS_LOW_TO_HIGH = 'ratingsAverage',
    NAME_A_TO_Z = 'name',
    NAME_Z_TO_A = '-name',
}

export interface IPreArticle {
    name: string;
    slug?: string;
    authorId?: string;
    state?: EArticleStates;
    coverImage?: string;
    body?: string;
    categories?: string[];
}

export interface IArticle extends IPreArticle {
    slug:string;
    state: EArticleStates;
    body:string;
    authorId: string;
    ratingsAverage: number;
    ratingsQuantity: number;
}

export interface IOptArticle extends Partial<IArticle> {}

// article result types --------------------------------------------------------
export interface IArticleResult extends IResultType {
    data?: IArticle | IArticle[];
    message?:ArticleMSG
}

export const ArticleResult = new TypedResult<IArticleResult, IArticle, ArticleMSG>()

// article response types ------------------------------------------------------
export interface IArticleResponse extends IArticleResult {
}

export const ArticleResponse = (res: Response, result: IResultType) => {
    const resp: IArticleResponse = result as IArticleResponse

    return res.status(resp.status).json(resp)
}
