/**
 * CivicConnect web client (Express + EJS).
 *
 * A thin, server-rendered front end for the CivicConnect REST API. It holds
 * no business rules: every rule (roles, status workflow, validation) is
 * enforced by the API. The login token returned by the API is kept in a
 * server-side session and is never exposed to browser JavaScript.
 *
 * NOTE: role checks here only decide what the UI shows. The API is the
 * security boundary.
 */
require("dotenv").config({ quiet: true });

const path = require("path");
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");

const PORT = process.env.PORT || 3001;
const API_URL = (process.env.API_URL || "http://localhost:3000").replace(/\/+$/, "");
const SESSION_SECRET = process.env.SESSION_SECRET;

if (!SESSION_SECRET) {
    console.error("SESSION_SECRET is not set. Copy .env.example to .env and set it.");
    process.exit(1);
}

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: false, limit: "16kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production",
            maxAge: 60 * 60 * 1000 // matches the API token lifetime (1 hour)
        }
    })
);

// ---------------------------------------------------------------- helpers

app.locals.fmtDate = value => 
    value ? new Date(value).toLocaleString("en-ZA", { dateStyle: "medium", timeStyle: "short" }) : "-";

app.locals.badge = status =>
    `badge badge-${String(status).replace(/\s+/g, "-").toLowerCase()}`;

// Per-session CSRF token, checked on every POST.
app.use((req, res, next) => {
    if (!req.session.csrf) {
        req.session.csrf = crypto.randomBytes(24).toString("hex");
    }
    res.locals.csrf = req.session.csrf;
    res.locals.user = req.session.user || null;
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;
    next();
});

app.use((req, res, next) => {
    if (req.method !== "POST") return next();
    const sent = Buffer.from(String(req.body?._csrf || ""));
    const expected = Buffer.from(req.session.csrf);
    if (sent.length !== expected.length || !crypto.timingSafeEqual(sent, expected)) {
        return res.status(403).render("error", { title: "Forbidden", status: 403, message: "Invalid or missing form token. Reload the page and try again." });
    }
    next();
});

/** Calls the CivicConnect API with the session's token. Throws an Error with .status. */
async function callApi(req, method, apiPath, body) {
    const headers = { Accept: "application/json" };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (req.session.token) headers.Authorization = `Bearer ${req.session.token}`;

    let response;
    try {
        response = await fetch(API_URL + apiPath, {
            method,
            headers,
            body: body !== undefined ? JSON.stringify(body) : undefined,
            signal: AbortSignal.timeout(8000)
        });
    } catch {
        const error = new Error("The CivicConnect API is not reachable. Please try again later.");
        error.status = 503;
        throw error;
    }

    let payload = {};
    try { payload = await response.json(); } catch { /* non-JSON body */ }

    if (!response.ok) {
        const error = new Error(payload.message || `API error (${response.status})`);
        error.status = response.status;
        throw error;
    }
    return payload;
}

/** Turns an API/network error into a redirect with a message, or an error page. */
function handleError(req, res, error, backUrl) {
    if (error.status === 401 && req.session.user) {
        return req.session.regenerate(() => {
            req.session.flash = { type: "error", message: "Your session expired. Please sign in again." };
            res.redirect("/login");
        });
    }
    if (backUrl && [400, 403, 404, 409].includes(error.status)) {
        req.session.flash = { type: "error", message: error.message };
        return res.redirect(backUrl);
    }
    const status = error.status && error.status < 600 ? error.status : 500;
    return res.status(status).render("error", {
        title: "Something went wrong",
        status,
        message: status >= 500 && status !== 503 ? "Internal server error" : error.message
    });
}

const route = (fn, backUrl) => async (req, res) => {
    try {
        await fn(req, res);
    } catch (error) {
        handleError(req, res, error, typeof backUrl === "function" ? backUrl(req) : backUrl);
    }
};

const requireLogin = (req, res, next) =>
    req.session.user ? next() : res.redirect("/login");

const requireRole = (...roles) => (req, res, next) =>
    roles.includes(req.session.user?.role)
        ? next()
        : res.status(403).render("error", { title: "Forbidden", status: 403, message: "Your role cannot access this page." });

const isWorker = user => user && (user.role === "STAFF" || user.role === "ADMIN");

// ----------------------------------------------------------------- routes
// Home
app.get("/", (req, res) =>
    res.redirect(req.session.user ? "/requests" : "/login")
);

// Authentication  ->  POST /api/auth/login
app.get("/login", (req, res) => {
    if (req.session.user) return res.redirect("/requests");
    res.render("login", { title: "Sign in" });
});

app.post("/login", route(async (req, res) => {
    const email = String(req.body.email || "").trim();
    const password = String(req.body.password || "");
    if (!email || !password) {
        req.session.flash = { type: "error", message: "Email and password are required." };
        return res.redirect("/login");
    }

    let result;
    try {
        result = await callApi(req, "POST", "/api/auth/login", { email, password });
    } catch (error) {
        if (error.status === 401 || error.status === 400) {
            req.session.flash = { type: "error", message: error.message };
            return res.redirect("/login");
        }
        throw error;
    }

    // New session after login (prevents session fixation).
    req.session.regenerate(() => {
        req.session.csrf = crypto.randomBytes(24).toString("hex");
        req.session.token = result.token;
        req.session.user = result.user; // { id, email, role }
        res.redirect("/requests");
    });
}));

app.post("/logout", (req, res) => {
    req.session.destroy(() => res.redirect("/login"));
});

