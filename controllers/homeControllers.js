const { response } = require("express");
const Categorias = require("../models/Categoria");
const Meeti = require("../models/Meeti");
const moment = require('moment');
const { Sequelize, Op } = require("sequelize");
const Grupos = require("../models/Grupos");
const Usuarios = require("../models/Usuarios");

 
const home = async(req, res= response)=>{
    const consultas = []
    consultas.push(Categorias.findAll({}))
    consultas.push(Meeti.findAll({
        attributes:['slug','titulo','fecha','hora'],
        where:{
            fecha:{[Op.gte]:moment(new Date()).format('YYYY-MM-DD')}
        },
        limit:3,
        order:[
            ['fecha','ASC']
        ],
        include:[
            {
                model:Grupos, 
                attributes:['imagen']
            },{
                model:Usuarios,
                attributes:['nombre','imagen']
            }
        ]
    }))

    const [categorias,meetis] = await Promise.all(consultas)
 
        res.render("home",{
            nombrePagina : 'Inicio',
            categorias,
            meetis,
            moment
        })
    
}

module.exports = {
    home
}