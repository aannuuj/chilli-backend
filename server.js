const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const shortid = require('shortid');
const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://admin:hariom@chillies.wga9i.mongodb.net/chillyDatabse?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true });


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

app.get('/', function(req, res){
    res.send('<h1>Justice served, cool cool cool cool!</h1>');
  });

app.post('/razorpay', async (req, res) => {
    const paymentCapture = 1;
    const amount = req.body.amount;
    const currency = 'INR';
    const options = {
        amount: amount*100,
        currency: currency,
        receipt: shortid.generate(),
        payment_capture: paymentCapture
    }
    try{
        const response = await razorpay.orders.create(options);
        const customer = new chillieCustomer({...req.body, orderId : response.id})
        customer.save()
        res.status(200)
        res.json({
            id: response.id,
            currency: 'INR',
            amount: response.amount
        })
    }catch(error){
        res.status(404).send({ error: 'Something broke from razorpay, we are fixing this, we request you to try again in a moment' })
        console.log(error)
    }
   
})
app.post('/formData', (req, res) => {
      chillieCustomer.updateOne({orderId : req.body.orderId }, {$set : {paymentId : req.body.paymentId, signature : req.body.signature}})
        .then(() => {
            console.log("data saved to database")
        res.status(200)
    } )
        .catch(err => console.log(err))
})


app.post('/verification',(req, res) => {
    res.json({status: 'ok'});
    const secret = '12345678';
    const crypto = require('crypto');
    const shasum = crypto.createHmac('sha256',secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');
    if(digest === req.headers['x-razorpay-signature']){
        //TODO: change the secret key
        const signature = req.body.id
        chillieCustomer.updateOne({signature : signature }, {$set : {paymentStatus : "paid"}})

        console.log('request is correct');
    }
    else{
        console.log('false request');
    }
})


var port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('Listening to port 3000')
});
