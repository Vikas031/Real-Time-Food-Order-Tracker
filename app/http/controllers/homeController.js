const Menu=require('../../models//menu')

function homeController(){
    //factory functions
    return {
        index : async function(req,res){
            // Menu.find().then((pizzas)=>{
            //     console.log(pizzas);
            //     return res.render('home',{pizzas:pizzas});
            // })
            const pizzas=await Menu.find();
            return res.render('home',{pizzas:pizzas})

        }
    }
};

module.exports=homeController;
