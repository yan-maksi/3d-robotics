let client;
const clientId = "web_robotics_" + Math.random().toString(16).substr(2, 8);
const topicName = "robotics/arm/angles";
const brokerAddress = "wss://broker.emqx.io:8084/mqtt";

function conectarMQTT() {
  client = new Paho.MQTT.Client(brokerAddress, clientId);
  
  client.onConnectionLost = function(responseObject) {
    if (responseObject.errorCode !== 0) {
      console.log("Conexión MQTT perdida: " + responseObject.errorMessage);
      document.getElementById("status").textContent = "Estado MQTT: Desconectado";
      document.getElementById("status").style.color = "#f44336";
      setTimeout(conectarMQTT, 5000);
    }
  };
  
  client.onMessageArrived = function(message) {
    console.log("Mensaje recibido: " + message.payloadString);
  };

  // Conectar al broker
  client.connect({
    onSuccess: function() {
      console.log("Conectado a MQTT broker");
      document.getElementById("status").textContent = "Estado MQTT: Conectado a " + brokerAddress;
      document.getElementById("status").style.color = "#4caf50";
    },
    onFailure: function(responseObject) {
      console.log("Error de conexión MQTT: " + responseObject.errorMessage);
      document.getElementById("status").textContent = "Estado MQTT: Error de conexión";
      document.getElementById("status").style.color = "#f44336";
      setTimeout(conectarMQTT, 5000);
    },
    useSSL: true
  });
}

function enviarDatosMQTT(theta1, theta2, modo) {
  if (!client || !client.isConnected()) {
    console.log("No hay conexión MQTT disponible");
    return;
  }

  const mensaje = JSON.stringify({
    theta1: parseFloat(theta1.toFixed(2)),
    theta2: parseFloat(theta2.toFixed(2)),
    modo: modo
  });

  const mqttMessage = new Paho.MQTT.Message(mensaje);
  mqttMessage.destinationName = topicName;
  client.send(mqttMessage);
  console.log("Mensaje MQTT enviado: " + mensaje);
}