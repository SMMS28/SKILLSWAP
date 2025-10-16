#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  SKILLSWAP Multi-Network Startup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Get IP addresses
echo -e "${YELLOW}📡 Detecting network interfaces...${NC}"
IPS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}')

echo ""
echo -e "${GREEN}✅ Your SKILLSWAP app will be accessible on:${NC}"
echo ""
echo -e "  ${BLUE}Localhost:${NC}"
echo -e "    • Frontend: http://localhost:3000"
echo -e "    • Backend:  http://localhost:5002"
echo ""

for IP in $IPS; do
  echo -e "  ${BLUE}Network ($IP):${NC}"
  echo -e "    • Frontend: http://$IP:3000"
  echo -e "    • Backend:  http://$IP:5002"
  echo ""
done

echo -e "${YELLOW}💡 Access from other devices using the network URLs above${NC}"
echo -e "${YELLOW}💡 Make sure your devices are on the same network!${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}  Starting servers...${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if servers are already running
if lsof -Pi :5002 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Backend is already running on port 5002${NC}"
else
    echo -e "${GREEN}🚀 Starting Backend Server...${NC}"
    npm run dev &
    BACKEND_PID=$!
    sleep 3
fi

if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Frontend is already running on port 3000${NC}"
else
    echo -e "${GREEN}🚀 Starting Frontend Server...${NC}"
    cd frontend && npm start &
    FRONTEND_PID=$!
fi

echo ""
echo -e "${GREEN}✨ Servers are starting up!${NC}"
echo -e "${YELLOW}📱 Scan this QR code to access from mobile (Network 1):${NC}"
echo ""

# Generate QR code if qrencode is installed
FIRST_IP=$(echo $IPS | awk '{print $1}')
if command -v qrencode &> /dev/null; then
    qrencode -t UTF8 "http://$FIRST_IP:3000"
else
    echo -e "  Install qrencode to see QR code: ${BLUE}brew install qrencode${NC}"
    echo -e "  Or manually enter: ${BLUE}http://$FIRST_IP:3000${NC}"
fi

echo ""
echo -e "${GREEN}🎉 SKILLSWAP is ready!${NC}"
echo ""

# Keep script running
wait
