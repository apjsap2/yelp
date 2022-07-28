const express = require('express')
const app = express()
const path = require('path')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')
const ExpressError = require('./utils/ExpressError')
const mongoose = require('mongoose')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const session = require('express-session')
const flash = require('connect-flash')

mongoose.connect('mongodb://localhost:27017/yelp-camp')
	.then(() => {
		console.log('MONGO CONNECTION OPEN!!')
	})
	.catch(err => {
		console.log('OH NO, mongo ERROR!!')
		console.log(err)
	})

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'))
app.engine('ejs', ejsMate)
app.use(flash())


const sessionConfig = {
	secret: 'thisshouldbebettersecret!',
	resave: false,
	saveUninitialized: true,
	cookie: {
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
		httpOnly: true
	}
}
app.use(session(sessionConfig))


app.use((req, res, next) => {
	res.locals.success = req.flash('success')
	next()
})


app.get('/', (req, res) => {
    res.render('home')
})


app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id', reviewRoutes)


//정의되지 않은 라우트 접근시 보낼 오류
app.all('*', (req, res, next) => {
	next(new ExpressError('Page Not Found', 404))
})


app.use((err, req, res, next) => {
	const { status = 500 } = err;
	if (!err.message) err.message = 'Oh no! Something went wrong!'
	res.status(status).render('./partials/error', { err })
})

app.listen(3000, () => {
    console.log('Express listening on 3000')
})


