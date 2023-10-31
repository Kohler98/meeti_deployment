const { response } = require("express");
const passport = require("passport");

const autenticarUsuario = passport.authenticate('local',{
    successRedirect: '/administracion',
    failureRedirect:'/iniciar-sesion',
    failureFlash: true,
    badRequestMessage: 'Ambos campos son obligatorios'
})
// revisa si el usuario esta autenticdo

const usuarioAutenticado = (req,res,next) =>{
    if(req.isAuthenticated()){
        return next()
    }
    // sino esta autenticado
    return res.redirect('/iniciar-sesion')
}

const cerrarSesion = (req,res,next) =>{
    req.logout(req.user, (err) => {
        if (err) return next(err);
        req.flash(
        "exito",
        "Cerraste sesion correctamente"
        );
        res.redirect("/iniciar-sesion");}
        
        )
    next()
    
}
module.exports = {
    autenticarUsuario,
    usuarioAutenticado,
    cerrarSesion
}