#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════════════════════════
# DriveRAG — EC2 Docker Setup Script
# ════════════════════════════════════════════════════════════════════════════════
#
# Usage:
#   1. Launch an Ubuntu 22.04 EC2 instance (t2.micro or better)
#   2. Configure security groups: SSH (22), HTTP (80), HTTPS (443)
#   3. Point your domain's DNS A record to the EC2 public IP
#   4. SSH in:  ssh -i your-key.pem ubuntu@<EC2-IP>
#   5. Clone:   git clone <repo-url> ~/DriveRag
#   6. Run:     bash ~/DriveRag/backend/deploy/setup-ec2.sh YOUR_DOMAIN
#
# ════════════════════════════════════════════════════════════════════════════════
set -euo pipefail

DOMAIN="${1:?Usage: $0 <your-domain.com>}"
REPO_DIR="/home/ubuntu/DriveRag"

echo "════════════════════════════════════════════════"
echo " DriveRAG EC2 Docker Setup — domain: $DOMAIN"
echo "════════════════════════════════════════════════"

# ── 1. Install Docker & Dependencies ─────────────────────────────────────────
echo ""
echo "▸ Installing Docker..."
sudo apt-get update -qq
sudo apt-get install -y -qq ca-certificates curl gnupg certbot

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# Set up the repository
echo \
  "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt-get update -qq
sudo apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Add ubuntu user to docker group
sudo usermod -aG docker ubuntu

# ── 2. Obtain SSL Certificate (Host level) ───────────────────────────────────
echo ""
echo "▸ Obtaining SSL certificate using standalone certbot..."
# Ensure nothing is running on port 80
sudo systemctl stop nginx 2>/dev/null || true
docker stop driverag_nginx 2>/dev/null || true

# Run certbot standalone (requires port 80)
sudo certbot certonly --standalone -d "$DOMAIN" --non-interactive --agree-tos --email admin@"$DOMAIN"

# ── 3. Configure Application ──────────────────────────────────────────────────
echo ""
echo "▸ Configuring Application..."
cd "$REPO_DIR"

# Ensure directories exist
mkdir -p "$REPO_DIR/backend/data/credentials"
mkdir -p "$REPO_DIR/nginx"

# Set up .env
if [ ! -f "$REPO_DIR/backend/.env" ]; then
    echo "▸ Creating .env from .env.example..."
    cp "$REPO_DIR/backend/.env.example" "$REPO_DIR/backend/.env"
    echo ""
    echo "  ⚠  IMPORTANT: Edit $REPO_DIR/backend/.env with your production values!"
    echo "     Then run: docker compose up -d"
else
    echo "  ✓ .env already exists"
fi

# Configure Nginx for Docker
echo "▸ Updating Docker Nginx config with domain..."
sed -i "s/YOUR_DOMAIN/$DOMAIN/g" "$REPO_DIR/nginx/nginx.conf"

# ── 4. Start Containers ──────────────────────────────────────────────────────
echo ""
echo "▸ Starting Docker containers..."
# Note: we need sudo here unless the user logs out and logs back in to apply the docker group
sudo docker compose build
sudo docker compose up -d

# ── 5. Summary ───────────────────────────────────────────────────────────────
echo ""
echo "════════════════════════════════════════════════"
echo " ✅ DriveRAG Docker Deployment Started!"
echo "════════════════════════════════════════════════"
echo ""
echo " Backend URL:  https://$DOMAIN"
echo " Health check: https://$DOMAIN/"
echo ""
echo " Commands:"
echo "   View logs:        sudo docker compose logs -f"
echo "   Restart backend:  sudo docker compose restart backend"
echo "   Stop all:         sudo docker compose down"
echo ""
echo " ⚠ Next steps:"
echo "   1. Check logs to ensure it started properly"
echo "   2. Ensure frontend VITE_API_URL=https://$DOMAIN"
echo ""
