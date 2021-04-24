const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const bodyParser = require('body-parser');
const session = require('express-session');
const expressValidator = require('express-validator');
const fileUpload = require('express-fileupload');
const passport = require('passport');

//connect to database
mongoose.connect(config.database);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error : '));
db.once('open', function(){
    console.log('Connected to the MongoDB');
})

//initiate app
const app = express();

//view engine setup
app.set('views', path.join(__dirname,'views'));
app.set('view engine','ejs');
app.engine('ejs', require('ejs').__express);

//set public folder
app.use(express.static(path.join(__dirname,'public')));

//set global error variable
app.locals.errors=null;

//get page model
var Page = require('./models/page')

//get all pages to pass to header ejs
Page.find({}).sort({sorting: 1}).exec(function(err, pages){
    if (err){
        console.log(err);
    }else{
        app.locals.pages = pages;
    }
});

//get category model
var Category = require('./models/category');

//get all categories to pass to header ejs
Category.find(function(err, categories){
    if (err){
        console.log(err);
    }else{
        app.locals.categories = categories;
    }
});

//set fileupload middleware
app.use(fileUpload());

//body parser middleware
//
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}));
//parse application/json
app.use(bodyParser.json());

//express session middleware
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
    //cookie: { secure: true }
  }))

  //express validator middleware
app.use(expressValidator({
    errorFormatter: function(param, msg, value){
        var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;

        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';

        }
        return{
            param : formParam,
            msg : msg,
            value : value
        };
    },
    customValidators: {
        isImage: function (value, filename){
            var extension = (path.extname(filename)).toLowerCase();
            switch(extension){
                    case '.jpg':
                    return '.jpg';
                    case '.jpeg':
                    return '.jpeg';
                    case '.png':
                    return '.png';
                    case '':
                    return '.jpg';
                    default:
                    return false;
                

            }
        }
    }
}));

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});
 
//start the server
const port = 3000;
app.listen(port, function(){
    console.log(`Sever Started And app listening at http://localhost:${port}`);
});

//Passport config
require('./config/passport')(passport);

//Passport middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', function(req,res,next){
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
})

//set routes
const pages = require('./routes/pages.js');
const products = require('./routes/products.js');
const users = require('./routes/users.js');
const cart = require('./routes/cart.js'); 
const adminPages = require('./routes/admin_pages.js')
const adminCategories = require('./routes/admin_categories.js')
const adminProducts = require('./routes/admin_products.js')


app.use('/', pages);
app.use('/admin/pages', adminPages);
app.use('/admin/categories', adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products );
app.use('/users', users );
app.use('/cart', cart );


