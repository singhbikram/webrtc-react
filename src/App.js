import CallControls from "./components/CallControls";
import { useAudioCall } from "./hooks/useAudioCall";

function App() {
  const { startCall } = useAudioCall();

  return (
    <div>
      <h1>WebRTC Audio Call</h1>
      <CallControls onStart={startCall} />
    </div>
  );
}

export default App;

