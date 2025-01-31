import { ECoreMSG } from "@/core/messages/general";

export enum EArticleMSG {
    SUCCESS = "Article found successfully",
    SUCCESS_CREATE = "Article created successfully",
    SUCCESS_EDIT = "Article edited successfully",
    SUCCESS_DELETE = "Article deleted successfully",
    CAN_CREATE_ARTICLE = "can not create Article",
    USER_NOT_FOUND = "user not found",
    AUTHOR_NOT_FOUND = "author not found",
    ARTICLE_NOT_FOUND = "Article not found",
    EDITOR_NOT_FOUND = "editor not found",
    NO_PERMISSION = " no permission",
    NEW_AUTHOR_IS_NOT_VALID = "new author do not have permission to have article"

};

export type ArticleMSG = EArticleMSG | ECoreMSG