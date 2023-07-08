import {Router} from "express";
const router = Router()


import { sellerCheck } from "@/core/middlewares/auth";

import * as main from "../controllers/main";

// main routes ------------------------------------------------------
router.get("/", main.index)
router.get("/:slug", main.singleArticle)
// main protected routes
router.post("/", sellerCheck, main.create)
router.put("/:slug", sellerCheck, main.edit)
router.delete("/:slug", sellerCheck, main.del)

export default router