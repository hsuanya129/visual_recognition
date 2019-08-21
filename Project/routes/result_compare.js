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
        cb(null, 'b' + path.extname(file.originalname));
    }
});


var upload = multer({ storage: storage });

router.post('/', upload.single('images_file'), function (req, res) {

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

            var pic1_text = req.body.firstPic_text;
            var pic1_pic = req.body.firstPic_pic;

            var jsonToData = function () {
                var outcome = response.images[0].classifiers[0].classes;//type:JSON 分類器擷取出來的各個類別
                console.log(JSON.stringify(outcome, null, 2));

                var allJson = new String(JSON.stringify(outcome, null, 2));
                var pic2_01, pic2_02, pic2_03, pic2_04, pic2_05;//type:JSON 取出score前三高的類別
                var scores = [];//type:二維陣列 存入每個結果的分數(i,score)

                for (var i = 0; i < outcome.length; i++) {
                    //console.log(JSON.stringify(outcome[i]));
                    scores.push([i, outcome[i].score]);
                    scores = scores.sort(function (a, b) { return b[1] - a[1] }); //將分數由大排至小        
                };

                var pic_arr = pic1_text.split("/");
                var comparedone = 0;
                var compare_str = "";

                var pic2_text = "";


                try {
                    for(var i = 0; i < 5; i++){
                        if(outcome[scores[i][0]].score >= 0.6){
                            pic2 = outcome[scores[i][0]].class;
                            pic2_text += pic2 + "/";

                            for(var h = 0; h < pic_arr.length; h++){
                                console.log("result:" + pic2 + "&" + pic_arr[h].trim() + "=>" + (pic2 == pic_arr[h].trim()));
                                if(pic2 == pic_arr[h].trim()){
                                    comparedone +=1;
                                    compare_str += pic2 + "/";
                                }
                            }
                            
                        }else{
                            break;
                        }
                    }
                }
                catch (e) {
                    
                }
                
                
                if(pic2_text.substring(pic2_text.length - 1,pic2_text.length == "/")){
                    pic2_text = pic2_text.substring(0, pic2_text.length - 1);
                }
                if(compare_str.substring(compare_str.length - 1,compare_str.length == "/")){
                    compare_str = compare_str.substring(0, compare_str.length - 1);
                }

                var compareWord = compare_str.split("/");
                var cw_1,cw_2,cw_3,cw_4,cw_5;
                if(comparedone >= 1){
                    cw_1 = compareWord[0];
                }else{
                    cw_1 = " ";
                }
                if(comparedone >= 2){
                    cw_2 = compareWord[1];
                }else{
                    cw_2 = " ";
                }
                if(comparedone >= 3){
                    cw_3 = compareWord[2];
                }else{
                    cw_3 = " ";
                }
                if(comparedone >= 4){
                    cw_4 = compareWord[3];
                }else{
                    cw_4 = " ";
                }
                if(comparedone >= 5){
                    cw_5 = compareWord[4];
                }else{
                    cw_5 = " ";
                }
                
                
                console.log(cw_1 + "/" + cw_2 + "/" + cw_3 + "/" + cw_4 + "/" + cw_5);

                if (response.images[0].source_url != null) {
                    var source = response.images[0].source_url;
                } else {
                    var source = response.images[0].image;
                }

                

                if (comparedone>=2){
                    ansStr = "類似"
                }else{
                    ansStr = "可能無關"
                }


                //console.log(best,second,third); 
            res.render('../views/result_compare.ejs', { 
                pic1: pic1_pic, 
                pic2: source, 
                compare_ans: ansStr, 
                compare_times: comparedone, 
                compare_word1:cw_1, 
                compare_word2:cw_2, 
                compare_word3:cw_3, 
                compare_word4:cw_4, 
                compare_word5:cw_5});
            }

            jsonToData();

            //res.render('../views/result_compare.ejs', { pic1: res_pic1});
        }
    });
});

module.exports = router;