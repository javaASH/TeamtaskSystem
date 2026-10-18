 // show only date when you created and updated at not the timestamp
module.exports = function dateOnly(doc, ret) {

    for (const key of ["createdAt", "updatedAt"]) {
        if (ret[key] instanceof Date) ret[key] = ret[key].toISOString().slice(0, 10);
    }
    return ret;
};
