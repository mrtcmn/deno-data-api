# Datapad Backend Assessment

### What I did in this project

Firstly I analyzed readme and after that analyzed google spreadsheet's mock data for deciding which stack should I use.

For database I decided to use MySQL because it is easy to use and I have experience with it.


## Installation
Here's two installation steps;

### 1. Docker services

I created docker-compose.yml file for creating mysql and deno api services. For running this services you can use this command:

`docker-compose up -d --rm` 

### 2. Init database

When you run docker services, there is no data inside database. So for initial setup, need to call api method for creating tables and inserting provided data:

````http request
GET http://localhost:8080/init
````

## API

All api endpoints prepared according to documentation which is provided in readme file.

For accessing api endpoints, you can use this url:

````http request
GET http://localhost:8080/metrics?${...args}
````

Also in this repo I created postman collection for testing api endpoints.

[postman export](https://github.com/mrtcmn/deno-data-api/blob/master/data.postman_collection.json)
