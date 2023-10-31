const Sequelize = require('sequelize')
const {db} = require("../dataBase/db.js")
const { v4: uuidv4 } = require('uuid');
const slug = require('slug')
const shortid = require('shortid');
const Usuarios = require('./Usuarios.js');
const Grupos = require('./Grupos.js');


const Meeti = db.define('meeti',{
    id:{
        type:Sequelize.UUID,
        primaryKey: true,
        allowNull:false,
        defaultValue: uuidv4(),

    },
    titulo:{
        type:Sequelize.STRING,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'Agrega un titulo'
            }
        }
    },
    slug:{
        type:Sequelize.STRING
    },
    invitado: Sequelize.STRING,
    cupo:{
        type:Sequelize.INTEGER,
        defaultValue:0
    },
    descripcion:{
        type:Sequelize.TEXT,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'Agrega una descripcion'
            }
        }
    },
    fecha:{
        type:Sequelize.DATEONLY,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'Agrega una fecha'
            }
        }
    },
    hora:{
        type:Sequelize.TIME,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'Agrega una hora para el Meeti'
            }
        }
    },
    direccion:{
        type:Sequelize.STRING,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'Agrega una direccion'
            }
        }
    },
    ciudad:{
        type:Sequelize.STRING,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'Agrega una ciudad'
            }
        }
    },
    estado:{
        type:Sequelize.STRING,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'Agrega un estado'
            }
        }
    },
    pais:{
        type:Sequelize.STRING,
        allowNull:false,
        validate:{
            notEmpty:{
                msg:'Agrega un pais'
            }
        }
    },
    ubicacion:{
        type:Sequelize.GEOMETRY('POINT'),
    },
    interesados:{
        type:Sequelize.ARRAY(Sequelize.INTEGER),
        defaultValue:[]
    },
},{
    hooks:{
        async beforeCreate(meeti){
            const url = slug(meeti.titulo).toLowerCase()
            meeti.slug = `${url}-${shortid.generate()}`
        }
    }
})
Meeti.belongsTo(Usuarios)
Meeti.belongsTo(Grupos)
module.exports = Meeti