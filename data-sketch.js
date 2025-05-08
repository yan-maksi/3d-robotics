// --- Sketch para visualizar (Canvas de la derecha) ---
let sketchDatos = function(p) {
    p.setup = function() {
      let canvas = p.createCanvas(400, 400);
      canvas.parent('datos');
      p.angleMode(p.DEGREES);
    };
  
    p.draw = function() {
      p.background(240);
      p.translate(p.width/2, p.height/2);

      p.stroke(255, 0, 0);
      p.noFill();
      p.strokeWeight(2);
      p.circle(0, 0, 2*(l1+l2)); // Diámetro = 2*(l1+l2)
  

      p.stroke(0);
      p.fill(0);
      for (let i = 0; i < datosEntrenamiento.length; i++) {
        let d = datosEntrenamiento[i];
        p.circle(d.x, d.y, 2);
      }
    };
  };