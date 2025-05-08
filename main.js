new p5(sketchSimulacion);
new p5(sketchDatos);

window.onload = function() {
  entrenarModelo();
  conectarMQTT();
};