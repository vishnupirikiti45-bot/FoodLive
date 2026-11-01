# FoodLive starter project

A learning prototype for a food-delivery order flow with a restaurant-to-customer live kitchen camera.

## Requirements
- Python 3.10+
- Chrome or Edge
- Webcam and microphone for the restaurant device
- Internet connection for the sample Pexels clip and STUN connectivity

## Run on Windows
1. Extract the ZIP.
2. Open Command Prompt in the `foodlive_starter` folder.
3. Create and activate a virtual environment:

   ```bat
   py -m venv venv
   venv\Scripts\activate
   ```

4. Install dependencies:

   ```bat
   pip install -r requirements.txt
   ```

5. Start the server:

   ```bat
   python app.py
   ```

6. Open `http://127.0.0.1:5000` in one browser tab (customer).
7. Open `http://127.0.0.1:5000/restaurant` in another tab (restaurant).
8. On the restaurant page click **Accept order**, then **Start cooking & go LIVE** and allow camera/microphone.
9. On the customer page click **Connect to live kitchen**.

## Important testing notes
- Browser camera access works on `localhost` or HTTPS. For two physical devices, deploy behind HTTPS and use a TURN server for reliable connectivity across mobile networks and restrictive routers.
- This starter has one demo order, one customer viewer, in-memory order state and basic WebRTC signaling. It is not production-ready.
- For production: add authentication and role permissions, PostgreSQL, order-specific signed stream tokens, TURN infrastructure, rate limits, audit logs, payment gateway integration, delivery tracking, consent notices, retention controls, and monitoring.
- Never expose one restaurant's stream to another customer. Enforce order ownership on the server, not only in JavaScript.
- The included Pexels clip is prerecorded demo footage. It is not a live stream and does not prove the demo order was prepared in that kitchen.
