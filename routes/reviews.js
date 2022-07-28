const express = require('express')
const router = express.Router({mergeParams: true})


const {reviewSchema } = require('../schemas')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const Review = require('../models/review')
const Campground = require('../models/campground')

const validateReview = (req, res, next) => {
	const { error } = reviewSchema.validate(req.body)
	if (error) {
		const message = error.details.map(el => el.message).join(',')
		throw new ExpressError(message, 400)
	} else {
		next()
	}
}

router.post('/reviews', validateReview, catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.id)
	const review = new Review(req.body.review)
	campground.reviews.push(review)
	await review.save()
	await campground.save()
	req.flash('success', 'Created new review!')
	res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/reviews/:reviewId', catchAsync( async (req, res) => {
	const { id, reviewId } = req.params
	await Review.findByIdAndDelete(reviewId)
	await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}})
	req.flash('success', 'Successfully deleted review!')
	res.redirect(`/campgrounds/${id}`)
}))



module.exports = router