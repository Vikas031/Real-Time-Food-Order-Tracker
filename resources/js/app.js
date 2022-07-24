import axios from 'axios'; 
import Noty from 'noty';

let addToCArt=document.querySelectorAll('.add-to-cart')
let cartCounter=document.getElementById('cartCounter')

function updateCart(pizza){
    axios.post('/update-cart',pizza).then(res=>{
        cartCounter.innerText=res.data.totalQty;
        
        new Noty({
            type:'success',
            timeout:1000,            
            text :'Item added to cart',
            progressBar :false,
        }).show();
    }).catch(err =>{
        new Noty({
            type:'error',
            timeout:1000,            
            text :'Something went wrong',
            progressBar :false,
        }).show();
    })
}

addToCArt.forEach((btn)=>{
    btn.addEventListener('click',(e)=>{
        let pizza=JSON.parse(btn.dataset.pizza);
        updateCart(pizza);
        
    })
})