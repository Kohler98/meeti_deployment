const Comentarios = require("../../models/Comentarios")
const Meeti = require("../../models/Meeti")

 
const agregarComentario = async(req,res, next)=>{
    // obtener el comentario
    const {comentario} = req.body
    
    await Comentarios.create({
        mensaje: comentario,
        usuarioId: req.user.id,
        meetiId : req.params.id
    })
    // redirecionar a la misma pagina
    res.redirect('back')
    next()
}

const eliminarComentario = async(req,res, next)=>{
    // tomar el id del comentario
    const {comentarioId} = req.body

    // consultar el comentario
    const comentario = await Comentarios.findOne({where:{id:comentarioId}})
    // consultar el comentario

    const meeti = await Meeti.findOne({where:{id:comentario.meetiId}})
    
    // verificar si existe el comentario
    if(!comentario){
        res.status(404).send('Accion no valida')
        return next()
    }
    // verificar que quien lo borra sea el creador
    if(comentario.usuarioId == req.user.id ||meeti.usuarioId == req.user.id  ){
        await Comentarios.destroy({where:{
            id:comentarioId
        }})
        res.status(200).send('Eliminado correctamente')
        return next()
    }else{
        res.status(403).send('Accion no valida')
        return next()
    }
}
module.exports = {
    agregarComentario,
    eliminarComentario
}