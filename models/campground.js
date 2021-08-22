const mongoose = require("mongoose");
const Review = require("./review");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual("thumbnail").get(function () {
    return this.url.replace("/upload", "/upload/w_200");
});

const opts = { toJSON: { virtuals: true } }

const CampgroundSchema = new Schema({
	title: {
        type: String,
        required: "Game title cannot be blank"
    },
    images: [ImageSchema],
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    slug: {
        type: String,
        unique: true
    }
}, opts);

CampgroundSchema.virtual("properties.popUpMarkup").get(function () {
    return `
    <strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>
`;
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
});

// add a slug before the campground gets saved to the database
CampgroundSchema.pre("save", async function (next) {
    try {
        // check if a new campground is being saved, or if the campground name is being modified
        if (this.isNew || this.isModified("title")) {
            this.slug = await generateUniqueSlug(this._id, this.title);
        }
        next();
    } catch (err) {
        next(err);
    }
});

const Campground = mongoose.model("Campground", CampgroundSchema);
module.exports = Campground;

async function generateUniqueSlug(id, campgroundTitle, slug) {
    try {
        // generate the initial slug
        if (!slug) {
            slug = slugify(campgroundTitle);
        }
        // check if a campground with the slug already exists
        let campground = await Campground.findOne({ slug: slug });
        // check if a campground was found or if the found campground is the current campground
        if (!campground || campground._id.equals(id)) {
            return slug;
        }
        // if not unique, generate a new slug
        let newSlug = slugify(campgroundTitle);
        // check again by calling the function recursively
        return await generateUniqueSlug(id, campgroundTitle, newSlug);
    } catch (err) {
        throw new Error(err);
    }
}

function slugify(text) {
    let slug = text.toString().toLowerCase()
        .replace(/\s+/g, '-')        // Replace spaces with -
        .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
        .replace(/\-\-+/g, '-')      // Replace multiple - with single -
        .replace(/^-+/, '')          // Trim - from start of text
        .replace(/-+$/, '')          // Trim - from end of text
        .substring(0, 75);           // Trim at 75 characters
    return slug + "-" + Math.floor(1000 + Math.random() * 9000);  // Add 4 random digits to improve uniqueness
}