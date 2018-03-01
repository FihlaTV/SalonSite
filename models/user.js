module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    name: {
      type: DataTypes.STRING,
      allowNull: true
    }, 
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password:{
      type: DataTypes.STRING,
      allowNull: false
    },
    clear_password: {
      type: DataTypes.VIRTUAL,
      set: function (val) {
         // Remember to set the data value, otherwise it won't be validated
         this.setDataValue('clear_password', val);
         this.setDataValue('password', this.salt + val);
       },
       validate: {
          isLongEnough: function (val) {
            if (val.length < 7) {
              throw new Error("Please choose a longer password")
           }
        }
      }
    },
    title: {
      type:DataTypes.STRING
    },
    email: {
      type:DataTypes.STRING,
      allowNull: true
    }
  });

  return User;
};