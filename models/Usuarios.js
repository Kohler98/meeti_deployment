const Sequelize = require('sequelize')
const {db} = require("../dataBase/db.js")
const bcrypt = require('bcrypt-nodejs')
 
const Usuarios = db.define('usuarios',{
    id:{
        type:Sequelize.INTEGER,
        primaryKey:true,
        autoIncrement: true
    },
    nombre:{
        type: Sequelize.STRING(50),
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'El nombre no puede estar vacio'
            }
        }

    },
    imagen:Sequelize.STRING(60),
    descripcion:{
        type:Sequelize.TEXT,

    },
    email:{
        type:Sequelize.STRING(60),
        allowNull:false,
        validate:{
            isEmail:{
                msg:'Agrega un correo valido'
            }
        },
        unique:{
            args:true,
            msg:'Usuario ya registrado'
        }
    },
    password:{
        type:Sequelize.STRING(60),
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'La contraseña no puede estar vacia'
            }
        }
    },
    activo:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    tokenPassword:Sequelize.STRING,
    expiraToken:Sequelize.DATE 
},{
    hooks:{
        beforeCreate:(user)=>{
            user.password = Usuarios.prototype.hashPassword(user.password)
        }
    }
})
// metodo para comparar las contraseña
Usuarios.prototype.validPassword=function (password){
    return bcrypt.compareSync(password,this.password);
}
Usuarios.prototype.hashPassword = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(10), null );
}
module.exports = Usuarios;