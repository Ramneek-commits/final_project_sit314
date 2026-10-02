const http = require("http");

// --------------------------------------------------
// SMARTSTOCK SCALABILITY / LOAD TEST
// --------------------------------------------------

// Number of requests and concurrency can be supplied
// from the terminal:
//
// node load_test.js 500 50
//
// 500 = total requests
// 50  = concurrent requests

const TOTAL_REQUESTS = parseInt(process.argv[2]) || 500;
const CONCURRENCY = parseInt(process.argv[3]) || 50;

// Products used by the simulated shelf sensors
const products = [
    "Milk",
    "Bread",
    "Eggs",
    "Juice",
    "Yogurt"
];

let completed = 0;
let successful = 0;
let failed = 0;
let activeRequests = 0;
let nextRequestId = 0;

const startTime = Date.now();

console.log("--------------------------------------------");
console.log(" SMARTSTOCK SCALABILITY / LOAD TEST");
console.log("--------------------------------------------");
console.log(`Requests:    ${TOTAL_REQUESTS}`);
console.log(`Concurrency: ${CONCURRENCY}`);
console.log("");

// --------------------------------------------------
// Create realistic SmartStock sensor reading
// --------------------------------------------------

function createPayload(id) {

    const productIndex = id % 5;

    return JSON.stringify({
        sensorID: `LOAD-${String(id).padStart(4, "0")}`,
        storeID: "STORE-01",
        shelfID: `SHELF-${String(productIndex + 1).padStart(2, "0")}`,
        productID: `P${101 + productIndex}`,
        productName: products[productIndex],
        quantity: Math.floor(Math.random() * 41),
        temperature: Number(
            (2 + Math.random() * 5).toFixed(1)
        ),
        timestamp: new Date().toISOString()
    });
}

// --------------------------------------------------
// Send one simulated IoT sensor request
// --------------------------------------------------

function sendRequest(id) {

    activeRequests++;

    const payload = createPayload(id);

    const options = {
        hostname: "127.0.0.1",
        port: 1880,

        // Same endpoint used by shelf_sensor.js
        path: "/smartstock/inventory",

        method: "POST",

        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload)
        }
    };

    const req = http.request(options, (res) => {

        // Consume response body
        res.resume();

        res.on("end", () => {

            // Any HTTP 2xx response counts as successful
            if (
                res.statusCode >= 200 &&
                res.statusCode < 300
            ) {
                successful++;
            } else {
                failed++;
            }

            requestFinished();
        });
    });

    req.on("error", (error) => {

        failed++;

        requestFinished();
    });

    req.write(payload);
    req.end();
}

// --------------------------------------------------
// Called whenever one request completes
// --------------------------------------------------

function requestFinished() {

    completed++;
    activeRequests--;

    // Display progress every 100 requests
    if (
        completed % 100 === 0 ||
        completed === TOTAL_REQUESTS
    ) {
        console.log(
            `Completed ${completed}/${TOTAL_REQUESTS}`
        );
    }

    // Start more requests while maintaining
    // the selected concurrency level
    startMoreRequests();

    // All requests finished
    if (completed === TOTAL_REQUESTS) {
        printResults();
    }
}

// --------------------------------------------------
// Maintain concurrency
// --------------------------------------------------

function startMoreRequests() {

    while (
        activeRequests < CONCURRENCY &&
        nextRequestId < TOTAL_REQUESTS
    ) {

        nextRequestId++;

        sendRequest(nextRequestId);
    }
}

// --------------------------------------------------
// Print final scalability results
// --------------------------------------------------

function printResults() {

    const totalTime = Date.now() - startTime;

    const successRate =
        (successful / TOTAL_REQUESTS) * 100;

    const throughput =
        TOTAL_REQUESTS / (totalTime / 1000);

    console.log("");
    console.log("========== TEST RESULTS ==========");
    console.log(
        `Total requests : ${TOTAL_REQUESTS}`
    );
    console.log(
        `Successful     : ${successful}`
    );
    console.log(
        `Failed         : ${failed}`
    );
    console.log(
        `Total time     : ${totalTime} ms`
    );
    console.log(
        `Success rate   : ${successRate.toFixed(2)}%`
    );
    console.log(
        `Throughput     : ${throughput.toFixed(2)} requests/sec`
    );
    console.log("==================================");
}

// --------------------------------------------------
// Start test
// --------------------------------------------------

startMoreRequests();