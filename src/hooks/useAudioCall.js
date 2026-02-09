import { useRef } from "react";
import { createSignalingSocket } from "../services/signalingService";
import { createPeerConnection, addMicrophone } from "../services/webrtcService.js";

export function useAudioCall() {
  const pcRef = useRef(null);
  const socketRef = useRef(null);

  function playRemoteAudio(stream) {
    const audio = document.createElement("audio");
    audio.srcObject = stream;
    audio.autoplay = true;
    document.body.appendChild(audio);
  }

  function startCall() {
    const pc = createPeerConnection(
      candidate => {
        socketRef.current.send(JSON.stringify({
          type: "candidate",
          candidate
        }));
      },
      playRemoteAudio
    );

    pcRef.current = pc;

    socketRef.current = createSignalingSocket(async (data) => {
      if (data.type === "offer") {
        await pc.setRemoteDescription(data.offer);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        socketRef.current.send(JSON.stringify({ type: "answer", answer }));
      }

      if (data.type === "answer") {
        await pc.setRemoteDescription(data.answer);
      }

      if (data.type === "candidate") {
        await pc.addIceCandidate(data.candidate);
      }
    });

    addMicrophone(pc).then(async () => {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socketRef.current.send(JSON.stringify({ type: "offer", offer }));
    });
  }

  return { startCall };
}
