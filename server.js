const express = require('express');
const app = express();
const productsRoutes = require("./routes/products");
const userRoutes = require("./routes/users");
require('dotenv').config();
const cors = require('cors');

const PORT = process.env.PORT || 5054;
const CLIENT_URL = process.env.CLIENT_URL;

app.use(cors({
    origin: process.env.CLIENT_URL
})); // Just put it at the top, because they run in order. 
// The order of the middle ware matters.
// Express json to enable us to use the request body
app.use(express.json());

app.use(express.static("./assets"));

// url : "images/image_name.extension"

app.get("/", (req, res) => {
    res.redirect("/products");
})
app.use("/products", productsRoutes);
app.use("/users", userRoutes);

app.listen(PORT, () => {
    console.log("App has started! 🚀 on " + PORT);
})