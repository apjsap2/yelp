const mongoose = require('mongoose')
const Review = require('./review')
const Schema = mongoose.Schema

const CampgroundSchema = Schema({
    title: String,
    price: Number,
    image: String,
    description: String,
    location: String,
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
})

CampgroundSchema.post('findOneAndDelete', async function(campground) {
    if (campground.reviews.length) {
        await Review.deleteMany({_id: {$in: campground.reviews}})
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema)


