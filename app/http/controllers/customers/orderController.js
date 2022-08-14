const Order=require('../../../models/order');
const moment=require('moment');
function orderController(){
    return {
        store(req,res){
            console.log(req.body);
            const {phone,address}=req.body;
            if(phone==''||address==''){
                req.flash('error','All fields are required');
                return res.redirect('/cart');
            }

            const order=new Order({
                customerId:req.user._id,
                items:req.session.cart.items,
                phone :phone,
                address :address,
            })

            order.save().then(result=>{
                Order.populate(result,{path:'customerId'},(err,placedOrder)=>{
                    delete req.session.cart;
                    req.flash('success',"Order Placed successfully");
                    //Emit socket part
                    const eventEmitter=req.app.get('eventEmitter');
                    eventEmitter.emit('orderPlaced',placedOrder);
                    return res.redirect('customers/orders');
                })
               
            }).catch(err=>{
                req.flash('error','Something went wrong')
                return res.redirect('/cart')
            })
        },

        async index(req,res){
            const orders=await Order.find({customerId:req.user._id},
                null,
                {sort:{'createdAt':-1}
            });
            

            return res.render('customers/orders',{orders:orders,moment:moment});

        },

        async show(req,res){
            const order=await Order.findById(req.params.id)

            //Authorize user
            if(order.customerId.toString()===req.user._id.toString()){
                return res.render('customers/singleOrder',{order})
            }else{
                return res.redirect('/');
            }
        }
    }
};

module.exports=orderController;