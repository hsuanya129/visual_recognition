// author.js - Author route module
var express = require('express');
var router = express.Router();
var recognitionService_face = require('../services/recognitionService_general');
var multer = require('multer')
var fs = require('fs');
var path = require('path');
var ejs = require('ejs');

var uploadFolder = './views/uploads/';
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadFolder);
    },
    filename: function (req, file, cb) {
        cb(null, 'a' + path.extname(file.originalname));
    }
});


var upload = multer({ storage: storage });

router.post('/', upload.single('images_file'), function (req, res) {
    // var file = req.file;

    // console.log('文件类型：%s', file.mimetype);
    // console.log('原始文件名：%s', file.originalname);
    // console.log('文件大小：%s', file.size);
    // console.log('文件保存路径：%s', file.path);

    recognitionService_face.extractArticle(req, function (err, response) {
        if (err) {
            var errorMsgs;
            if (err.code == 404) {
                errorMsgs = "Page not found!";
            } else if (err.ccode == 413) {
                errorMsgs = "Handle request too large!"
            } else {
                var index = err.message.indexOf("description");
                errorMsgs = err.message.substring(index + 14, err.message.indexOf("error_id") - 3);
                console.log(errorMsgs);
            }
            res.render('../views/error.ejs', { errorMsg: errorMsgs });
        } else if (response.images.length > 1) {
            res.render('../views/error.ejs', { errorMsg: "only one picture per time!" });
        } else {

            //res.setHeader('Content-Type', 'application/json');
            //res.send(JSON.stringify(response));
            //將得分前三高的分類，展示到頁面
            var jsonToData = function () {
                var outcome = response.images[0].classifiers[0].classes;//type:JSON 分類器擷取出來的各個類別
                console.log(JSON.stringify(outcome, null, 2));

                var allJson = new String(JSON.stringify(outcome, null, 2));
                var best, second, third = null;//type:JSON 取出score前三高的類別
                var scores = [];//type:二維陣列 存入每個結果的分數(i,score)

                for (var i = 0; i < outcome.length; i++) {
                    //console.log(JSON.stringify(outcome[i]));
                    scores.push([i, outcome[i].score]);
                    scores = scores.sort(function (a, b) { return b[1] - a[1] }); //將分數由大排至小        
                };

                //+try
                try {
                    best = outcome[scores[0][0]];
                }
                catch (e) {
                    best = null;
                }

                try {
                    second = outcome[scores[1][0]];
                }
                catch (e) {
                    second = null;
                }

                try {
                    third = outcome[scores[2][0]];
                }
                catch (e) {
                    third = null;
                }
                

                if (response.images[0].source_url != null) {
                    var source = response.images[0].source_url;
                } else {
                    var source = response.images[0].image;
                }

                //console.log(best,second,third); 
                res.render('../views/result_recognize.ejs', { best: best, second: second, third: third, source: source, alljson: JSON.stringify(outcome, null, 2)});
            }
            jsonToData();
        }

    });


});

module.exports = router;