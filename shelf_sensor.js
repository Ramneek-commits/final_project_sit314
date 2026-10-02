const http = require("http");

// Virtual supermarket shelf sensors
const products = [
    {
        sensorID: "SENSOR-001",
        storeID: "STORE-01",
        shelfID: "SHELF-01",
        productID: "P101",
        productName: "Milk"
    },
    {
        sensorID: "SENSOR-002",
        storeID: "STORE-01",
        shelfID: "SHELF-02",
        productID: "P102",
        productName: "Bread"
    },
    {
        sensorID: "SENSOR-003",
        storeID: "STORE-01",
        shelfID: "SHELF-03",
        productID: "P103",
        productName: "Eggs"
    },
    {
        sensorID: "SENSOR-004",
        storeID: "STORE-01",
        shelfID: "SHELF-04",
        productID: "P104",
        productName: "Juice"
    },
    {
        sensorID: "SENSOR-005",
        storeID: "STORE-01",
        shelfID: "SHELF-05",
        productID: "P105",
        productName: "Yogurt"
    }
];

function generateReading(product) {
    return {
        sensorID: product.sensorID,
        storeID: product.storeID,
        shelfID: product.shelfID,
        productID: product.productID,
        productName: product.productName,
        quantity: Math.floor(Math.random() * 41),
        temperature: Number((2 + Math.random() * 5).toFixed(1)),
        timestamp: new Date().toISOString()
    };
}

function sendReading(reading) {

    const data = JSON.stringify(reading);

    const options = {
        hostname: "127.0.0.1",
        port: 1880,
        path: "/smartstock/inventory",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(data)
        }
    };

    const req = http.request(options, (res) => {

        console.log(
            `${reading.sensorID} -> ${reading.productName} | ` +
            `Qty: ${reading.quantity} | ` +
            `Temp: ${reading.temperature}°C | ` +
            `HTTP: ${res.statusCode}`
        );

        // Consume the response so the connection can close cleanly
        res.resume();
    });

    req.on("error", (error) => {
        console.error("Node-RED connection error:", error.message);
    });

    req.write(data);
    req.end();
}

// Generate readings every 5 seconds
setInterval(() => {

    console.log("\n----- SMARTSTOCK SENSOR CYCLE -----");

    products.forEach((product) => {
        const reading = generateReading(product);
        sendReading(reading);
    });

}, 5000);