module.exports = function (sequelize, DataTypes) {
    var Membership = sequelize.define("Membership", {
        title: {
            type: DataTypes.STRING,
            allowNULL: false,

        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNULL: false,
            validate: {
                isDecimal: true
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNULL: true
        }
    });
    return Membership;
}