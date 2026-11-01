const socket = io();
const orderId = "FL-1001";
const video = document.getElementById("kitchenVideo");
const message = document.getElementById("videoMessage");
const badge = document.getElementById("liveBadge");
let pc = null;

socket.emit("join-order", {orderId});

function updateOrder(o) {
  document.getElementById("status").textContent = o.status;
  const stages = ["Placed","Accepted","Preparing","Food Ready","Picked Up","Delivered"];
  const current = stages.indexOf(o.status);
  ["s1","s2","s3","s4","s5"].forEach((id,i) => {
    document.getElementById(id).classList.toggle("done", current >= [0,1,2,3,4][i]);
  });
  document.getElementById("hint").textContent =
    o.status === "Preparing" ? "Your food is being prepared. Connect to watch the live kitchen." :
    o.status === "Food Ready" ? "Your food is ready for pickup." : `Order status: ${o.status}`;
  if (o.live) { badge.textContent = "● LIVE"; badge.classList.add("on"); }
  else { badge.textContent = "● NOT LIVE"; badge.classList.remove("on"); }
}
socket.on("order-update", updateOrder);

async function connectLive() {
  if (pc) pc.close();
  pc = new RTCPeerConnection({iceServers:[{urls:"stun:stun.l.google.com:19302"}]});
  pc.ontrack = e => {
    video.srcObject = e.streams[0];
    message.style.display = "none";
  };
  pc.onicecandidate = e => {
    if (e.candidate) socket.emit("webrtc-ice", {candidate:e.candidate});
  };
  socket.on("webrtc-offer", async data => {
    if (!pc) return;
    await pc.setRemoteDescription(data.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    socket.emit("webrtc-answer", {answer});
  });
  socket.on("webrtc-ice", async data => {
    if (pc && data.candidate) { try { await pc.addIceCandidate(data.candidate); } catch(err) { console.warn(err); } }
  });
  socket.emit("viewer-join", {});
  message.textContent = "Connecting to the restaurant camera…";
}
document.getElementById("connectBtn").addEventListener("click", connectLive);
