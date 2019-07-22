const express = require('express');
const app = express();
const ejs = require('ejs')
const paypal = require('paypal-rest-sdk');
const dotenv = require('dotenv');
const request = require('request-promise');
dotenv.config();


app.use(express.urlencoded({
    extended: true
}))
app.use(express.json())

app.set('view engine', 'ejs')
app.get('/', (req, res) => {
    res.render('index')
})
let envoirnment = new paypal.core.SandboxEnvironment(process.env.CLIENT_ID, process.env.CLIENT_SECRET);
// let env = new paypal.core.LiveEnvironment('your_client_id', 'your_client_secret'); // Live account
let client = new paypal.core.PayPalHttpClient(envoirnment);
app.post('/pay', (req, res) => {
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

    const payments = paypal.v1.payments;
    let request = new payments.PaymentCreateRequest();
    request.requestBody(create_payment_json);
    client.execute(request).then((response) => {
        console.log(response);
        res.send(response)
    }).catch((error) => {
        console.log(error)
        res.send(error)
    });
})

function getRedirectUrl(array) {
    return array.find((ele) => {
        return ele.rel === 'approval_url'
    })
}

app.get('/success', (req, res) => {

    const {
        paymentId,
        PayerID,
        token
    } = req.query
    request.post('https://api.sandbox.paypal.com/v1/payments/payment/' + paymentId + '/execute', {
        auth: {
            user: process.env.CLIENT_ID,
            pass: process.env.CLIENT_SECRET
        },
        body: {
            payer_id: PayerID,
            transactions: [{
                amount: {
                    total: '25.00',
                    currency: 'USD'
                }
            }]
        },
        json: true
    }
    ).then(data=>res.send(data))
})

app.get('/cancel', (req, res) => {
    res.send('cancel')
})




app.listen(port = 1210, () => {
    console.log('server started at ' + port)
})