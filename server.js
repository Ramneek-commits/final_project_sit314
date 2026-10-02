const express = require("express");

const app = express();
const PORT = 3003;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        service: "SmartStock Warehouse Service",
        status: "running"
    });
});

app.post("/replenishment", (req, res) => {

    const data = req.body;

    if (!data.productID || data.quantity === undefined) {
        return res.status(400).json({
            message: "Invalid replenishment request"
        });
    }

    const targetStock = 40;

    const replenishmentQuantity =
        Math.max(targetStock - data.quantity, 0);

    const request = {
        storeID: data.storeID,
        productID: data.productID,
        productName: data.productName,
        currentQuantity: data.quantity,
        targetQuantity: targetStock,
        replenishmentQuantity: replenishmentQuantity,
        status: "PENDING",
        createdAt: new Date().toISOString()
    };

    console.log("-----------------------------------");
    console.log(" SMARTSTOCK WAREHOUSE REQUEST");
    console.log("-----------------------------------");
    console.log(`Store: ${request.storeID}`);
    console.log(`Product: ${request.productName}`);
    console.log(`Current Quantity: ${request.currentQuantity}`);
    console.log(`Target Quantity: ${request.targetQuantity}`);
    console.log(
        `Replenishment Quantity: ${request.replenishmentQuantity}`
    );
    console.log(`Status: ${request.status}`);
    console.log("");

    res.status(201).json({
        message: "Replenishment request created",
        request: request
    });
});

app.listen(PORT, () => {
    console.log("-----------------------------------");
    console.log(" SmartStock Warehouse Service");
    console.log("-----------------------------------");
    console.log(`Service running on port ${PORT}`);
});