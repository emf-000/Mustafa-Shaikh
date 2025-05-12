const express = require("express");
const router = express.Router({mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/Expresserror.js");
const {validateReview, isLoggedIn,isReviewAuthor} = require("../middlewares.js");
const controllerReview = require("../controller/review.js");

//Post Review Route
router.post("/",isLoggedIn, validateReview, wrapAsync(controllerReview.createReview))

//Delete Review Route
router.delete("/:reviewId", isLoggedIn, isReviewAuthor,wrapAsync(controllerReview.destroyReview))



module.exports = router;