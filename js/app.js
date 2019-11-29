var app = angular.module("app", ['ngRoute']);

// configura la app
app.config(function ($routeProvider) {

    // ref angular ruteo; configuracion del ruteo del cliente
    $routeProvider.
        when('/Inicio',
        {
            templateUrl: '/_Inicio.html'
        }).
        when('/Unidad1',
        {
            templateUrl: '/_Unidad1.html'
        }).
        when('/Unidad2',
        {
            templateUrl: '/_Unidad2.html'
        }).
        when('/Unidad3',
        {
            templateUrl: '/_Unidad3.html'
        }).
        when('/Unidad4',
        {
            templateUrl: '/_Unidad4.html'
        }).
        when('/Simulador',
        {
            templateUrl: '/_Simulador.html'
        }).
        when('/Juego',
        {
            templateUrl: '/juego.html',
            controller: 'gameController'
        }).
        otherwise(
        {
            redirectTo: '/Inicio'  //si no se encuentra la ruta en los when anteriores lo redirige a /inicio
        });
});

app.service('myService', function ($timeout) {
    this.Instrucciones = function (dialogText, dialogTitle) {
        var alertModal = $('<div class="modal fade bd-example-modal-lg" tabindex="-1" role="dialog" aria-labelledby="myLargeModalLabel" aria-hidden="true"><div class="modal-dialog modal-lg" role="document"><div class="modal-content"><div class="modal-header"><h5 class="modal-title" id="exampleModalLabel">Instrucciones de Juego</h5><button type="button" class="close" data-dismiss="modal" aria-label="Close" style="height:auto; width:auto"><span aria-hidden="true">&times;</span></button></div><div class="modal-body">' + dialogText + '</div><div class="modal-footer"><button type="button" class="btn btn-secondary" data-dismiss="modal" style="height:auto; width:auto">Close</button></div></div></div></div>');
        $timeout(function () { alertModal.modal(); });
    };

    this.Alert = function (dialogText, dialogTitle) {
        var alertModal = $('<div id="myModal" class="modal fade" tabindex="-1" role="dialog"><div class="modal-dialog"><div class="modal-content" style="width: 80%;"><div class="modal-header"><h3>' + (dialogTitle || 'Atención') + '</h3><button type="button" class="close alerta" data-dismiss="modal" style="height:auto; width:auto">×</button></div><div class="modal-body"><p>' + dialogText + '</p></div><div class="modal-footer"><button class="btn alerta" data-dismiss="modal">Cerrar</button></div></div></div></div>');
        $timeout(function () { alertModal.modal(); });
    };

    //esta funcion no se usa, esta copiada de otro proyecto
    this.Confirm = function (dialogText, okFunc, cancelFunc, dialogTitle, but1, but2) {
        var confirmModal = $('<div id="myModal" class="modal fade" tabindex="-1" role="dialog"> <div class="modal-dialog"> <div class="modal-content" style="width: 80%;"> <div class="modal-header"> <button type="button" class="close" data-dismiss="modal">×</button> <h3>' + dialogTitle + '</h3> </div> <div class="modal-body">' + dialogText + '</div><div class="modal-footer"><button ID="SiBtn" class="btn" data-dismiss="modal">' + (but1 == undefined ? 'Si' : but1) + '</button><button ID="NoBtn" class="btn" data-dismiss="modal">' + (but2 == undefined ? 'No' : but2) + '</button></div></div></div></div>');
        confirmModal.find('#SiBtn').click(function (event) {
            okFunc();
            confirmModal.modal('hide');
        });
        confirmModal.find('#NoBtn').click(function (event) {
            cancelFunc();
            confirmModal.modal('hide');
        });
        $timeout(function () { confirmModal.modal(); });
    };
})

