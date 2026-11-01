from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, join_room, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = "change-this-before-production"
socketio = SocketIO(app, cors_allowed_origins=[])

# Demo-only in-memory order. Replace with a database in production.
ORDER = {
    "id": "FL-1001",
    "customer": "Demo Customer",
    "restaurant": "Spice Garden",
    "item": "Chicken Biryani",
    "quantity": 1,
    "total": 249,
    "status": "Placed",
    "live": False
}

@app.get("/")
def home():
    return render_template("customer.html", order=ORDER)

@app.get("/restaurant")
def restaurant():
    return render_template("restaurant.html", order=ORDER)

@app.get("/api/order")
def order():
    return jsonify(ORDER)

@socketio.on("join-order")
def join_order(data):
    room = f"order-{ORDER['id']}"
    join_room(room)
    emit("order-update", ORDER, to=room)

@socketio.on("restaurant-status")
def restaurant_status(data):
    status = data.get("status")
    allowed = {"Accepted", "Preparing", "Food Ready", "Picked Up", "Delivered", "Cancelled"}
    if status not in allowed:
        return
    ORDER["status"] = status
    ORDER["live"] = status == "Preparing"
    socketio.emit("order-update", ORDER, to=f"order-{ORDER['id']}")

@socketio.on("viewer-join")
def viewer_join(data):
    socketio.emit("viewer-joined", {"viewer": request_sid()}, to=f"order-{ORDER['id']}")

def request_sid():
    # A short random identifier is enough for this single-viewer demo.
    from flask import request
    return request.sid

# WebRTC signaling: relay offer/answer/ICE messages only within this order room.
@socketio.on("webrtc-offer")
def offer(data):
    socketio.emit("webrtc-offer", data, to=f"order-{ORDER['id']}", include_self=False)

@socketio.on("webrtc-answer")
def answer(data):
    socketio.emit("webrtc-answer", data, to=f"order-{ORDER['id']}", include_self=False)

@socketio.on("webrtc-ice")
def ice(data):
    socketio.emit("webrtc-ice", data, to=f"order-{ORDER['id']}", include_self=False)

if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=5000, debug=True)
