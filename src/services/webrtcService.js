export function createPeerConnection(onIceCandidate, onRemoteTrack) {
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
  });

  pc.onicecandidate = (event) => {
    if (event.candidate) {
      onIceCandidate(event.candidate);
    }
  };

  pc.ontrack = (event) => {
    onRemoteTrack(event.streams[0]);
  };

  return pc;
}

export async function addMicrophone(pc) {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false
  });

  stream.getTracks().forEach(track => {
    pc.addTrack(track, stream);
  });
}