app.controller("gameController", function ($scope, $http, myService, $interval) {
    $scope.titulo = "Quími-Oca";
    $scope.subtitulo = "Controles";
    $scope.btnInicioJuego = "Iniciar Juego";
    $scope.estadoJuego = 'NI'; //NO INICIADO
    $scope.respondio = 'NO';
    $scope.esCorrecta = false;
    $scope.ganador = null;

    //agregar en las esquinas casillas especiales que avancen doble
    //hacer un alert con las instrucciones del juego
    //agregar modo dark

    //colores
    //success #28a745
    //danger #dc3545
    //secondary #6c757d
    //casillas especiales #ef6c00
    $scope.colorSuccess = "#007bff";
    $scope.colorDanger = "#007bff";
    $scope.colorSecondary = "#6c757d";
    $scope.colorEspeciales = "#ef6c00";

    //dado
    $scope.dadoBloqueado = true;
    $scope.dado = 0;

    //JUGADORES
    $scope.jugador1 = { pos: 0, posAnt: 0, turno: true, color: "#dc3545" };
    $scope.jugador2 = { pos: 0, posAnt: 0, turno: false, color: "#28a745" };
    $scope.contador = 0;

    //PREGUNTA
    $scope.id = 0;
    $scope.vectorIDs = [];
    $scope.cantPreguntas = 60;
    $scope.pregunta = {};

    $scope.iniciarJuego = function () {
        //inicializar variables
        $scope.estadoJuego = 'INICIADO'
        $scope.respondio = 'NO';
        $scope.esCorrecta = false;
        $scope.ganador = null;
        //inicializar jugadores o reiniciarlos si no es el primer juego
        $scope.pintarAnterior($scope.jugador1);
        $scope.pintarAnterior($scope.jugador2);
        $scope.reiniciarJugadores();
        //si no se ingresaron nombres, se asignan unos por defecto
        if ($scope.jugador1.nombre === undefined) {
            $scope.jugador1.nombre = "Jugador 1";
        }
        if ($scope.jugador2.nombre === undefined) {
            $scope.jugador2.nombre = "Jugador 2";
        }
        //se pintan los jugadores en la casilla de inicio
        $scope.pintarCasilla();
        //se reinicia el vector de los IDs de las preguntas y se obtiene una pregunta
        $scope.vectorIDs = [];
        $scope.obtenerPregunta();
    };

    $scope.tirarDado = function () {
        if ($scope.dadoBloqueado) {
            myService.Alert("Debe responder la pregunta correctamente para poder lanzar el dado.");
            return;
        } else {
            $scope.dado = parseInt((Math.random() * 6) + 1);
            //defino las nuevas posiciones
            $scope.definirPosiciones();
        }
    };

    $scope.definirPosiciones = function () {
        var iteraciones = 0;
        if ($scope.jugador1.turno) {
            if ($scope.enCasillaEspecial($scope.jugador1)) {
                $scope.jugador1.pos += ($scope.dado * 2);
                iteraciones = ($scope.dado * 2);
            } else {
                $scope.jugador1.pos += $scope.dado;
                iteraciones = $scope.dado;
            }
            $scope.contador = $scope.jugador1.posAnt;
            //se pinta rapido la primera casilla y se setea el intervalo para pintar las otras
            $scope.moverJugador($scope.jugador1);
            $interval(function () { $scope.moverJugador($scope.jugador1); }, 400, (iteraciones));
            return;
        }
        if ($scope.jugador2.turno) {
            if ($scope.enCasillaEspecial($scope.jugador2)) {
                $scope.jugador2.pos += ($scope.dado * 2);
                iteraciones = ($scope.dado * 2);
            } else {
                $scope.jugador2.pos += $scope.dado;
                iteraciones = $scope.dado;
            }
            $scope.contador = $scope.jugador2.posAnt;
            //se pinta rapido la primera casilla y se setea el intervalo para pintar las otras
            $scope.moverJugador($scope.jugador2);
            $interval(function () { $scope.moverJugador($scope.jugador2); }, 400, (iteraciones));
            return;
        }
    };

    $scope.moverJugador = function (j) {
        if ($scope.contador < j.pos) {
            $scope.pintarAnterior(j);
            if ($scope.contador < 42) {
                j.posAnt += 1;
            } else {
                j.posAnt -= 1;
            }
            $scope.contador += 1;
        } else {
            //cambio turnos
            j.pos = j.posAnt;
            $scope.jugador2.turno = !$scope.jugador2.turno;
            $scope.jugador1.turno = !$scope.jugador1.turno;
            //verifico si hay ganador antes de seguir
            $scope.hayGanador();
            //si no hay ganador bloquea el dado y sale otra pregunta
            $scope.dadoBloqueado = true;
            //obtengo una nueva pregunta
            $scope.respondio = 'NO';
            $scope.obtenerPregunta();
            return;
        }
        $scope.pintarCasilla();
    };

    $scope.enCasillaEspecial = function (j) {
        if (j.pos == 9 || j.pos == 15 || j.pos == 24 || j.pos == 28) {
            return true;
        } else {
            return false;
        }
    };

    $scope.pintarAnterior = function (j) {
        //se vuelven a su color original las casillas donde estuvo el jugador
        if (j.posAnt != 0 && j.posAnt != 42 && j.posAnt != 9 && j.posAnt != 15 && j.posAnt != 24 && j.posAnt != 28) {
            //casillas comunes
            document.getElementById("cas" + j.posAnt.toString()).style.background = $scope.colorSecondary;
            document.getElementById("cas" + j.posAnt.toString()).style.border = $scope.colorSecondary;
        } else if (j.posAnt == 42) {
            //casilla final
            document.getElementById("cas" + j.posAnt.toString()).style.background = $scope.colorDanger;
            document.getElementById("cas" + j.posAnt.toString()).style.border = $scope.colorDanger;
        } else if (j.posAnt == 0) {
            //casilla de inicio
            document.getElementById("cas" + j.posAnt.toString()).style.background = $scope.colorSuccess;
            document.getElementById("cas" + j.posAnt.toString()).style.border = $scope.colorSuccess;
        } else {
            //casilla especial
            document.getElementById("cas" + j.posAnt.toString()).style.background = $scope.colorEspeciales;
            document.getElementById("cas" + j.posAnt.toString()).style.border = $scope.colorEspeciales;
        }
    };

    $scope.pintarCasilla = function () {
        //se pinta la casilla a donde avanza al jugador
        if ($scope.jugador1.posAnt == $scope.jugador2.posAnt) {
            //si cae en la misma casilla que el otro jugador
            document.getElementById("cas" + $scope.jugador1.posAnt.toString()).style.backgroundImage = "linear-gradient(0deg, " + $scope.jugador2.color + " 50%, " + $scope.jugador1.color + " 50%)";
            //document.getElementById("cas" + $scope.jugador1.pos.toString()).style.border = $scope.colorEmpate;
        } else {
            //si cae en una casilla distinta
            document.getElementById("cas" + $scope.jugador1.posAnt.toString()).style.background = $scope.jugador1.color;
            document.getElementById("cas" + $scope.jugador1.posAnt.toString()).style.border = $scope.jugador1.color;
            document.getElementById("cas" + $scope.jugador2.posAnt.toString()).style.background = $scope.jugador2.color;
            document.getElementById("cas" + $scope.jugador2.posAnt.toString()).style.border = $scope.jugador2.color;
        }
    };

    $scope.iniciarCasillasEspeciales = function () {
        document.getElementById("cas9").style.background = $scope.colorEspeciales;
        document.getElementById("cas9").style.borderColor = $scope.colorEspeciales;
        document.getElementById("cas15").style.background = $scope.colorEspeciales;
        document.getElementById("cas15").style.borderColor = $scope.colorEspeciales;
        document.getElementById("cas24").style.background = $scope.colorEspeciales;
        document.getElementById("cas24").style.borderColor = $scope.colorEspeciales;
        document.getElementById("cas28").style.background = $scope.colorEspeciales;
        document.getElementById("cas28").style.borderColor = $scope.colorEspeciales;
        return;
    };

    $scope.validarRespuesta = function () {
        var rbtA = document.getElementById("rbtA");
        var rbtB = document.getElementById("rbtB");
        var rbtC = document.getElementById("rbtC");
        if (rbtA.checked) {
            if ($scope.pregunta.listaRespuestas[0].correcta) {
                $scope.dadoBloqueado = false;
                $scope.esCorrecta = true;
                $scope.respondio = 'SI';
                return;
            }
            $scope.esCorrecta = false;
            $scope.respondio = 'SI';
            return;
        }
        if (rbtB.checked) {
            if ($scope.pregunta.listaRespuestas[1].correcta) {
                $scope.dadoBloqueado = false;
                $scope.esCorrecta = true;
                $scope.respondio = 'SI';
                return;
            }
            $scope.esCorrecta = false;
            $scope.respondio = 'SI';
            return;
        }
        if (rbtC.checked) {
            if ($scope.pregunta.listaRespuestas[2].correcta) {
                $scope.dadoBloqueado = false;
                $scope.esCorrecta = true;
                $scope.respondio = 'SI';
                return;
            }
            $scope.esCorrecta = false;
            $scope.respondio = 'SI';
            return;
        }
        if(!rbtA.checked && !rbtB.checked && !rbtC.checked){
            myService.Alert("No selecciono ninguna opcion!");
        }
    };

    $scope.reanudar = function () {
        //habilito el dado
        $scope.dadoBloqueado = true;
        //cambio los turnos
        $scope.jugador1.turno = !$scope.jugador1.turno;
        $scope.jugador2.turno = !$scope.jugador2.turno;
        //obtengo una nueva pregunta
        $scope.respondio = 'NO';
        $scope.obtenerPregunta();
    };

    $scope.hayGanador = function () {
        if ($scope.jugador1.pos == 42) {
            $scope.ganador = $scope.jugador1.nombre;
            $scope.estadoJuego = 'NI';
            $scope.btnInicioJuego = "Jugar de Nuevo";
            return;
        }
        if ($scope.jugador2.pos == 42) {
            $scope.ganador = $scope.jugador2.nombre;
            $scope.estadoJuego = 'NI';
            $scope.btnInicioJuego = "Jugar de Nuevo";
            return;
        }
    };

    $scope.reiniciarJugadores = function () {
        $scope.jugador1.pos = 0;
        $scope.jugador1.posAnt = 0;
        $scope.jugador1.turno = true;
        $scope.jugador2.pos = 0;
        $scope.jugador2.posAnt = 0;
        $scope.jugador2.turno = false;
    };

    $scope.obtenerPregunta = function () {
        $scope.obtenerID();
        $http.get("/api/Preguntas/" + $scope.id).then(function (response) {
            $scope.pregunta = response.data;
            document.getElementById("rbtA").checked = false;
            document.getElementById("rbtB").checked = false;
            document.getElementById("rbtC").checked = false;
        });
    };

    $scope.obtenerID = function () {
        if ($scope.vectorIDs.length < 1) {
            for (var i = 0; i <= $scope.cantPreguntas; i++) {
                $scope.vectorIDs.push(i);
            }
        }
        var rnd = parseInt((Math.random() * ($scope.vectorIDs.length - 1)) + 0);
        $scope.id = $scope.vectorIDs[rnd];
        $scope.vectorIDs.splice(rnd, 1);
    };

    $scope.mostrarInstrucciones = function () {
        document.getElementById("especial").style.background = $scope.colorEspeciales;
        var p = "<p>" + document.getElementById("instrucciones1").innerHTML + "</p><p>" + document.getElementById("instrucciones2").innerHTML + "</p>";
        myService.Instrucciones(p);
    };

    $scope.iniciarCasillasEspeciales();
});

app.controller("appController", function ($scope) {
    $scope.colorSeccion = 'primary';
    $scope.temaSeccion = 'dark';
    $scope.temaBotones = 'light';

    //cambia los colores del navbar y de los botones segun la seccion
    $scope.setColor = function (color) {
        $scope.colorSeccion = color;
        if ($scope.colorSeccion === 'warning'){
            $scope.temaSeccion = 'light';
            $scope.temaBotones = 'dark';
        } else {
            $scope.temaSeccion = 'dark';
            $scope.temaBotones = 'light';
        }
    }
});