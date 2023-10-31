const { Sequelize, Op } = require("sequelize")
const Grupos = require("../models/Grupos")
const Meeti = require("../models/Meeti")
const moment = require('moment')
 
const panelAdministracion = async(req,res) =>{
    console.log()
    // consultas
    const consultas = []
    consultas.push(await Grupos.findAll({where:{usuarioId : req.user.id}}))
    consultas.push(await Meeti.findAll({where:{usuarioId : req.user.id,
                                        fecha:{[Op.gte]:moment(new Date()).format("YYYY-MM-DD")}
    },
                                        order:[
                                            ['fecha','DESC']
                                        ]
}))
    consultas.push(await Meeti.findAll({where:{usuarioId : req.user.id,
                                        fecha:{[Op.lt]:moment(new Date()).format("YYYY-MM-DD")}
    }}))

    // array destructoring
    const [grupos, meeti, anteriores] = await Promise.all(consultas)
    res.render('administracion',{
        nombrePagina : 'Panel de Administracion',
        grupos,
        meeti,
        moment,
        anteriores
    })
}
module.exports = {
    panelAdministracion
}