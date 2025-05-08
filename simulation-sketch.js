// --- Sketch de simulación del brazo ---
let sketchSimulacion = function(p) {
    let objetivo = null; // Punto objetivo (Vector p5)
    let angulosPredichos = [0, 0]; // Ángulos predichos por la red (en grados)
    let solucionAnalitica = null; // Solución analítica (para visualización y cálculos)
    let modoActual = "analitica";
  
    p.setup = function() {
      let canvas = p.createCanvas(400, 400);
      canvas.parent('simulacion');
      p.angleMode(p.DEGREES);
      
      const radios = document.querySelectorAll('input[name="modo"]');
      radios.forEach(radio => {
        radio.addEventListener('change', function() {
          modoActual = this.value;
          console.log("Modo cambiado a: " + modoActual);
          
          if (objetivo) {
            calcularAngulos(objetivo.x, objetivo.y);
          }
        });
      });
    };
  
    p.draw = function() {
      p.background(240);
      p.translate(p.width/2, p.height/2);
  
      p.stroke(255, 0, 0);
      p.noFill();
      p.strokeWeight(2);
      p.circle(0, 0, 2*(l1+l2));
  
      if (objetivo) {
        if (modoActual === "ia" && modelo) {
          predecirAngulos(objetivo.x, objetivo.y);
        }
        solucionAnalitica = ikAnalitico(objetivo.x, objetivo.y);
      }
  
      // Determinar qué ángulos usar según el modo seleccionado
      let theta1, theta2;
      if (modoActual === "analitica" && solucionAnalitica) {
        theta1 = solucionAnalitica.theta1;
        theta2 = solucionAnalitica.theta2;
      } else if (modoActual === "ia") {
        theta1 = angulosPredichos[0];
        theta2 = angulosPredichos[1];
      } else {
        theta1 = 0;
        theta2 = 0;
      }
  
      let x1 = l1 * p.cos(theta1);
      let y1 = l1 * p.sin(theta1);
      let x2 = x1 + l2 * p.cos(theta1 + theta2);
      let y2 = y1 + l2 * p.sin(theta1 + theta2);
  
      // Color principal del brazo según modo
      if (modoActual === "analitica") {
        p.stroke(0, 150, 0); 
      } else {
        p.stroke(0, 0, 150); 
      }
      p.strokeWeight(8);
      p.line(0, 0, x1, y1);
      p.line(x1, y1, x2, y2);
      p.fill(255, 0, 0);
      p.circle(x2, y2, 12);
  
      // Dibujar objetivo
      if (objetivo) {
        p.fill(0, 0, 255);
        p.noStroke();
        p.circle(objetivo.x, objetivo.y, 10);
      }
  
      // Mostrar información de los ángulos
      p.fill(0);
      p.noStroke();
      p.textSize(14);
      p.text(`Modo: ${modoActual === "analitica" ? "Analítico" : "IA"}`, -p.width/2 + 10, -p.height/2 + 20);
      p.text(`Theta1: ${theta1.toFixed(1)}°`, -p.width/2 + 10, -p.height/2 + 40);
      p.text(`Theta2: ${theta2.toFixed(1)}°`, -p.width/2 + 10, -p.height/2 + 60);
    };
  
    p.mousePressed = function() {
      if (p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height) {
        objetivo = p.createVector(p.mouseX - p.width/2, p.mouseY - p.height/2);
        
        calcularAngulos(objetivo.x, objetivo.y);
      }
    };
  
    function calcularAngulos(x, y) {
      let theta1, theta2;
      
      if (modoActual === "analitica") {
        solucionAnalitica = ikAnalitico(x, y);
        if (solucionAnalitica) {
          theta1 = solucionAnalitica.theta1;
          theta2 = solucionAnalitica.theta2;
          enviarDatosMQTT(theta1, theta2, "analitica");
        } else {
          console.log("Punto fuera de alcance");
        }
      } else if (modoActual === "ia" && modelo) {
        predecirAngulos(x, y);
        theta1 = angulosPredichos[0];
        theta2 = angulosPredichos[1];
        enviarDatosMQTT(theta1, theta2, "ia");
      }
    }
  
    function predecirAngulos(x, y) {
      let entrada = tf.tensor2d([[x / (l1+l2), y / (l1+l2)]]);
      let salida = modelo.predict(entrada);
      let datos = salida.dataSync();
      angulosPredichos[0] = datos[0] * 180;
      angulosPredichos[1] = datos[1] * 180;
    }
  };