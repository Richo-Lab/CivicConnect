const express = require("express");

const RequestRepository =
    require("./repositories/RequestRepository");

const RequestService =
    require("./services/RequestService");

const RequestController =
    require("./controllers/RequestController");

const app = express();

app.use(express.json());

const repository = new RequestRepository();
const service = new RequestService(repository);
const controller = new RequestController(service);

app.get("/", (req, res) => {
    res.json({
        message: "CivicConnect API is running"
    });
});

app.get(
    "/api/requests",
    controller.getRequests.bind(controller)
);

app.post(
    "/api/requests",
    controller.createRequest.bind(controller)
);

app.listen(3000, () => {
    console.log("CivicConnect server running on port 3000");
});