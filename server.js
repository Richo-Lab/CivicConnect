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

app.get("/api/requests",
controller.getRequests.bind(controller));

app.get("/api/requests/:id",
controller.getRequest.bind(controller));

app.post("/api/requests",
controller.createRequest.bind(controller));

app.put("/api/requests/:id/assign",
controller.assignRequest.bind(controller));

app.put("/api/requests/:id/status",
controller.updateStatus.bind(controller));

app.post("/api/requests/:id/comments",
controller.addComment.bind(controller));

app.put("/api/requests/:id/resolve",
controller.resolveRequest.bind(controller));

app.get("/api/report",
controller.getReport.bind(controller));

app.listen(3000, () => {

    console.log(
        "CivicConnect server running on port 3000"
    );

});
