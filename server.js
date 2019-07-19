const express=require('express');
const app=express();
const ejs=require('ejs')
const paypal=require('paypal-rest-sdk');
const dotenv=require('dotenv');
dotenv.config();


app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.set('view engine','ejs')
app.get('/',(req,res)=>{
    res.render('index')
})
paypal.configure({
    mode:"sandbox",
    client_id:process.env.CLIENT_ID,
    client_secret:process.env.CLIENT_SECRET
})
app.post('/pay',(req,res)=>{
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://localhost:1210/success",
            "cancel_url": "http://localhost:1210/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "BMW",
                    "sku": "003",
                    "price": "25.00",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "25.00"
            },
            "description": "Buy a new Bmw car"
        }]
    };
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            res.send(error)
        } else {
            res.redirect(getRedirectUrl(payment.links).href) 
        }
    });
})

function getRedirectUrl(array){
    return array.find((ele)=>{
        return ele.rel==='approval_url'
    })
}

app.get('/success',(req,res)=>{

    const {paymentId,PayerID}=req.query
    const execute_payment_json = {
        "payer_id": PayerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "25.00"
            }
        }]
      };

      paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            
            res.send(JSON.stringify(payment));
        }
    });
})

//zsff
app.get('/cancel',(req,res)=>{
    res.send('cancel')
})




app.listen(port=1210,()=>{
    console.log('server started at '+port)
})
