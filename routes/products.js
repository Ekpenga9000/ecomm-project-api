const express = require("express");
const router = express.Router(); 
const fs = require('fs');


const productPath = "./data/products.json"; // brief products list 
const productsDetailsPath = "./data/productsDetails.json"; // detailed products list
const getProducts = (fileData) => {
    return JSON.parse(fs.readFileSync(fileData));
}


const filterData = (arr, queryParam) => {
    arr = arr.filter(item => item.queryParam === queryParam);
    return arr;
}

// Home page response
router
    .route("/")
    .get((req, res) => {
    const productsList = getProducts(productPath);
    res.status(200).json(productsList);
    })

    .get((req, res) => {
        const productsList = getProducts(productPath); 
        let filteredProductsData = productsList;

        if (req.query.brand) {
            filteredProductsData = filterData(filteredProductsData, req.query.brand);
        }

        if (req.query.type) {
            filteredProductsData = filteredProductsData.filter(product => product.type === req.query.type);
        }

        if (req.query.size) {
            filteredProductsData = filterData(filteredProductsData, req.query.size);
        }

        if (req.query.name) {
            filteredProductsData = filterData(filteredProductsData, req.query.name);
        }

        if (req.query.category) {
            filteredProductsData = filteredProductsData.filter(product => product.category === req.query.category);
            
        }
        if (req.query.color) {
            filteredProductsData = filterData(filteredProductsData, req.query.color);
        }
     
        console.log("The Category", req.query.category);
        res.status(200).json(filteredProductsData);
})

router.get("/:productid", (req, res) => {
    const productid = req.params.productid;
    const productsList = getProducts(productsDetailsPath);
    const theProduct = productsList.filter(product => product.id === productid);

    if (!theProduct) {
        res.status(404).json({error:"Product not found"})
    }

    res.status(200).json(theProduct);
})


module.exports = router;