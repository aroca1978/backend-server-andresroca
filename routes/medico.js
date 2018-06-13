// Requires --> es una importacion de librerias que necesitamos para q algo funcione

var express = require('express');

var jwt = require('jsonwebtoken');

var mdAuthentication = require('../middlewares/autentication');

// var SEED = require('../config/config').SEED;

// Inicializar variables

var app = express();


var Medico = require('../models/medico');


// =======================================
// Obtener todos los medicos
// =======================================



app.get('/', (req, res, next) => {

    var desde = req.query.desde || 0;

    desde = Number(desde);

    Medico.find({}, 'nombre usuario hospital')
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .skip(desde)
        .limit(5)
        .exec(

            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        errors: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                })



            });

});




// =======================================
// Actualizar medico
// =======================================

app.put('/:id', mdAuthentication.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medicos',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El medico  con el id ' + id + ' no existe',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;


        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });

    });

});


// =======================================
// Crear un nuevo usuario
// =======================================
app.post('/', mdAuthentication.verificaToken, (req, res) => {

    var body = req.body; // esto solo funciona si se tiene el body parser

    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            usuarioToken: req.usuario
        });
    });


});

// =======================================
// Eliminar un  hispital
// =======================================

app.delete('/:id', mdAuthentication.verificaToken, (req, res) => {
    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id',
                errors: { message: 'No existe de veras' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});


module.exports = app;