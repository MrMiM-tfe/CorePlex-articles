import { TypedResult } from "@/core/types/Result";
import { IResultType } from "@/core/types/general";
import { Types } from "mongoose"
import { ECommentMSG } from "../messages/comment";
import { Response } from "express";

export interface ICommentFilter {
    user?:string,
    state?:string,
    article?:string
}

export enum ECommentSortOptions {
    NEWEST_FIRST = '-createdAt',
    OLDEST_FIRST = 'createdAt',
}

export enum ECommentState {
    ACCEPTED = "accepted",
    REJECTED = "rejected",
    WAITING = "waiting",
    PARENT_DELETED = "parent_deleted",
}

export interface IPreArticleComment {
    title:string,
    body:string,
    article:string,
    user?:string,
    parent?:string,
}

export interface IArticleComment extends IPreArticleComment{
    _id: Types.ObjectId
    state: ECommentState,
    children?: IArticleComment[]
}

export interface IOptArticleComment extends Partial<Omit<IArticleComment, "article" | "user">> {}

// article category result types --------------------------------------------------------
export interface IArticleCommentResult extends IResultType {
    data?: IArticleComment | IArticleComment[];
    message?:ECommentMSG
}

export const ArticleCommentResult = new TypedResult<IArticleCommentResult, IArticleComment, ECommentMSG>()

// article category response types ------------------------------------------------------
export interface IArticleCommentResponse extends IArticleCommentResult {
}

export const ArticleCommentResponse = (res: Response, result: IResultType) => {
    const resp: IArticleCommentResponse = result as IArticleCommentResponse

    return res.status(resp.status).json(resp)
}
