// author.js - Author route module
var express = require('express');
var router = express.Router();
var recognitionService_face = require('../services/recognitionService_face');
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
            if(err.code==404){
                errorMsgs="Page not found!";
            } else if(err.ccode==413){
                errorMsgs="Handle request too large!"
            } else{
                var index=err.message.indexOf("description");
                console.log(index);
                errorMsgs=err.message.substring(index+14,err.message.indexOf("error_id")-3);
                console.log(errorMsgs);
            }
            res.render('../views/error.ejs', { errorMsg: errorMsgs});
        } else if ((response.images[0].faces)=="") { //當傳入照片不為人臉時
            res.render('../views/error.ejs', { errorMsg: "請輸入人像照片!" });
        } else if (response.images.length>1){
            res.render('../views/error.ejs', { errorMsg: "only one picture per time!" });
        } else {
            //res.setHeader('Content-Type', 'application/json');
            //res.send(response);

            var jsonToData = function () {
                var age = response.images[0].faces[0].age;//age is JSON type, inculding min, max, score(probability)
                var gender = response.images[0].faces[0].gender;//gender is JSON type, inculding gender, score(probability)
                if (response.images[0].source_url != null) {
                    var source = response.images[0].source_url;
                } else {
                    var source = response.images[0].image; //在此直接放圖片檔，不需要相對路徑是因為有在app.js 設過uploads路徑了
                }

                console.log(JSON.stringify(age, null, 2));
                console.log(JSON.stringify(gender, null, 2));
                res.render('../views/result_challenge.ejs', { age: age, gender: gender, source: source });
            }
            jsonToData();
        }

    });
});

module.exports = router;