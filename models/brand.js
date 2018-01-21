module.exports = function (sequelize, DataTypes) {
    var Brand = sequelize.define("Brand", {
        name: {
            type: DataTypes.STRING,
            allowNULL: false
        },
        description: {
            type: DataTypes.STRING,
            allowNULL: true
        },
        vendor: {
            type: DataTypes.STRING,
            allowNULL: true
        },
        photo: {
            type: DataTypes.STRING,
            allowNULL: true
        }
    });

    return Brand;
}