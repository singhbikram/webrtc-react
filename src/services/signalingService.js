export function createSignalingSocket(onMessage) {
  const socket = new WebSocket("ws://localhost:8080/signal");

  socket.onopen = () => {
    console.log("Signaling connected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };

  socket.onerror = (err) => {
    console.error("WebSocket error", err);
  };

  return socket;
}
