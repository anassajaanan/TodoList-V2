exports.getDate = function () {
    const date = new Date();
    const options = {
        weekday: "long",
        day: "numeric",
        month: "long",
    }
    let currentDate = date.toLocaleDateString('en-US', options);
    return currentDate;
}

exports.getDay = function () {
    const date = new Date();
    const options = {
        weekday: "long",
    }
    let currentDate = date.toLocaleDateString('en-US', options);
    return currentDate;
}
