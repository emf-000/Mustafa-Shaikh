const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

main()
.then(()=>{
    console.log("Connected to DB");
})
.catch((err) =>{
    console.log(err)
});

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async () => {
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj) => ({...obj, owner: "681ad863f5a6764943e2ec39"}))
    await Listing.insertMany(initdata.data);
    console.log("data was initialize");
}

initDB();

