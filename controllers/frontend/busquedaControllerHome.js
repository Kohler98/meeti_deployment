const { Sequelize, Op, QueryError } = require("sequelize")
const Grupos = require("../../models/Grupos")
const Meeti = require("../../models/Meeti")
const Usuarios = require("../../models/Usuarios")
const moment = require('moment')

const resultadosBusquedas = async(req, res)=>{
    //leer datos de la url

    const {categoria, titulo, ciudad, pais} = req.query

    // si la categoria esta vacioa
    let query

    if(categoria == ''){
        query = ''
    }else{
        query = `where:{
            categoriaId:{[Op.eq]: categoria}
        }`

    }
    // filtrar los meetis por los terminos de la busqueda

    const meetis = await Meeti.findAll({
        where: {
            titulo:{[Op.like]:'%'+titulo+'%'},
            ciudad:{[Op.like]:'%'+ciudad+'%'},
            pais:{[Op.like]:'%'+pais+'%'}
        },
        include : [
            { 
                model: Grupos,
                query
            }, 
            {
                model : Usuarios,
                attributes : ['id', 'nombre', 'imagen']
            }
        ]
    })

    // pasar los resultados a la vista

    res.render('busqueda',{
        nombrePagina:'Resultados Busqueda',
        meetis,
        moment
    })
}

module.exports = {
    resultadosBusquedas
}