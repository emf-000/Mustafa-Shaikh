const Listing = require("../models/listing.js");
const fetch = require('node-fetch');

// Geocode location using Nominatim (OpenStreetMap)
async function getCoordinates(location) {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`;

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'WanderLustApp/1.0 (your-email@example.com)'
        }
    });

    const data = await response.json();

    if (data.length === 0) {
        throw new Error("Location not found.");
    }

    return {
        type: "Point",
        coordinates: [parseFloat(data[0].lon), parseFloat(data[0].lat)]
    };
}


module.exports.index = async (req,res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs",{allListings});
}

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req,res,next) => {
    let{id} = req.params;
    const listing = await Listing.findById(id)
    .populate({path:"reviews", populate : {path: "author"}})
    .populate("owner");
    if(!listing){
        req.flash("error", "Listing you requested does not exist!")
        return res.redirect("/listings")
    }
    console.log(listing);
    res.render("listings/show.ejs",{listing});
}

module.exports.createListing = async (req, res, next) => {
    try {
        const geometry = await getCoordinates(req.body.listing.location);

        const newListing = new Listing(req.body.listing);
        newListing.geometry = geometry;
        newListing.owner = req.user._id;

        if (req.file) {
            newListing.image = {
                url: req.file.path,
                filename: req.file.filename
            };
        }

        await newListing.save();
        req.flash("success", "New Listing Created!");
        res.redirect("/listings");
    } catch (err) {
        console.error("Geocoding error:", err);
        req.flash("error", "Failed to locate the address. Please try again.");
        res.redirect("/listings/new");
    }
};


 module.exports.renderEditForm = async (req , res) => {
     let{id} = req.params;
     const listing = await Listing.findById(id);
     if(!listing){
         req.flash("error", "Listing you requested does not exist!")
         return res.redirect("/listings")
     }
     let originalImageUrl = listing.image.url;
     originalImageUrl = originalImageUrl.replace("/upload", "/upload/,w_250")
     res.render("listings/edit.ejs", {listing, originalImageUrl});
 }

 module.exports.updateListing = async (req , res) => {
     let {id} = req.params;
     let listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
     if(typeof req.file !== "undefined") {
     let url = req.file.path;
     let filename = req.file.filename;
     listing.image = { url, filename };
     await listing.save();
     }
     req.flash("success", "Listing Updated!");
     res.redirect(`/listings/${id}`);
 }

 module.exports.destroyListing = async (req , res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success", "Listing Deleted!")
    res.redirect("/listings");
}

module.exports.searchListings = async (req, res) => {
    const query = req.query.q;

    if (!query) {
        req.flash("error", "Please enter a search term.");
        return res.redirect("/listings");
    }

    try {
        // Escape special characters from the query to prevent invalid regex
        const escapedQuery = query.replace(/[.*+?^=!:${}()|\[\]\/\\]/g, "\\$&");

        // Perform the search with escaped query
        const listings = await Listing.find({
            $or: [
                { title: { $regex: escapedQuery, $options: "i" } },
                { description: { $regex: escapedQuery, $options: "i" } },
                { location: { $regex: escapedQuery, $options: "i" } }
            ]
        }).limit(20); // You can adjust the limit as per your needs

        // Render results
        res.render("listings/index.ejs", { allListings: listings });

    } catch (err) {
        console.error(err);
        req.flash("error", "An error occurred while searching listings.");
        res.redirect("/listings");
    }
};

