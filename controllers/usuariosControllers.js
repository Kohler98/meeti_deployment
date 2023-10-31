const {body, validationResult } = require("express-validator")
const Usuarios = require("../models/Usuarios")
const { enviarEmail } = require("../handlers/emails")
const multer = require("multer")
const shortid = require("shortid")
const fs = require('fs')

const formCrearCuenta = (req,res)=>{
    res.render("crear-cuenta",{
        nombrePagina : 'Crea tu cuenta'
    })
}
const crearNuevoUsuario = async(req,res) =>{
    const usuario = req.body
    await body('repetir','La contraseña confirmada no puede ir vacio').notEmpty().run(req)
    await body('repetir','La contraseña no coinciden').equals(req.body.password).run(req)

    
    const erroresExpress = validationResult(req)
    try {
        await Usuarios.create(req.body)
 
        //url de confirmacion
        const url = `http://${req.headers.host}/confirmar-cuenta/${usuario.email}`;

        // enviar email de confirmacion
        await enviarEmail({
            usuario,
            url,
            subject : 'Confirma tu cuenta de Meeti',
            archivo : 'confirmar-cuenta'
        })
        req.flash('exito','Hemos enviado un correo de confirmacion a su direccion email')
        res.redirect("/iniciar-sesion")
 
    } catch (error) {
        
        // leer los errores de express

        console.log(error)
        const erroresSequelize = error.errors.map(err => err.message)
        const errExp = erroresExpress.errors.map(err=>err.msg)
 
        //unirlos
        const listaErrores =[...erroresSequelize,...errExp]
        req.flash('error',listaErrores)
        res.redirect("/crear-cuenta")
    }
 
}

// confirmar cuenta
const confirmarCuenta = async(req,res, next)=>{
    // verificar que el usuario existe
    const usuario = await Usuarios.findOne({where:{email:req.params.correo}})
    // si no e xiste, redireccionar
    if(!usuario){
        req.flash('error','No existe esa cuenta')
        res.redirect('/crear-cuenta')
        return next()
    }
    // si existe, confirmar suscripcion y redireccionar
    usuario.activo = 1
    await usuario.save()
    
    req.flash('exito','La cuenta se ha confirmado, ya puedes iniciar sesion')
    res.redirect('/iniciar-sesion')
}
const formIniciarSesion = (req,res)=>{
    res.render("iniciar-sesion",{
        nombrePagina : 'Inicia sesion'
    })
}

const formEditarPerfil = async(req,res)=>{
    const usuario = await Usuarios.findByPk(req.user.id)

    res.render('editar-perfil',{
        nombrePagina:'Editar Perfil',
        usuario
    })
}
const editarPerfil = async(req,res)=>{
    const usuario = await Usuarios.findByPk(req.user.id)
    //leer datos del form
    
    const {nombre,descripcion,email} = req.body 
    usuario.nombre = nombre
    usuario.descripcion = descripcion
    usuario.email = email
    
    //guardar en db
    
    await usuario.save()
    req.flash('exito','Cambios guardados correctamente')
    res.redirect('/administracion')
}
//mostrar formulario para cambiar la contraseña
const formEditarPassword = async(req,res)=>{

    res.render('cambiar-password',{
        nombrePagina:'Cambiar contraseña',
 
    })
}
// Revisa si el password anterior es correcto y lo modifica por uno nuevo

const cambiarPassword = async(req,res,next) =>{
    const usuario = await Usuarios.findByPk(req.user.id)

    // verifica que el password anterior sea correcto
    if(!usuario.validPassword(req.body.anterior)){
        req.flash('error','La contraseña actual es incorrecta')
        res,redirect('/administracion')
        return next()
    }
    // si el password es correcto, hashear el nuevo
    const hash = usuario.hashPassword(req.body.nuevo)

    // asignar el password al usuario
    usuario.password = hash
    // guardar en la base de datos
    await usuario.save()
    //redireccionar 
    req.logout(req.user, (err) => {
        if (err) return next(err);
        req.flash(
        "exito",
        "Contraseña Modificada Correctamente, vuelve a iniciar sesión"
        );
        res.redirect("/iniciar-sesion");})
}
// Muesta el formulario para subir una imagen de perfil
const formSubirImagenPerfil = async(req,res) =>{
    const usuario = await Usuarios.findByPk(req.user.id)

    // mostrar la vista

    res.render('imagen-perfil',{
        nombrePagina: 'Subir Imagen perfil',
        usuario
    })
}
const configuracionMulter = {
    limits : {filesize : 10000},
    storage:fileStorage = multer.diskStorage({
        destination:(req,file,next)=>{
            next(null,__dirname+'/../public/uploads/perfiles/')
        },
        filename : (req,file,next) =>{
            const extension = file.mimetype.split('/')[1]
            next(null,`${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req,file,next){
        if(file.mimetype == "image/jpeg" || file.mimetype == "image/png"){
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
const subirImagenUsuarios = async(req,res,next) =>{
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

const guardarImagenPerfil = async(req,res) =>{
    const usuario = await Usuarios.findByPk(req.user.id)

    // si hay imagen anterior, eliminarla
    if (usuario.imagen && req.file){
        const imagenAnterioPath = __dirname + `/../public/uploads/perfiles/${usuario.imagen}`
        // eliminar archivos con filesystem
        
        fs.unlink(imagenAnterioPath,(error)=>{
            if(error){
                console.log(error)
            }
            return
    })
    }
    // almacenar la nueva imagen
    if(req.file){
        usuario.imagen = req.file.filename
    }
    // almacenar en la base de datos y redireccionar
    await usuario.save()
    req.flash('exito','cambios almacenados correctamente')
    res.redirect('/administracion')

}
module.exports = {
    formCrearCuenta,
    crearNuevoUsuario,
    formIniciarSesion,
    confirmarCuenta,
    formEditarPerfil,
    editarPerfil,
    formEditarPassword,
    cambiarPassword,
    formSubirImagenPerfil,
    subirImagenUsuarios,
    guardarImagenPerfil
}