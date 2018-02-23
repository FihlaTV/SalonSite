module.exports = function (sequelize, DataTypes) {
    var Membership = sequelize.define("Membership", {
        title: {
            type: DataTypes.STRING,
            allowNULL: false,
        },
        price: {
            type: DataTypes.STRING,
            allowNULL: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNULL: true
        }
    });
    
    return Membership;
}