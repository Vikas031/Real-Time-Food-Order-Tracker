const User=require('../../models/user')
const bcrypt=require('bcrypt');
const passport = require('passport');
function authController(){
    return {
      login(req,res){
          res.render('auth/login');
      } ,

      postLogin(req,res,next){
        passport.authenticate('local',(err ,user, info)=>{
            if(err){
                req.flash('error',info.message);
                return next(err);
            }

            if(!user){
                req.flash('error',info.message);
                return res.redirect('/login');
            }

            req.logIn(user,()=>{
                if(err){
                    req.flash('error',info.message);
                    return next(err);
                }

                return res.redirect('/');
            })
        })(req,res,next);
      },

      register(req,res){
          res.render('auth/register');
      },

      async postRegister(req,res){
          const {name ,email,password }=req.body;
          //validat request
          if(!name || !email || !password){
              req.flash('error',"All fields are required");
              return res.redirect('/register')
          }

          //check if email exist
          User.exists({email : email},(err ,result)=>{
              if(result){
                  req.flash('error',"Email already exits !");
                  res.redirect('/register');
              }
          })

          //hash password 
          const hashedPassword=await bcrypt.hash(password,10);

          //create a user
          const user=new User({
              name :name, // name 
              email:email, // email bhi likhoge to thik he 
              password:hashedPassword
          })
          user.save().then((user)=>{
              //login 
              return res.redirect('/')
          }).catch(err =>{
            req.flash('error',"Something went wrong !");
            res.redirect('/register');
          })
      },
      logout(req,res){
          req.logout();
          return res.redirect('/login');
      }
    }
}

module.exports=authController;