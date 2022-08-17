const express=require('express');
const app=express();
const ejs=require('ejs');
const expressLayout=require('express-ejs-layouts')
const path=require('path')
const mongoose=require('mongoose')
const session=require('express-session')//for session
const flash=require('express-flash')
const MongoDbStore=require('connect-mongo')(session);//to connect session to mongo 
const passport=require('passport')
require("dotenv").config();
const Emitter=require('events');


const PORT=process.env.PORT||3000;

//database connection
const url='mongodb+srv://vikas:Vikas@321@cluster0.yvxxnhv.mongodb.net/Pizza?retryWrites=true&w=majority';
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

//event emitter 
const eventEmitter=new Emitter();
app.set('eventEmitter',eventEmitter);

//session config
app.use(session({
    secret:"thisismysecret",
    resave: false,
    store:mongoStore,
    saveUninitialized : false,
    cookie :{maxAge :1000*60*60*24} // 24 hours
}))

//passport config
const passportInit=require('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())
app.use(flash());//for flashing messages

//setting asset
app.use(express.static('public'))
app.use(express.urlencoded({extended:false}))
app.use(express.json());

//global middleware //to use session in html
app.use((req,res,next)=>{
  res.locals.session=req.session;
  res.locals.user=req.user;
  next()
})

//setting template engine 
app.use(expressLayout);
app.set('views',path.join(__dirname,'/resources/views'));
app.set('view engine', 'ejs');

require('./routes/web')(app);

app.use((req,res)=>{
  res.status(404).render('errors/404')
})

const server=app.listen(PORT,()=>{
      console.log("Listening on port 3000");

      })

const io=require('socket.io')(server);
io.on('connection',(socket)=>{
      //make private room on the basis of order_id
      socket.on('join',(orderId)=>{
          socket.join(orderId) 
      })
})

eventEmitter.on('orderUpdated',(data)=>{
  io.to(`order_${data.id}`).emit('orderUpdated',data);
})

eventEmitter.on('orderPlaced',(data)=>{

  io.to('adminRoom').emit('orderPlaced',data);
})