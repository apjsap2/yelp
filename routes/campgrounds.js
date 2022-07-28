const express = require('express')
const router = express.Router()

const { campgroundSchema } = require('../schemas')
const Campground = require('../models/campground')
const catchAsync = require('../utils/catchAsync')
const ExpressError = require('../utils/ExpressError')
const flash = require('connect-flash')
router.use(flash())

const validateCampground = (req, res, next) => {
	const { error } = campgroundSchema.validate(req.body)
	if (error) {
		const message = error.details.map(el => el.message).join(',')
		throw new ExpressError(message, 400)
	} else {
		next()
	}
}



router.get('/', async (req, res) => {
	const campgrounds = await Campground.find({})
	res.render('campgrounds/index', { campgrounds })
})


// new.ejs에서 post 시킨 Model을 받아와 db에 저장하는 미들웨어
router.post('/', validateCampground, catchAsync(async (req, res, next) => {
		// if (!req.body.campground) throw new ExpressError('Invalis Campground Data', 400)
		const campground = new Campground(req.body.campground)
		await campground.save()
		req.flash('success', 'Successfully made a new campground!!')
		res.redirect(`/campgrounds/${campground._id}`)
}))

router.get('/new', (req, res) => {
	res.render('campgrounds/new')
})

router.get('/:idddd', catchAsync(async (req, res) => {
	const campground = await Campground.findById(req.params.idddd).populate('reviews')
	res.render('campgrounds/show', {campground})
}))


router.get('/:id/edit', catchAsync(async (req, res) => {
	const { id } = req.params
	const campground = await Campground.findById(id)
	res.render('campgrounds/edit', {campground})
}))


//edit.ejs에서 put 시킨 Model을 가져와 db를 업데이트 하는 미들웨어
router.put('/:id', validateCampground, catchAsync(async (req, res) => {
	const { id } = req.params
	const campground = await Campground.findByIdAndUpdate(id, req.body.campground)
	req.flash('success', 'Successfully updated campground!')
	res.redirect(`/campgrounds/${campground._id}`)
}))

router.delete('/:id', catchAsync(async (req, res) => {
	const { id } = req.params
	await Campground.findByIdAndDelete(id)
	req.flash('success', 'Successfully deleted campground!')
	res.redirect('/campgrounds')
}));

module.exports = router