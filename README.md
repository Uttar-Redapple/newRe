# GangWar-Backend

#How to Run in staging:
1. Run command :: git clone git@github.com:Redapple2014/GangWar-Backend.git
2. Run command:: cd GangWar-Backend
3. Git checkout gangwar-stg
git pull  
4. Build docker image
docker build -f Dockerfile.stg -t gangwar:latest --no-cache .
5. Stop and remove old container 
a. docker stop GANGWAR-NODE
b. docker rm GANGWAR-NODE
c. docker rmi $(docker images | grep "<none>")
6. Run the container from latest image 
docker run -p 0.0.0.0:9090:9090/tcp -d --name GANGWAR-NODE gangwar:latest 
7. Exit
