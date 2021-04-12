const express = require('express')
var MongoClient = require('mongodb').MongoClient
const jsonfile = require('jsonfile')


const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: false}))

var url = "mongodb://localhost:27017/ecommerce";


app.listen(port, () => 
    console.log(`Sever Started And app listening at http://localhost:${port}`)
)

app.use(express.static('html'))

app.get("/", (req, res) => {
    return res.redirect('register.html')
})

app.post("/register", (req, res) => {
    var response = "";
    var rescode = "";

    var email = req.body.email;
    var pass = req.body.psw;
    var cpass = req.body.cpsw;

    if(email == "" ||  pass  == "" || cpass == "" ){
        console.log("Values are empty" );
        resCode = 404;
        response = { result: "failed"}

    }else if(pass != cpass){
        console.log("Password doest not match" );
    }
    else{
        MongoClient.connect(url, function(err, dbConn) 
        {  
            if (err) {
                throw err;
            }

            var dbInstance = dbConn.db("ecommerce");

            var myobj = { email:email, password:pass };

            dbInstance.collection("register").insertOne(myobj, function(err, res) 
            {
                if (err){
                    resCode = 404;
                    response = { result: "failed"}
                }
                   
                console.log("1 document inserted");  
                 
                resCode = 200;
                response = { result: "inserted"}
                dbConn.close();
               
            });

        })

        return res.redirect('login.html')
    }

})
