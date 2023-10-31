const Categorias = require("../models/Categoria");
const Grupos = require("../models/Grupos");
const multer = require("multer")
const shortid = require("shortid")
const fs = require('fs')

const configuracionMulter = {
    limits : {filesize : 10000},
    storage:fileStorage = multer.diskStorage({
        destination:(req,file,next)=>{
            next(null,__dirname+'/../public/uploads/grupos/')
        },
        filename : (req,file,next) =>{
            const extension = file.mimetype.split('/')[1]
            next(null,`${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req,file,next){
        if(file.mimetype == "image/jpeg" || file.mimetype == "image/png" || file.mimetype == "image/jpg"){
            //formato valido
            next(null , true)
        }else{
            //formato invalido

            next(new Error('Formato no valido'), false)
        }
    }
}

const upload = multer(configuracionMulter).single('imagen')

// sube imagen en el servidor
const subirImagen = async(req,res,next) =>{
    upload(req,res,function(error){
        if(error){
            if(error instanceof multer.MulterError){
                if(error.code == 'LIMIT_FILE_SIZE'){
                    req.flash('error',"El Archivo es muy grande")
                }else{
                    req.flash('error',error.message)
                }
            }else if(error.hasOwnProperty('message')){
                req.flash('error',error.message)
            }
            res.redirect('back')
            return
        }else{
            next()
        }
    })
}

const formNuevoGrupo = async(req,res) =>{
    const categorias = await Categorias.findAll()
    res.render('nuevo-grupo', {
        nombrePagina: 'Crear Grupo',
        categorias
    });
    
}
// almacena los grupos en la base de datos
const crearGrupo = async(req,res) =>{
    const grupo = req.body
    
    // almacena el usuario autenticado como el crador del grupo
    grupo.usuarioId = req.user.id
    // leer la imagen
    if(req.file){
        grupo.imagen = req.file.filename
        
    }
    
    try {
        // almacenar en la db
        
        await Grupos.create(grupo)
        req.flash('exito',"Se ha creado el Grupo Correctamente")
        res.redirect("/administracion")
    } catch (error) {
        req.flash('error',error)
        res.redirect('/nuevo-grupo')
    }
}
const formEditarGrupo = async(req,res) =>{
    
    const consultas = []
    
    consultas.push(Grupos.findByPk(req.params.grupoId))
    consultas.push( await Categorias.findAll())
    
    // promise con await
    const [grupo, categorias] = await Promise.all(consultas)
    res.render('editar-grupo',{
        nombrePagina:`Editar Grupo : ${grupo.nombre}`,
        grupo,
        categorias
    })
}
// guarda los cambios en la BD

const editarGrupo = async(req,res,next) =>{
    const grupo = await Grupos.findOne({where:{id:req.params.grupoId,usuarioId:req.user.id}})
    // si no existe ese grupo o no es el dueño
    if(!grupo){
        req.flash('error','Operacion no valida')
        res.redirect('/administracion')
        return next()
    }
    // todo bien leer valores
    const {nombre, descripcion, categoriaId, url} = req.body
    
    // asignar los valores
    grupo.nombre= nombre
    grupo.descripcion= descripcion
    grupo.categoriaId=categoriaId
    grupo.url=url
    // guardamos en la base de datos
    await grupo.save()
    req.flash('exito','Cambios Almacenado Correctamente')
    res.redirect('/administracion')
}
// muestra el formulario para editar una imagen del grupo 
const formEditarImagen = async(req,res) =>{
    const grupo = await Grupos.findOne({where:{id:req.params.grupoId,usuarioId:req.user.id}})
    
    res.render('imagen-grupo',{
        nombrePagina:`Editar Imagen Grupo : ${grupo.nombre}`,
        grupo
    })
}
// modifica la imagen en la bd y elimina la anterior
const editarImagen = async(req,res,next) =>{
    const grupo = await Grupos.findOne({where:{id:req.params.grupoId,usuarioId:req.user.id}})
    
    // el grupo existe y es valido
    if(!grupo){
        req.flash('error','Operacion no valida')
        req.redirect('/iniciar-sesion')
        return next()
    }
    //verificar que el archivo sea nuevo
    
    // if(req.file){
        //     console.log(req.file.filename)
        // }
        
        // //  revisar que exista un archivo anterior
        // if(grupo.imagen){
            //     console.log(grupo.imagen)
            // }
            
            // si hay imagen anterior y nueva. significa que vamos a borrar la anterior
            if (grupo.imagen && req.file){
                const imagenAnterioPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`
                // eliminar archivos con filesystem
                
                fs.unlink(imagenAnterioPath,(error)=>{
                    if(error){
                        console.log(error)
                    }
                    return
        })
    }
    
    // si hay una imagen nueva, la guardamos
    if(req.file){
        grupo.imagen = req.file.filename
    }
    // guardar en la bd
    await grupo.save()
    req.flash('exito','cambios almacenados correctamente')
    req.redirect('/administracion')
}
// muestra el formulario para eliminar un grupo
const formEliminarGrupo = async(req,res,next) =>{
    const grupo = await Grupos.findOne({where:{id:req.params.grupoId, usuarioId:req.user.id}})
    
    if(!grupo){
        req.flash('error','Operacion no valida')
        res.redirect('/administracion')
        return next()
    }
    // todo bien, ejecutar la vista
    res.render('eliminar-grupo',{
        nombrePagina:`Eliminar Grupo : ${grupo.nombre}`
    })
}
const eliminarGrupo = async(req,res,next) =>{
    const grupo = await Grupos.findOne({where:{id:req.params.grupoId, usuarioId:req.user.id}})
    
    if(!grupo){
        req.flash('error','Operacion no valida')
        res.redirect('/administracion')
        return next()
    }
    if(grupo.imagen){
        const imagenAnterioPath = __dirname + `/../public/uploads/grupos/${grupo.imagen}`
        // eliminar archivos con filesystem
        
        fs.unlink(imagenAnterioPath,(error)=>{
            if(error){
                console.log(error)
            }
            return
        })
    }
    //eliminar El grupo

    await Grupos.destroy({
        where:{
          id: req.params.grupoId
        }
    })

    //redireccionar al usuario
    req.flash('exito','Grupo Eliminado')
    res.redirect('/administracion')
}
module.exports = {
    formNuevoGrupo,
    crearGrupo,
    subirImagen,
    formEditarGrupo,
    editarGrupo,
    formEditarImagen,
    editarImagen,
    formEliminarGrupo,
    eliminarGrupo
}