// Requires --> es una importacion de librerias que necesitamos para q algo funcione

var express = require('express');

// Inicializar variables

var app = express();


// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});

module.exports = app;