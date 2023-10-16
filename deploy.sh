#!/bin/bash

set -e  # Aborta o script se ocorrer um erro
set -o pipefail  # Aborta o script se um comando em pipeline falhar

reload_nginx() {
  docker exec nginx /usr/sbin/nginx -s reload
}

zero_downtime_deploy() {
  echo "Starting zero-downtime deployment..."

  service_name=backend
  old_container_id=$(docker ps -f name=$service_name -q | tail -n1)

  # Build do serviço "backend" (certifique-se de que o Docker Compose também esteja configurado para fazer o build)
  docker-compose build $service_name

  # Bring a new container online, running new code
  # (NGINX continues routing to the old container only)
  echo "Starting a new container..."
  docker-compose up -d --no-deps --scale $service_name=2 --no-recreate $service_name

  # Wait for the new container to be available
  new_container_id=$(docker ps -f name=$service_name -q | head -n1)
  new_container_ip=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' $new_container_id)
  echo "Waiting for the new container to become available..."
  while true; do
    # response_code=$(curl -s -o /dev/null -w "%{http_code}" http://$new_container_ip:3000)
    response_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3333/os)
    if [ "$response_code" == "200" ]; then
      break
    else
      printf '.'
      sleep 1
    fi
  done
  echo "New container is available."

  # Start routing requests to the new container (as well as the old)
  echo "Reloading NGINX to start routing to the new container..."
  reload_nginx

  # Take the old container offline
  echo "Stopping the old container..."
  docker stop $old_container_id
  docker rm $old_container_id

  docker-compose up -d --no-deps --scale $service_name=1 --no-recreate $service_name

  # Stop routing requests to the old container
  echo "Reloading NGINX to stop routing to the old container..."
  reload_nginx

  echo "Zero-downtime deployment completed."
}

# Execute the zero-downtime deployment
zero_downtime_deploy
