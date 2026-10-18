// toJSON transform: API shows createdAt/updatedAt as "YYYY-MM-DD" (UTC); the DB keeps the full time so sorting still works.
module.exports = function dateOnly(doc, ret) {
    for (const key of ["createdAt", "updatedAt"]) {
        if (ret[key] instanceof Date) ret[key] = ret[key].toISOString().slice(0, 10);
    }
    return ret;
};
