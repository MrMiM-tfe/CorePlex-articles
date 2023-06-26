import { ArticleMSG, EArticleMSG } from "../messages/article";
import { TypedResult } from "@/core/types/Result";
import { IResultType } from "@/core/types/general";

// article types --------------------------------------------------------
export enum EArticleStates {
    PUBLISHED = "published",
    DRAFT = "draft",
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
    data?: IArticle;
    message?:ArticleMSG
}

export const ArticleResult = new TypedResult<IArticleResult, IArticle, ArticleMSG>()