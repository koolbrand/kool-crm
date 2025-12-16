#!/bin/bash
# Deploy kool-crm to kooldock.local

REMOTE_USER="kooldock"
REMOTE_HOST="kooldock.local"
REMOTE_DIR="/Users/kooldock/kool-crm"

echo "Deploying kool-crm to $REMOTE_HOST..."

# Create directory if it doesn't exist
echo "Ensuring remote directory exists..."
ssh $REMOTE_USER@$REMOTE_HOST "mkdir -p $REMOTE_DIR"

# Sync files (exclude build artifacts and dependencies)
echo "Syncing files..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  ./ $REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR

# Run docker compose
echo "Starting Docker containers..."
ssh $REMOTE_USER@$REMOTE_HOST "export PATH=\$PATH:/usr/local/bin && \
mkdir -p /tmp/docker-fix && \
echo '{\"auths\":{},\"credsStore\":\"\",\"credHelpers\":{}}' > /tmp/docker-fix/config.json && \
export DOCKER_CONFIG=/tmp/docker-fix && \
cd $REMOTE_DIR && \
# Pre-pull base images
awk '/^FROM/ {print \$2}' Dockerfile | xargs -n1 docker pull || true && \
docker-compose down && \
docker-compose up -d --build && \
rm -rf /tmp/docker-fix"

if [ $? -eq 0 ]; then
  echo "Deployment successful! App running at http://$REMOTE_HOST:3005"
else
  echo "Deployment failed."
  exit 1
fi
