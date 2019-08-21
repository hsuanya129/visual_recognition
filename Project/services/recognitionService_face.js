//var multer  = require('multer')
var fs = require('fs');
//var path = require('path');

var VisualRecognitionV3 = require('watson-developer-cloud/visual-recognition/v3');

var VisualRecognition = new VisualRecognitionV3({
	iam_apikey: 'COAi96rqKZl0UE9TxVF6XNGiFk8XGMEArFxC6v_k118Y',
	version: '2018-03-19'
});

//error message for missing URL
const NODATA_ERROR = 'No Data';



exports.extractArticle = function (req, callback, fn) {
	if (req === null || req.body === null || req.body.url === null) {
		callback(NODATA_ERROR, null);
	}

	var imageSource;
	if (req.body.radiotype == "file") {
		imageSource = fs.createReadStream(req.file.path);

		var params = {

			images_file: imageSource
		};

	} else {
		imageSource = req.body.textURL;

		var params = {

			url: imageSource
		};
	}

	// var images_file = fs.createReadStream('a.jpg');
	// var images_url = "https://images.askmen.com/1080x540/2017/01/06-044621-the_pitfalls_of_dating_a_married_woman.jpg";

	VisualRecognition.detectFaces(params, function (err, response) {
		if (err) {
			callback(err, null);
		} else {
			callback(null, response);
		}
	});


}

