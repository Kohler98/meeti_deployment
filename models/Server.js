const express = require('express')
const path = require('path')
const expressLayouts = require("express-ejs-layouts")
const createError = require('http-errors')
const bodyParser = require("body-parser")
const flash = require('connect-flash')
const session = require('express-session')
const cookieParser = require('cookie-parser')
const { dbConnection } = require('../config/config.js')
const expressValidator = require("express-validator")
const passport = require("../config/passport.js")
require('dotenv').config({path:'variables.env'})
 
class Server{
    constructor(){
        this.app = express()
        this.PORT = process.env.PORT || 5000
        this.host = process.env.HOST || '0.0.0.0'
        this.paths = {
            appRoutes:"/",
        }
        //conectar a base de datos

        // this.conectarDB()
        //Midlewares : no son mas que funciones que van a añadirle otras funcionalidades al web server
        // en otras palabras es una funcion que se ejecuta antes de llamar un controlador o seguir con la ejecucion
        //de las peticiones
        //rutas de mi applicacion

        this.middlewares()
        
        this.routes()
        this.conectarDB()
        //sockets
 
    }


    middlewares(){

        //archivos estaticos
        this.app.use(express.static('public'))
        this.app.use(expressLayouts)
        //habilitar cookie parser
        this.app.use(cookieParser())
        
        //crear la sesion
        this.app.use(session({
            secret:process.env.SECRETO,
            key:process.env.KEY,
            resave:false,
            saveUninitialized:false
        }))
        // inicializar passport
        this.app.use(passport.initialize())
        this.app.use(passport.session())
        //agregar flash message
        this.app.use(flash())
        // body parser para leer formularios
        this.app.use(bodyParser.json())
        this.app.use(bodyParser.urlencoded({extended:true}))
 
        // midleware para obtener el año
        this.app.use((req,res,next)=>{
            res.locals.usuario = {...req.user} || null
            res.locals.mensajes = req.flash()
            const fecha = new Date()
            res.locals.year = fecha.getFullYear()
            next()
        })
        //habilitar ejs como template engine
        this.app.set("view engine",'ejs')
        //ubicacion vistas
        this.app.set("views",path.join(__dirname,'../views'))
 
    }

    routes(){
    
        this.app.use(this.paths.appRoutes, require("../routes/index.js"))
 
    }
 
    listen(){
        this.app.listen(this.PORT,this.HOST, ()=>{
            console.log("Servidor corriendo en puerto", this.PORT)
        })
      
    }

    async conectarDB(){
        await dbConnection()
    }
}


module.exports = Server