var mongoose = require('mongoose'),
	Schema = mongoose.Schema;
	
mongoose.connect('mongodb://localhost/socketplay');

// Data Schemas
var schemas = {};

schemas.score = new Schema({
	name : String,
	score : Number
});

//Models
exports.Score = mongoose.model('Score', schemas.score);