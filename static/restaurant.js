const socket = io();
const localVideo = document.getElementById("localVideo");
const cameraMessage = document.getElementById("cameraMessage");
let stream = null;
let pc = null;
let accepted = false;

socket.emit("join-order", {orderId:"FL-1001"});

function setStatus(text){document.getElementById("restaurantStatus").textContent=text;}
function sendStatus(status){socket.emit("restaurant-status",{status});setStatus("Order status updated: "+status);}
document.getElementById("acceptBtn").onclick = () => {
  accepted = true; sendStatus("Accepted");
  document.getElementById("startBtn").disabled = false;
  document.getElementById("acceptBtn").disabled = true;
};
document.getElementById("startBtn").onclick = async () => {
  if (!accepted) return;
  try {
    stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"},audio:true});
    localVideo.srcObject = stream; cameraMessage.style.display="none";
    document.getElementById("cameraBadge").textContent="● CAMERA ON";
    document.getElementById("cameraBadge").classList.add("on");
    document.getElementById("stopBtn").disabled=false;
    document.getElementById("readyBtn").disabled=false;
    document.getElementById("startBtn").disabled=true;
    sendStatus("Preparing");
    // A customer can connect after the kitchen has started. This demo supports one viewer.
    socket.on("viewer-joined", async () => {
      if (pc) pc.close();
      pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
      stream.getTracks().forEach(track => pc.addTrack(track,stream));
      pc.onicecandidate = e => { if(e.candidate) socket.emit("webrtc-ice",{candidate:e.candidate}); };
      socket.on("webrtc-answer", async data => { if(pc) await pc.setRemoteDescription(data.answer); });
      socket.on("webrtc-ice", async data => { if(pc && data.candidate){try{await pc.addIceCandidate(data.candidate)}catch(err){console.warn(err)}} });
      const offer=await pc.createOffer(); await pc.setLocalDescription(offer);
      socket.emit("webrtc-offer",{offer});
    });
  } catch(err) {
    alert("Camera could not start. Use localhost or HTTPS, allow camera/microphone permission, and check that no other app is using the camera. " + err.message);
  }
};
document.getElementById("readyBtn").onclick=()=>{sendStatus("Food Ready");stopCamera();};
document.getElementById("pickupBtn").onclick=()=>sendStatus("Picked Up");
document.getElementById("stopBtn").onclick=()=>{stopCamera();setStatus("Live video stopped.");};
function stopCamera(){
  if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}
  if(pc){pc.close();pc=null;}
  localVideo.srcObject=null;cameraMessage.style.display="block";
  document.getElementById("cameraBadge").textContent="● CAMERA OFF";
  document.getElementById("cameraBadge").classList.remove("on");
  document.getElementById("stopBtn").disabled=true;
}
document.getElementById("readyBtn").addEventListener("click",()=>{document.getElementById("pickupBtn").disabled=false;});
