import {Router} from "express";
const router = Router()

// middlewares
import { protect, sellerCheck } from "@/core/middlewares/auth";

import * as main from "../controllers/main";
import * as category from "../controllers/category";
import * as comment from "../controllers/comment";

// comment routes --------------------------------------------------
router.get("/comment/article/:slug", comment.singleArticle)
router.get("/comment/:id", comment.singleComment)
// comment authenticated routes
router.post("/comment", protect, comment.create) // authenticated
router.put("/comment/:id", protect, comment.edit) // authenticated
router.delete("/comment/:id", protect, comment.del) // authenticated
// comment seller perm routes
router.get("/comment", sellerCheck, comment.index) // seller perm

// category routes --------------------------------------------------
router.get("/category", category.index)
router.get("/category/:slug", category.single)
// category protected routes
router.post("/category", sellerCheck, category.create)
router.put("/category/:slug", sellerCheck, category.edit)
router.delete("/category/:slug", sellerCheck, category.del)

// main routes ------------------------------------------------------
router.get("/", main.index)
router.get("/:slug", main.singleArticle)
// main protected routes
router.post("/", sellerCheck, main.create)
router.put("/:slug", sellerCheck, main.edit)
router.delete("/:slug", sellerCheck, main.del)

export default router