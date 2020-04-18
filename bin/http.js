const env = process.env.NODE_ENV || 'development';

switch (env) {
    case 'development' :
        require('dotenv').config({path: process.cwd()+'/.env'}) ;
    break ;
    case 'test' :
        require('dotenv').config({path:process.cwd()+'/.env.test'});
    break ;
}

const app = require('../app') ;
const http = require ('http') ;
const server = http.createServer(app) ;

const port = process.env.PORT || 3000

server.listen(port, ()=> {
    console.log(`listening on port : ${port}`);
})