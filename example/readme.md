# Readme 

This example creates full CRUD application

## routes
```properties
 <!-- Book Routes  -->
 GET    /               auth required
 POST   /               auth required
 PATCH  /               auth required
 Delete /               auth required
 
 <!-- Auth Routes -->
 POST   /auth/register  auth not required
 POST   /auth/login     auth not required
```

Auth routes can be furthur customised using ```auth.routes``` option 


## How to run

```shell
npm i
npx ark-rest
```