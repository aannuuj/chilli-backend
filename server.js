const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const shortid = require('shortid');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://adminID:hariom@cluster0.i9rco.mongodb.net/chillyDatabse?retryWrites=true&w=majority');

mongoose.connection.once('open', function () {
    console.log('Database is now connected');
}).on('error', function (error) {
    console.log('error');
});
const chillieCustomer = require('./model');
const app = express();
app.use(cors());
app.use(bodyParser.json());
const razorpay = new Razorpay({
    key_id: 'rzp_live_PTtpERBBmkS601',
    key_secret: 'fJSw6jK9vIBQAzcUXDMnPssC'
})

app.post('/verification',(req, res) => {
    res.json({status: 'ok'});
    const secret = '12345678';
    //console.log(req.body.payload.payment);
    const crypto = require('crypto');
    const shasum = crypto.createHmac('sha256',secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');
    if(digest === req.headers['x-razorpay-signature']){
        console.log('request is correct');
    }
    else{
        console.log('false request');
    }
})

app.post('/razorpay', async (req, res) => {
    const paymentCapture = 1;
    const amount = req.body.amount;
    const currency = 'INR';
    //console.log(req.body)
    const options = {
        amount: amount*100,
        currency: currency,
        receipt: shortid.generate(),
        payment_capture: paymentCapture
    }
    try{
        const response = await razorpay.orders.create(options);
        res.json({
            id: response.id,
            currency: 'INR',
            amount: response.amount
        })
    }catch(error){
        console.log(error)
    }
    //console.log('order id has been sent');
})
app.post('/formData', (req, res) => {
    const customer = new chillieCustomer(req.body)
    customer.save()
        .then(() => console.log("data saved to database"))
        .catch(err => console.log(err))
})

app.post('/success', (req, res) => {
    res.sendFile('./sucess.html')
})

var port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Listening to port 3000')
});
