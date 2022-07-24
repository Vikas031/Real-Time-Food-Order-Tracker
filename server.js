const express=require('express');
const app=express();
const ejs=require('ejs');
const expressLayout=require('express-ejs-layouts')
const path=require('path')
const mongoose=require('mongoose')
const session=require('express-session')//for session
const flash=require('express-flash')
const MongoDbStore=require('connect-mongo')(session);//to connect session to mongo 

require("dotenv").config();


const PORT=process.env.PORT||3000;

//database connection
const url='mongodb://localhost/Pizza';
mongoose.connect(url,
  {
    useNewUrlParser: true,
     useFindAndModify: true,
    useUnifiedTopology: true
  }
);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected successfully");
});

//session store
let mongoStore=new MongoDbStore({
    mongooseConnection :db,
    collection:'sessions'
})


//session config
app.use(session({
    secret:process.env.COOKIE_SECRET,
    resave: false,
    store:mongoStore,
    saveUninitialized : false,
    cookie :{maxAge :1000*60*60*24} // 24 hours
}))

app.use(flash());//??

//setting asset
app.use(express.static('public'))
app.use(express.json());

//global middleware //to use session in html
app.use((req,res,next)=>{
  res.locals.session=req.session;
  next()
})

//setting template engine 
app.use(expressLayout);
app.set('views',path.join(__dirname,'/resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);

app.listen(PORT,()=>{
 console.log("Listening on port 3000");

})