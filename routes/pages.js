const express = require('express')
const router = express.Router();

//get page models
var Page = require('../models/page');

//Exports
module.exports = router;

// get /
router.get('/', function(req,res){
    Page.findOne({slug : "home"}, function(err, page){
        if(err)
        console.log(err);

            res.render('index1', {
                title: page.title,
                content : page.content
            });
        
    });
});

// get a page
router.get('/:slug', function(req,res){

    var slug = req.params.slug;

        Page.findOne({slug : slug}, function(err, page){
            if(err)
            console.log(err);

             if(!page){ 
               res.redirect('/');
             } else {
                res.render('index1', {
                    title: page.title,
                    content : page.content
                });
            }
        });
    
});