// List / search  ->  GET /api/requests, GET /api/requests/search?term=
app.get("/requests", requireLogin, route(async (req, res) => {
    const term = String(req.query.term || "").trim();
    const path = term
        ? `/api/requests/search?term=${encodeURIComponent(term)}`
        : "/api/requests";
    const { data } = await callApi(req, "GET", path);

    let requests = data;
    // UI convenience only: the API currently returns every request to every
    // role (see NFR-002 limitation), so citizens are shown their own here.
    if (req.session.user.role === "CITIZEN") {
        requests = requests.filter(r => r.createdBy === req.session.user.id);
    }
    requests.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));

    res.render("requests", { title: "Requests", requests, term });
}));

// Create  ->  POST /api/requests   (must be declared before /requests/:id)
app.get("/requests/new", requireLogin, (req, res) =>
    res.render("request-new", { title: "New request", form: {} })
);

app.post("/requests", requireLogin, route(async (req, res) => {
    const body = {
        title: String(req.body.title || "").trim(),
        description: String(req.body.description || "").trim(),
        category: String(req.body.category || "").trim()
    };
    try {
        const { data } = await callApi(req, "POST", "/api/requests", body);
        req.session.flash = { type: "success", message: `Request #${data.id} submitted. Status: ${data.status}.` };
        return res.redirect(`/requests/${data.id}`);
    } catch (error) {
        if (error.status === 400) {
            return res.status(400).render("request-new", { title: "New request", form: body, error: error.message });
        }
        throw error;
    }
}));

// Detail  ->  GET /api/requests/:id, /history, /comments
app.get("/requests/:id", requireLogin, route(async (req, res) => {
    const id = encodeURIComponent(req.params.id);
    const [detail, history, comments] = await Promise.all([
        callApi(req, "GET", `/api/requests/${id}`),
        callApi(req, "GET", `/api/requests/${id}/history`),
        callApi(req, "GET", `/api/requests/${id}/comments`)
    ]);

    const request = detail.data;
    // UI convenience only (see note above).
    if (req.session.user.role === "CITIZEN" && request.createdBy !== req.session.user.id) {
        return res.status(403).render("error", { title: "Forbidden", status: 403, message: "You can only view your own requests." });
    }

    res.render("request-detail", {
        title: `Request #${request.id}`,
        request,
        history: history.data,
        comments: comments.data,
        canManage: isWorker(req.session.user)
    });
}));

// Comment  ->  POST /api/requests/:id/comments
app.post("/requests/:id/comments", requireLogin, route(async (req, res) => {
    await callApi(req, "POST", `/api/requests/${encodeURIComponent(req.params.id)}/comments`, {
        comment: String(req.body.comment || "").trim()
    });
    req.session.flash = { type: "success", message: "Comment added." };
    res.redirect(`/requests/${req.params.id}`);
}, req => `/requests/${req.params.id}`));

// Assign  ->  PATCH /api/requests/:id/assignment   (staff/admin)
app.post("/requests/:id/assign", requireLogin, requireRole("STAFF", "ADMIN"), route(async (req, res) => {
    await callApi(req, "PATCH", `/api/requests/${encodeURIComponent(req.params.id)}/assignment`, {
        assignedTo: Number(req.body.assignedTo)
    });
    req.session.flash = { type: "success", message: "Request assigned." };
    res.redirect(`/requests/${req.params.id}`);
}, req => `/requests/${req.params.id}`));

// Status  ->  PATCH /api/requests/:id/status   (staff/admin)
app.post("/requests/:id/status", requireLogin, requireRole("STAFF", "ADMIN"), route(async (req, res) => {
    const status = String(req.body.status || "");
    if (!["In Progress", "Resolved"].includes(status)) {
        req.session.flash = { type: "error", message: "Unknown status." };
        return res.redirect(`/requests/${req.params.id}`);
    }
    await callApi(req, "PATCH", `/api/requests/${encodeURIComponent(req.params.id)}/status`, { status });
    req.session.flash = { type: "success", message: `Status changed to ${status}.` };
    res.redirect(`/requests/${req.params.id}`);
}, req => `/requests/${req.params.id}`));

// Resolve  ->  PATCH /api/requests/:id/resolve   (staff/admin)
app.post("/requests/:id/resolve", requireLogin, requireRole("STAFF", "ADMIN"), route(async (req, res) => {
    await callApi(req, "PATCH", `/api/requests/${encodeURIComponent(req.params.id)}/resolve`);
    req.session.flash = { type: "success", message: "Request resolved." };
    res.redirect(`/requests/${req.params.id}`);
}, req => `/requests/${req.params.id}`));

// Report  ->  GET /api/requests/report   (staff/admin)
app.get("/report", requireLogin, requireRole("STAFF", "ADMIN"), route(async (req, res) => {
    const { data } = await callApi(req, "GET", "/api/requests/report");
    res.render("report", { title: "Report", report: data });
}));

// 404 and last-resort handler
app.use((req, res) =>
    res.status(404).render("error", { title: "Not found", status: 404, message: "Page not found." })
);

app.use((error, req, res, next) => {
    console.error("Unhandled error:", error);
    res.status(500).render("error", { title: "Error", status: 500, message: "Internal server error" });
});

if (require.main === module) {
    app.listen(PORT, () =>
        console.log(`CivicConnect web client running on http://localhost:${PORT} (API: ${API_URL})`)
    );
}

module.exports = app;
