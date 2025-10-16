# 🌐 Multi-Network Setup Guide for SKILLSWAP

## Your Network Configuration

You are working across **two local networks**:

### Network 1: `192.168.2.x`
- Your IP: **192.168.2.1**
- Backend: http://192.168.2.1:5002
- Frontend: http://192.168.2.1:3000

### Network 2: `192.168.0.x`
- Your IP: **192.168.0.113**
- Backend: http://192.168.0.113:5002
- Frontend: http://192.168.0.113:3000

---

## ✅ Current Configuration Status

Your project is **already configured** to work on both networks automatically! 

### What's Already Working:

1. **Backend CORS** - Accepts connections from any local network
2. **Socket.io** - Configured for multi-origin support
3. **Frontend API Detection** - Automatically detects which IP you're accessing from

---

## 🚀 How to Use

### Starting the Servers

```bash
# Start backend (from project root)
npm run dev

# Start frontend (in another terminal)
cd frontend
npm start
```

### Accessing on Network 1 (192.168.2.x)

**From your computer:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5002

**From other devices on Network 1:**
- Frontend: http://192.168.2.1:3000
- Backend API: http://192.168.2.1:5002

### Accessing on Network 2 (192.168.0.x)

**From your computer:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5002

**From other devices on Network 2:**
- Frontend: http://192.168.0.113:3000
- Backend API: http://192.168.0.113:5002

---

## 📱 Testing from Mobile/Other Devices

1. **Make sure your device is on the SAME network** as your Mac
2. **Check which network** you're on:
   - Network 1: Use `192.168.2.1:3000`
   - Network 2: Use `192.168.0.113:3000`
3. Open browser and navigate to the appropriate URL
4. The frontend will **automatically** connect to the correct backend!

---

## 🔧 Advanced: Manual Network Override

If you need to force a specific backend URL, create a `.env.local` file in the `frontend` folder:

### For Network 1:
```env
REACT_APP_SERVER_URL=http://192.168.2.1:5002
```

### For Network 2:
```env
REACT_APP_SERVER_URL=http://192.168.0.113:5002
```

Then restart the frontend server.

---

## 🛠️ Troubleshooting

### Can't Access from Other Devices?

1. **Check macOS Firewall:**
   ```bash
   # Check firewall status
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate
   
   # Allow Node.js (if needed)
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/local/bin/node
   sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblock /usr/local/bin/node
   ```

2. **Verify servers are listening on all interfaces:**
   ```bash
   # Check what's listening on port 5002 (backend)
   lsof -i :5002
   
   # Check what's listening on port 3000 (frontend)
   lsof -i :3000
   ```

3. **Test connectivity from another device:**
   ```bash
   # From another device, ping your Mac
   ping 192.168.2.1
   # or
   ping 192.168.0.113
   ```

### WebSocket Connection Issues?

The Socket.io configuration already allows cross-origin requests. If you see websocket errors:

1. Check browser console for CORS errors
2. Verify backend is running and accessible
3. Try accessing backend health endpoint: `http://[YOUR_IP]:5002/health`

---

## 📝 Quick Reference Commands

```bash
# Find your current IP addresses
ifconfig | grep "inet " | grep -v 127.0.0.1

# Check which network interface is active
netstat -rn | grep default

# Start both servers quickly
npm run dev &           # Backend in background
cd frontend && npm start  # Frontend in foreground

# Or use VS Code tasks: Cmd+Shift+P → "Run Task" → "Launch Full Stack"
```

---

## 🔒 Security Note

These settings are for **local development only**. For production:

1. Set specific CORS origins in `.env`
2. Use HTTPS
3. Configure proper authentication
4. Set up a reverse proxy (nginx/Apache)
5. Use environment-specific configuration

---

## 💡 Pro Tips

1. **Bookmark your IPs** for quick access from other devices
2. **Use QR codes** to share the URL with mobile devices quickly
3. **Network switching**: The app automatically adapts when you switch between networks!
4. **Hot reload works** across network - save a file and see changes on all connected devices

---

## 📊 Your Current Setup Summary

| Item | Value |
|------|-------|
| **Backend Port** | 5002 |
| **Frontend Port** | 3000 |
| **Network 1 IP** | 192.168.2.1 |
| **Network 2 IP** | 192.168.0.113 |
| **CORS** | All local networks allowed |
| **Socket.io** | Multi-origin enabled |
| **Auto-detection** | ✅ Enabled |

You're all set to work across both networks! 🎉
