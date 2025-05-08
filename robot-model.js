// Global parameters
let l1 = 100, l2 = 100; // Lengths of the links
let datosEntrenamiento = []; // Array of {x, y, theta1, theta2} in real scale
let modelo; // Our TFJS model
const learningRate = 0.003; // Adjust this learning rate as needed

// Function to convert from radians to degrees and vice versa
function grados(radianes) { return radianes * 180 / Math.PI; }
function radianes(grados) { return grados * Math.PI / 180; }

// Analytical inverse kinematics function that chooses the right-elbow solution.
// Both possible solutions are calculated and the one whose elbow (position of the first link) has the higher x value is selected.
function ikAnalitico(x, y) {
  let r2 = x*x + y*y;
  let D = (r2 - l1*l1 - l2*l2) / (2 * l1 * l2);
  if (Math.abs(D) > 1) return null; // Point out of reach.
  let theta2a = grados(Math.atan2(Math.sqrt(1 - D*D), D));
  let theta2b = grados(Math.atan2(-Math.sqrt(1 - D*D), D));
  let theta1a = grados(Math.atan2(y, x)) - grados(Math.atan2(l2 * Math.sin(radianes(theta2a)), l1 + l2 * Math.cos(radianes(theta2a))));
  let theta1b = grados(Math.atan2(y, x)) - grados(Math.atan2(l2 * Math.sin(radianes(theta2b)), l1 + l2 * Math.cos(radianes(theta2b))));
  // Calculate elbow position for each solution
  let codoA_x = l1 * Math.cos(radianes(theta1a));
  let codoB_x = l1 * Math.cos(radianes(theta1b));

  if (codoA_x >= codoB_x) {
    return { theta1: theta1a, theta2: theta2a };
  } else {
    return { theta1: theta1b, theta2: theta2b };
  }
}

// Generate the training dataset.
// Angles φ (0 to 360°) and radii r (0 to l1+l2) are swept to cover the entire reachable circle.
function generarDatosEntrenamiento() {
  datosEntrenamiento = [];
  for (let phi = 0; phi < 360; phi += 10) {  // 36 steps in φ
    for (let r = 0; r <= (l1+l2); r += 10) {
      let x = r * Math.cos(radianes(phi));
      let y = r * Math.sin(radianes(phi));
      let solucion = ikAnalitico(x, y);
      if (solucion) {
        datosEntrenamiento.push({ x: x, y: y, theta1: solucion.theta1, theta2: solucion.theta2 });
      }
    }
  }
}

// Train the model using the generated dataset
async function entrenarModelo() {
  generarDatosEntrenamiento();
  let entradas = [];
  let salidas = [];
  // Normalize: x and y are divided by (l1+l2)=200; angles are divided by 180 to be in [-1,1]
  for (let i = 0; i < datosEntrenamiento.length; i++) {
    let d = datosEntrenamiento[i];
    entradas.push([d.x / (l1+l2), d.y / (l1+l2)]);
    salidas.push([d.theta1 / 180, d.theta2 / 180]);
  }
  const tensorEntradas = tf.tensor2d(entradas);
  const tensorSalidas = tf.tensor2d(salidas);

  modelo = tf.sequential();
  modelo.add(tf.layers.dense({ units: 64, inputShape: [2], activation: 'relu' }));
  modelo.add(tf.layers.dense({ units: 64, activation: 'relu' }));
  modelo.add(tf.layers.dense({ units: 2 })); // Predicts theta1 and theta2

  // The Adam optimizer is used with the defined learning rate
  modelo.compile({ optimizer: tf.train.adam(learningRate), loss: 'meanSquaredError' });

  await modelo.fit(tensorEntradas, tensorSalidas, {
    epochs: 5000,
    shuffle: true,
    callbacks: {
      onEpochEnd: (epoca, datos) => {
        console.log(`Epoch ${epoca}: loss = ${datos.loss}`);
      }
    }
  });
  console.log("Training completed");
}
