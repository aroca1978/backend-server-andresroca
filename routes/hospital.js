// Requires --> es una importacion de librerias que necesitamos para q algo funcione

var express = require('express');

var jwt = require('jsonwebtoken');

var mdAuthentication = require('../middlewares/autentication');

// var SEED = require('../config/config').SEED;

// Inicializar variables

var app = express();


var Hospital = require('../models/hospital');


// =======================================
// Obtener todos los usuarios
// =======================================



app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;

    desde = Number(desde);
    Hospital.find({})
        .populate('usuario', 'nombre email')
        .skip(desde)
        .limit(5)
        .exec(

            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                })


            });

});

// =======================================
// Verificar Token (Middleware)
// =======================================

// esta es una forma pero no es muy óptima

// app.use('/', (req, res, next) => {
//     var token = req.query.token;
//     jwt.verify(token, SEED, (err, decoded) => {
//         if (err) {
//             return res.status(401).json({
//                 ok: false,
//                 mensaje: 'Token incorrecto',
//                 errors: err
//             });
//         }
//         next(); // si no se pone esto, no continúa
//     });
// });




// =======================================
// Actualizar usuario
// =======================================

app.put('/:id', mdAuthentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital  con el id ' + id + ' no existe',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = req.usuario._id;


        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });

    });

});


// =======================================
// Crear un nuevo usuario
// =======================================
app.post('/', mdAuthentication.verificaToken, (req, res) => {

    var body = req.body; // esto solo funciona si se tiene el body parser

    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    });

    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado,
            usuarioToken: req.usuario
        });
    });


});

// =======================================
// Eliminar un  hispital
// =======================================

app.delete('/:id', mdAuthentication.verificaToken, (req, res) => {
    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe de veras' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});


module.exports = app;