const Grupos = require("../models/Grupos")
const Meeti = require("../models/Meeti")

const formNuevoMeeti = async(req,res)=>{
    const grupos = await Grupos.findAll({where:{usuarioId:req.user.id}})
    res.render('nuevo-meeti',{
        nombrePagina : 'Crear nuevo meeti',
        grupos
    })
}
// inserta nuevos meetis en la base de datos
const crearMeeti = async(req,res) =>{
    // obtener los datos
    
    const meeti = req.body
    //asignar el usuario
    
    meeti.usuarioId = req.user.id
    // almacena la ubicacion con un point
    
    const point = {type:'Point',coordinates:[parseFloat(req.body.lat),parseFloat(req.body.lng)]}
    meeti.ubicacion = point

    // cupo opcional
    
    if(req.body.cupo == ''){
        meeti.cupo = 0
    }
    
    try {
        await Meeti.create(meeti)
        req.flash('exito','Se ha creado el meeti correctamente')
        res.redirect('/administracion')
    } catch (error) {
        const erroresExpress = validationResult(req)
        const erroresSequelize = error.errors.map(err => err.message)
        const errExp = erroresExpress.errors.map(err=>err.msg)
        
        //unirlos
        const listaErrores =[...erroresSequelize,...errExp]
        req.flash('error',listaErrores)
        res.redirect('/nuevo-meeti')
    }
}
//sanitiza los meeti
const sanitizarMeeti = async(req,res,next)=>{
    await body('titulo','La contraseña confirmada no puede ir vacio').notEmpty().run(req)
    await body('invitado','La contraseña no coinciden').equals(req.body.password).run(req)
    await body('cupo','La contraseña no coinciden').equals(req.body.password).run(req)
    await body('fecha','La contraseña no coinciden').equals(req.body.password).run(req)
    await body('hora','La contraseña no coinciden').equals(req.body.password).run(req)
    await body('direccion','La contraseña no coinciden').equals(req.body.password).run(req)
    await body('ciudad','La ciudad no coinciden').equals(req.body.password).run(req)
    await body('estado','La ciudad no coinciden').equals(req.body.password).run(req)
    await body('pais','La ciudad no coinciden').equals(req.body.password).run(req)
    await body('lat','La ciudad no coinciden').equals(req.body.password).run(req)
    await body('lng','La ciudad no coinciden').equals(req.body.password).run(req)
    
    const erroresExpress = validationResult(req)
    next()
}
// muestra el formulario para esitar un meeti
const formEditarMeeti = async(req,res) =>{
    const consultas = []
    
    consultas.push(Grupos.findAll({where:{usuarioId:req.user.id}}))
    consultas.push(Meeti.findByPk(req.params.id))
    
    // return un promise
    
    const [grupos,meeti] = await Promise.all(consultas)
    
    if(!grupos || !meeti){
        req.flash('error','Operacion no valida')
        res.redirect('/administracion')
        return next()
    }
    // mostramos la vista
    
    res.render('editar-meeti',{
        nombrePagina:`Editar Meeti, ${meeti.titulo}`,
        grupos,
        meeti
    })
    
}
//almacena los cambios en el meeti (bd)
const editarMeeti = async(req,res,next) =>{
    const meeti = await Meeti.findOne({where:{id:req.params.id,usuarioId:req.user.id}})
    if(!meeti){
        req.flash('error','Operacion no valida')
        res.redirect('/administracion')
        return next()
    }
    //asignar los valores
    const {grupoId, titulo, invitado, fecha, hora,cupo,descripcion,direccion,ciudad, estado,pais,lat,lng} = req.body
    meeti.grupoId = grupoId
    meeti.estado = estado
    meeti.pais = pais
    meeti.lat = lat
    meeti.lng = lng
    meeti.hora = hora
    meeti.cupo = cupo
    meeti.descripcion = descripcion
    meeti.direccion = direccion
    meeti.ciudad = ciudad
    meeti.fecha = fecha
    meeti.invitado = invitado
    meeti.titulo = titulo
    meeti.titulo = titulo

    //asignar point ( ubicacion)

    const point = {type:'Point',coordinates:[parseFloat(lat),parseFloat(lng)]}

    meeti.ubicacion = point

    // almacenar en la BD

    await meeti.save()

    req.flash('exito','Cambios guardados')
    res.redirect('/administracion')
 
}
// muestra el formulario para eliminar un meeti
const formEliminarMeeti = async(req,res,next) =>{
    const meeti = await Meeti.findOne({where:{id:req.params.id,usuarioId:req.user.id}})
 
    if(!meeti){
        req.flash('error','Operacion no valida')
        res.redirect('/administracion')
        return next()
    }
    // todo bien, ejecutar la vista
    res.render('eliminar-meeti',{
        nombrePagina:`Eliminar Meeti : ${meeti.titulo}`
    })
}
const eliminarMeeti = async(req,res,next) =>{
    const meeti = await Meeti.findOne({where:{id:req.params.id,usuarioId:req.user.id}})
    
    if(!meeti){
        req.flash('error','Operacion no valida')
        res.redirect('/administracion')
        return next()
    }
 
    //eliminar El grupo

    await Meeti.destroy({
        where:{
          id: req.params.id
        }
    })

    //redireccionar al usuario
    req.flash('exito','Meeti Eliminado')
    res.redirect('/administracion')
}
module.exports = {
    formNuevoMeeti,
    crearMeeti,
    sanitizarMeeti,
    formEditarMeeti,
    editarMeeti,
    formEliminarMeeti,
    eliminarMeeti
}