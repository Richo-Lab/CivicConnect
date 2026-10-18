
/**
 * Request-level access checks.
 * Citizens may access their own requests.
 * STAFF and ADMIN retain management access.
 */

function visibleRequests(requests, actor) {
    if (
        actor?.role === "STAFF" ||
        actor?.role === "ADMIN"
    ) {
        return requests;
    }

    if (
        actor?.role !== "CITIZEN" ||
        !Number.isSafeInteger(actor.userId)
    ) {
        return [];
    }

    return requests.filter(
        item => item.createdBy === actor.userId
    );
}

function requireRequestOwner(repository) {
    return (req, res, next) => {
        const actor = req.user;

        if (
            actor?.role === "STAFF" ||
            actor?.role === "ADMIN"
        ) {
            return next();
        }

        if (
            actor?.role !== "CITIZEN" ||
            !Number.isSafeInteger(actor.userId)
        ) {
            return res.status(403).json({
                success: false,
                message: "Access denied"
            });
        }

        const id = String(req.params.id);

        // Preserve existing service-level ID validation.
        if (
            !/^\d+$/.test(id) ||
            !Number.isSafeInteger(Number(id)) ||
            Number(id) < 1
        ) {
            return next();
        }

        const item = repository.findById(id);

        // Do not disclose another citizen's request.
        if (
            !item ||
            item.createdBy !== actor.userId
        ) {
            return res.status(404).json({
                success: false,
                message: "Service request not found"
            });
        }

        return next();
    };
}

module.exports = {
    visibleRequests,
    requireRequestOwner
};
