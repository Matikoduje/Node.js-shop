const mongodb = require( "mongodb" );
const MongoClient = mongodb.MongoClient;

let _db;

const mongoDBConnection = require( "../configuration/database-env-setup" );

const mongoConnect = ( callback ) => {
	MongoClient.connect( mongoDBConnection )
		.then( ( client ) => {
			_db = client.db();
			callback();
		} )
		.catch( ( err ) => {
			throw err;
		} );
};

const getDb = () => {
	if ( _db ) {
		return _db;
	}

	throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
