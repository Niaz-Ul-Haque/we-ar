require('dotenv').config();
const express = require("express");
const handlebars = require("express-handlebars");
const mongoose = require('mongoose')
const data = require("./data-service.js");
const bodyParser = require('body-parser');
const validEmail = require('email-validator');
const Users = require('./models/Users')



const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('assets'));

app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

app.get('/signup', (req, res) =>{
    res.render('signup',{
        title: "Registration",
        pageheading: "Registration",
    });
});


app.post('/signup',  (req,res )=>{
    let nickname = req.body.nickname;
    let email = req.body.email;
    let psw = req.body.psw;
    let psw2= req.body.psw2;
    let bodyT = req.body.bodyT;
    let style = req.body.style;
    const errors = {};

    if(/^\\s*$/.test(nickname) !== false)
    {
        errors.nickname = "Please enter a nickname" ;
    }

    if(validEmail.validate(email) !== true)
    {
        errors.email = "Please enter a valid email";
    }

    

    if(/\\s*/.test(psw) !== false)
    {
        errors.psw = "Please enter a password using non space characters";
    }

    if(psw !== psw2)
    {
        errors.psw2 = "Passwords do not match";
    }

    if(Object.keys(errors) >0)
    {
        console.log("fail")
        res.render('signup',{
            title: "Registration",
            pageheading: "Registration",
            errors,
        });
    }
    else{
        console.log("success")
        const user = new Users({
            Nickname:nickname,
            _id:email.toLowerCase(),
            Psw:psw,
            BodyT:bodyT,
            Style:style

        });
       
        mongoose.connect(process.env.URI, {
            useUnifiedTopology: true,
            useNewUrlParser: true,
        }).then(
            () => { console.log("DB connected") ; 
            user.save().then(()=>{(userSaved)=>res.json(userSaved);})
            .catch((err)=>console.log(err));}).catch((err)=>console.log(err));
     
        
        
        res.redirect('/dashboard')

    }
});






app.get('/login', function (req, res) {
    res.render('login', {
        title: "Login",
        pageheading: "Login",
    });
});

app.post('/login', (req,res)=>{
    const email = req.body.email.toLowerCase();
    const pass = req.body.password;
    const errors = [];

    const user = {};

    mongoose.connect(process.env.URI, {
        useUnifiedTopology: true,
        useNewUrlParser: true,
    }).then(
       async () => { console.log("DB connected") ; 
       user= await Users.findById(email)}).catch((err)=>console.log(err));
        console.log(user);
        
      
            res.render('login',{
                title: "Login",
                pageheading: "Login",
                errors
            });
        
    
    
    

});

app.get('/', function (req, res) {
    res.render('home', {
        title: "Home",
        pageheading: "Homepage",
    });
});


var user={
    "gender": "male",
    "bodytype":"small",
    "style": "casual",
    "colorful": true,
    "hat": false,
    "weather": "summer"
}

app.get("/findStyle",(req,res)=>{
    data.findstyle().then((data)=>{

    })
})

app.get("/images",(req,res)=>{
    data.getMatchStyle(user).then((data)=>{
        res.render('michael',{
            title: "Michael",
            images:data,
        });
    }).catch((err)=>{
        res.render('michael',{message:"No Result"});
        console.log(err);
    })
})
app.get('/dashboard', function (req, res) {
    res.render('dashboard', {
        title: "Dashboard",
        pageheading: "Dashboard",
    });
});
app.get('/createstyle', function (req, res) {
    res.render('createstyle',{
        title: "Create Style",
        pageheading: "Create Style",
    });
});





app.listen(PORT, () => console.log("Web server has started"));

data.initialize().then(() => {
    console.log("initializing");
    //app.listen(HTTP_PORT,onHttpStart);
}).catch(err => {
    console.log(err);
});





const findUserByEmail= (email)=>{

    if(email){
        return new Promise((resolve, reject) => {
          Users.findOne({ email: email })
            .exec((err, doc) => {
              if (err) return reject(err)
              if (doc) return reject(new Error('This email already exists. Please enter another email.'))
              else return resolve(email)
            })
        })
      }
   }