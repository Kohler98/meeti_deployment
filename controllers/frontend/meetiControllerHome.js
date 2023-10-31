const { Sequelize, Op } = require("sequelize")
const Grupos = require("../../models/Grupos")
const Meeti = require("../../models/Meeti")
const Usuarios = require("../../models/Usuarios")
const moment = require('moment')
const Categorias = require("../../models/Categoria")
const Comentarios = require("../../models/Comentarios")

const mostrarMeeti = async(req,res)=>{
    const meeti = await Meeti.findOne({
        where:{
            slug:req.params.slug
        },
        include:[
            {
                model:Grupos

            },{
                model:Usuarios,
                attributes:['id','nombre','imagen']
            }
        ]
    })
    // si no existe

    if(!meeti){
        res.redirect('/')
    }
    // consultar meetis cercanos
    const ubicacion = Sequelize.literal(`ST_GeomFromText( 'POINT( ${meeti.ubicacion.coordinates[0]} ${meeti.ubicacion.coordinates[1]} )' )`);
    //ST_DISTANCE_Sphere = retorna una linea en metros

    const distancia = Sequelize.fn('ST_DistanceSphere', Sequelize.col('ubicacion'), ubicacion);
    
    // encontrar meeti's cercanos
    const cercanos = await Meeti.findAll({
        order: distancia, // los ordena del mas cercano al lejano
        where : Sequelize.where(distancia, { [Op.lte] : 1000 } ), // 2 mil metros o 2km
        limit: 3, // maximo 3
        offset: 1, 
        include : [
            { 
                model: Grupos
            }, 
            {
                model : Usuarios,
                attributes : ['id', 'nombre', 'imagen']
            }
        ]
    }) 

    const comentarios = await Comentarios.findAll({
        where:{ 
            meetiId : meeti.id
        },
        include:[
            {
                model:Usuarios,
                attributes:['id','nombre','imagen']
            }
        ]
    })

    // pasar el resultado hacia la vista
    titulo = 'titulo'
    res.render('mostrar-meeti',{
        nombrePagina: titulo,
        meeti,
        moment,
        cercanos,
        comentarios
    })
}
// confirma o cancela si el usuario asistira al meeti
const confirmarAsistencia = async(req,res)=>{
    // agregar el usuario
    
    const {datos} = req.body
 
    if(datos == "confirmar"){
        Meeti.update(
            {'interesados' :  Sequelize.fn('array_append', Sequelize.col('interesados'), req.user.id  ) },
            {'where' : { 'slug' : req.params.slug }}
            );
            // mensaje
            res.send('Has confirmado tu asistencia');
            
        }else{
            Meeti.update(
                {'interesados' :  Sequelize.fn('array_remove', Sequelize.col('interesados'), req.user.id  ) },
                {'where' : { 'slug' : req.params.slug }}
                );
                // mensaje
                res.send('Has cancelado tu asistencia');
                
            }
            
        }
        
const mostrarAsistentes = async(req,res)=>{
    const meeti = await Meeti.findOne({
        where:{slug:req.params.slug},
        attributes:['interesados']
    })

    const {interesados} = meeti
    
    const asistentes = await Usuarios.findAll({
        attributes:['nombre','imagen'],
        where:{ id : interesados}
    })
    
    // crear la vista y pasar los datos
    res.render('asistentes-meeti',{
        nombrePagina:'Listado Asistentes Meeti',
        asistentes
    })
}
const mostrarCategoria = async(req,res,next)=>{
    const categoria = await Categorias.findOne({
                                        attributes:['id','nombre'],
                                        where:{slug:req.params.categoria}
    })
 
    const meetis = await Meeti.findAll({
                                        order:[
                                            ['fecha','ASC'],
                                            ['hora','ASC']
                                        ],  
                                        include:[
                                            {
                                                model:Grupos,
                                                where:{categoriaId:categoria.id}
                                            },
                                            {
                                                model:Usuarios
                                            }
                                        ]
    })

    res.render('categoria',{
        nombrePagina:`Categorias : ${categoria.nombre}`,
        meetis,
        moment
    })
}
module.exports = {
    mostrarMeeti,
    confirmarAsistencia,
    mostrarAsistentes,
    mostrarCategoria
}