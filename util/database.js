/*// -> Direct working with SQL <- //
const mysql = require('mysql2');

const pool = mysql.createPool({
    host:'localhost',
    user:'root',
    database:'Node-Js-Complete-Guide',
    password:'#Sallam@501#'
});

module.exports = pool.promise();
*/

/*//->Using During Sequelize<-//
const Sequeliza = require('sequelize');

const sequelize = new Sequeliza('Node-Js-Complete-Guide','root','#Sallam@501#',{
    host:'localhost',
    dialect:'mysql'
});

module.exports = sequelize;
*/

const mongodb = require('mongodb');
const mongoClient = mongodb.MongoClient;
let _db;

const mongoConect = (callback)=>{
    mongoClient.connect('mongodb://localhost:27017').then(
        (client)=>{
            _db = client.db('E-Shop');
            console.log('Conected!');
            callback(client);
        }
    ).catch(
        err=>console.log('error in connection with DB')
    )
};

const getDB = ()=>{
    if(_db){
        return _db;
    }
    throw 'there is no DB.';
}

module.exports.mongoConect = mongoConect;
module.exports.getDB = getDB;