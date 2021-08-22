const mongoose = require("mongoose");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground")

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 300; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const camp = new Campground({
            //YOUR USER ID
            author: "60d8b265623f0e0f5464d092",
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Minima, adipisci exercitationem provident quam obcaecati inventore commodi officiis debitis at ex voluptatibus praesentium, reiciendis nihil quis quibusdam optio! At, impedit dolores.",
            price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/dfatnkoax/image/upload/v1627322158/YelpCamp/pmnlamqa2g72ve6f0kuc.png',
                    filename: 'YelpCamp/pmnlamqa2g72ve6f0kuc'
                },
                {
                    url: 'https://res.cloudinary.com/dfatnkoax/image/upload/v1627322159/YelpCamp/gp7datgk0xqcpp7a45qi.png',
                    filename: 'YelpCamp/gp7datgk0xqcpp7a45qi'
                }
            ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});