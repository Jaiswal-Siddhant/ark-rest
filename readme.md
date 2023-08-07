# ARK REST Server

Create full **ACTUAL** REST API's with Express server without actually writing backend code. 
This package provides a simple and easy-to-use setup for creating an Express server without actually coding backend.

It allows you to quickly get started with building web applications backed by a MongoDB database. You just need to know mongodb. That's it.

## Table of content

-   [Getting started](#getting-started)
-   [Module](#module)
-   [example](./example/readme.md)
-   [CLI Usage](#cli-usage)
-   [All options of ark config file](#ark-config-in-detail)
-   [License](#license)

## Getting started

```shell
npm i ark-rest       # Install package
npx ark-rest init .  # Initialize project
npx ark-rest         # Start server. Demo server will start.
```

See [ark.config.yaml](#ark-config-in-detail) for more details 

## Module

If you need to create schemas, models or need instance of express server and express app they can be used like following. No need to install mongodb and express packages.

```js
const {
	Express,       // Express module instance
	server,        // Express app instance
	Schema,        // Instance of mongodb schema
	Model,         // Instance of mongodb model
} = require('ark-rest/exports');
```

## CLI Usage
```properties
npx ark-rest [options] <source>

Options:
      --version  Show version number                                   [boolean]
      --config   Path to JSON config file
      --init     Initialize a new ark project                          [boolean]
  -p, --path     Path to folder containing ark config file
  -d, --dev      Run in development mode
  -w, --watch    Watch file(s)                                         [boolean]
  -q, --quiet    Suppress log messages from output                     [boolean]
      --help     Show help                                             [boolean]
```

## Ark Config in detail

```yaml
schemas:              # Array
    - id: /route-name # Ex: /, /user, /product
      collection: mongodb-collection-name
      schema: './path/to/schema'

config:
    db: mongodb
    url: mongodb://localhost:27017/   # Able to connect to Atlas

server:
    port: 3000 # Defaults to 6666
    cors:
        origin: 'localhost:3000'
        optionsSuccessStatus: 200
        methods: 'POST,PUT'
        allowedOrigins: ['localhost:3000']
        # ... all CORS options accepted by CORS middleware

    auth:                                # Uses JWT for validation
        enabled: true                    # Defaults to false
        # protected: 'all'
        schema: './path/to/schema' # Auth schema
        cookieExpire: 3600               # in seconds default: 15min
        secret: 'mysecret'               # required

        # Following 2 blocks are optional.
        # They are needed when you want to implement your own auth functions.
        # Just export function named with param (req, res, next)
        routesFilePath: './path/to/function/file.js'
        routes:
            - login:
                  route: '/logintest'
                  method: GET
                  middlewareFn: fn
                  functionName: fnName

    # Routes which can not be created with help of schemas
    extendRoutes:
        routesFilePath: './path/to/function/file.js'
        routes:
            - route: '/example'
              method: GET
              functionName: exampleGet

    # To enable logging when request is made using morgan
    logging:
        enabled: true   # Defaults to false
        query: :id      # Defaults to :remote-addr :method :url :response-time
        tokenFunctions: #  Optional
            - id: id
              functionName: mongooseId
              functionPath: './path/to/function/file.js'
            - id: tokenId
              functionName: functionName
              functionPath: functionPath
```

## License

This module is open-source and available under the MIT License.
