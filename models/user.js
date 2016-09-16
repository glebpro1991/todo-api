// define a model for sqlite
module.exports = function(sequelize, DataTypes) {
    // all necessary validaiton is defined here
    return sequelize.define('user', {
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            validate: {
                len: [5, 100]
            }
        }
    }, {
        hooks: {
            beforeValidate: function(user, options) {
                if(typeof user.email === 'string') {
                    user.email = user.email.toLowerCase();
                } else {

                }
            } 
        }
    });
}