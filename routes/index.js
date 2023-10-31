const express = require('express')
const { home } = require('../controllers/homeControllers')
const { formCrearCuenta, crearNuevoUsuario,formIniciarSesion, confirmarCuenta, formEditarPerfil, editarPerfil, formEditarPassword, cambiarPassword, formSubirImagenPerfil, subirImagenUsuarios, guardarImagenPerfil} = require('../controllers/usuariosControllers')
const { autenticarUsuario, usuarioAutenticado, cerrarSesion } = require('../controllers/authController')
const { panelAdministracion } = require('../controllers/adminController')
const { formNuevoGrupo,formEditarGrupo,formEliminarGrupo,eliminarGrupo, crearGrupo, subirImagen,editarGrupo, formEditarImagen, editarImagen } = require('../controllers/groupsControllers')
const { formNuevoMeeti,crearMeeti,editarMeeti,formEditarMeeti,formEliminarMeeti, eliminarMeeti } = require('../controllers/meetiController')
const { mostrarMeeti, confirmarAsistencia,mostrarAsistentes, mostrarCategoria } = require('../controllers/frontend/meetiControllerHome')
const {mostrarUsuario} = require('../controllers/frontend/usuariosControllerHome')
const { mostrarGrupo } = require('../controllers/frontend/gruposControllerhome')
const { agregarComentario, eliminarComentario } = require('../controllers/frontend/comentariosControllerHome')
const { resultadosBusquedas } = require('../controllers/frontend/busquedaControllerHome')
const router = express.Router()
/*Area Publica */

router.get('/',home)

// muestra un meeti
router.get('/meeti/:slug',
mostrarMeeti
)
//confirmar la asistencia a meeti

router.post('/confirmar-asistencia/:slug',
confirmarAsistencia
)

// muestra asitentes al meeti
router.get('/meeti/asistentes/:slug',
mostrarAsistentes
)
// muestra perfiles en el front end
router.get('/usuarios/:id',
mostrarUsuario)

// muestra los grupos en el frontend
router.get('/grupos/:id',
mostrarGrupo)
// muestra meeti's por categorias
router.get('/categoria/:categoria',
mostrarCategoria
)
/* Agrega comentarios en el meeti */
router.post('/meeti/:id',
agregarComentario)
/* elimina comentario en el meeti */
router.post('/eliminar-comentario',
eliminarComentario)

// añade la busqueda
router.get('/busqueda',
resultadosBusquedas)
/* crear y confirmar cuenta */
router.get('/crear-cuenta',formCrearCuenta)
router.post('/crear-cuenta',crearNuevoUsuario)
router.get('/confirmar-cuenta/:correo',confirmarCuenta)


// Iniciar Sesion

router.get("/iniciar-sesion",formIniciarSesion)
router.post("/iniciar-sesion",autenticarUsuario)
// cerrar Sesion

router.get("/cerrar-sesion",
usuarioAutenticado,
cerrarSesion)
 


/*Panel de administracion */
router.get("/administracion",
usuarioAutenticado,
panelAdministracion)

/*Nuevos Grupos */
router.get('/nuevo-grupo',
usuarioAutenticado,
formNuevoGrupo)
router.post('/nuevo-grupo',
subirImagen,
crearGrupo)

// editar grupo
router.get('/editar-grupo/:grupoId',
usuarioAutenticado,
formEditarGrupo
)
router.post('/editar-grupo/:grupoId',
usuarioAutenticado,
editarGrupo
)
// editar imagen
router.get('/imagen-grupo/:grupoId',
usuarioAutenticado,
formEditarImagen
)
router.post('/editar-imagen/:grupoId',
usuarioAutenticado,
subirImagen,
editarImagen
)
// eliminar Grupos

router.get('/eliminar-grupo/:grupoId',
usuarioAutenticado,
formEliminarGrupo
)
router.post('/eliminar-grupo/:grupoId',
usuarioAutenticado,
eliminarGrupo
)

// nuevos meeti

router.get('/nuevo-meeti',
usuarioAutenticado,
formNuevoMeeti
)
router.post('/nuevo-meeti',
usuarioAutenticado,
// sanitizarMeeti,
crearMeeti
)
// editar meeti

router.get('/editar-meeti/:id',
usuarioAutenticado,
formEditarMeeti
)
router.post('/editar-meeti/:id',
usuarioAutenticado,
editarMeeti
)
// eliminar meeti

router.get('/eliminar-meeti/:id',
usuarioAutenticado,
formEliminarMeeti
)
router.post('/eliminar-meeti/:id',
usuarioAutenticado,
eliminarMeeti
)
// editar perfil

router.get('/editar-perfil',
usuarioAutenticado,
formEditarPerfil
)
router.post('/editar-perfil',
usuarioAutenticado,
editarPerfil
)
// cambiar contraseña

router.get('/cambiar-password',
usuarioAutenticado,
formEditarPassword
)
router.post('/cambiar-password',
usuarioAutenticado,
cambiarPassword
)

// imagenes de perfil

router.get('/imagen-perfil',
usuarioAutenticado,
formSubirImagenPerfil
)
router.post('/imagen-perfil',
usuarioAutenticado,
subirImagenUsuarios,
guardarImagenPerfil
)
module.exports = router

