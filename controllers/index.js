var models = require('../models'),
	Score = models.Score;

exports.index = function(req, res){
	Score.find({}, function(err, docs){
		res.render('index', {
			title: '',
			slug: 'home',
			scores: docs
		});
	});
};

exports.controller = function(req, res) {
	res.render('controller',{
		title : 'Controller',
		slug: 'controller'
	});
}