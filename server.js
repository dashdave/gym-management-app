import express from 'express';
import bodyParser from 'body-parser';
import pdf from 'pdfkit';
import { Client } from 'Whats-web.js';
import twilio from 'twilio';


// create a new express app
const app = express();

// configure the app to use the bodyParser
app.use(bodyParser.urlencoded({extended: true}));

// create the database
const payments =[];

//create a function to generate the receipt in pdf
app.get('/generate-receipt', (req, res) => {
    function generateReceipt(paymentInfo) {
        const doc = new pdf();

        // Content of the pdf
        doc.fontSize(16).text('Gym Receipt');
        doc.moveDown();
        doc.fontSize(12).text(`Payment ID: ${paymentInfo.paymentId}`);
        doc.fontSize(12).text(`Amount: ${paymentInfo.amount}`);
        doc.fontSize(12).text(`Date: ${paymentInfo.date}`);

        return doc
    }

});

// setup the whatsapp client
const client = new Client({
    session: false,
    pupperteer: {
        headless: true,
        args: ['--no-sandbox'],
    },
});

client.on('qr', (qr) => {
    console.log('QR code:', qr);
});

client.on('ready', ()=> {
    console.log('Whatsapp client is ready')
});

client.initialize();

// define a route to handle payments
app.post('/payments', (req, res) => {

    const {name, email, amount, date} = req.body

    payments.push({name, email, amount, date});

    // extract payment information from the request body
    const paymentInfo = req.body.payments;

    // generate a receipt based on the payment information
    const receipt = generateReceipt(paymentInfo);

    // generate a pdf recepit to the client as an attachment
    res.set('Content-Disposition', 'attachment; filename=receipt.pdf');
    res.type('application/pdf');
    res.send(receipt);
});

// define a route via whatsapp to send a reminder
app.post('/reminder', (req, res) => {
    const {name, phone, subscriptionEnd} = req.body;

    const daysUntilDue = Math.floor((new Date(subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24));

    if (daysUntilDue <= 7) {
        const message = `Hi ${name}, Your gym subscription is due in ${daysUntilDue}, please make sure you renew your subscription.`;
        client.sendMessage(`whatsapp:${phone}@.us`, message);
    }

    res.send('Reminder sent');
});

app.listen(3000, () => {
    console.log('Server started on the port 3000');
});