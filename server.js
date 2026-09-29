const express = require("express");
require("dotenv").config({ quiet: true });

const RequestRepository = require("./repositories/RequestRepository");
const RequestService = require("./services/RequestService");
const RequestController = require("./controllers/RequestController");

const app = express();
app.use(express.json());

const repository = new RequestRepository();
const service = new RequestService(repository);
const controller = new RequestController(service);

app.get("/", (req, res) => {
    res.status(200).json({
        message: "CivicConnect API is running"
    });
});

app.get("/api/requests",controller.getRequests.bind(controller));
app.post("/api/requests",controller.createRequest.bind(controller));

app.get("/api/requests/:id",controller.getRequestById.bind(controller));
app.put("/api/requests/:id",controller.updateRequest.bind(controller));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`CivicConnect server running on port ${PORT}`);
});