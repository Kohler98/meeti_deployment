const passport = require('passport')
const Usuarios = require('../models/Usuarios')
const LocalStrategy = require('passport-local').Strategy


passport.use(new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
    async(email,password,next) =>{
        // este codigo se ejecuta al llenar el formulario
        const usuario = await Usuarios.findOne({where : {email, activo:1}})

        // revisar si existe o no

        if(!usuario) return next(null,false,{
            message:'Ese usuario no existe'
        })

        // el usuario existe, comparar contraseñas

        const verificarPass = usuario.validPassword(password)
        // si el password es incorrecto

        if(!verificarPass) return next ( null, false,{
            message:'Password incorrecto'
        })

        // todo bien

        return next(null, usuario)
    }
))
passport.serializeUser(function(usuario,cb){
    cb(null,usuario)
})
passport.deserializeUser(function(usuario,cb){
    cb(null,usuario)
})

module.exports = passport