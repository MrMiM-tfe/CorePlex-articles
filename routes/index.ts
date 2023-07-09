import {Router} from "express";
const router = Router()


import { sellerCheck } from "@/core/middlewares/auth";

import * as main from "../controllers/main";
import * as category from "../controllers/category";

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