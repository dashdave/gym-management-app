const express = require("express");
const bodyParser = require("body-parser");
const pdfKit = require("pdfkit");
const { Client, LocalAuth } = require("whatsapp-web.js");
const twilio = require("twilio");
const qrcode = require("qrcode-terminal");
const { generateReceipt } = require("./logic");

// create a new express app
const app = express();

// configure the app to use the bodyParser
app.use(bodyParser.urlencoded({ extended: true }));

// create the database

const payments = [];

// setup the whatsapp client
const client = new Client({
  authStrategy: new LocalAuth(),
  pupperteer: {
    headless: true,
    args: ["--no-sandbox"],
  },
});

client.on("qr", (qr) => {
  console.log("QR code:", qr);
  qrcode.generate(qr, { small: true }, function (qrcode) {
    console.log(qrcode);
  });
});

client.on("ready", () => {
  console.log("Whatsapp client is ready");
});

client.initialize();
async function getContacts() {
  let contacts = await client.getContacts();
  console.log(contacts);
  let gymContacts = contacts.filter((contact) => {
    if (contact.name.split(" ")[1].toLowerCase() == "gym") {
      return contact;
    }
  });
  return gymContacts;
}

// define a route to handle payments
app.post("/payments", (req, res) => {
  const { name, email, amount, date } = req.body;

  payments.push({ name, email, amount, date });

  // extract payment information from the request body
  const paymentInfo = req.body.payments;

  // generate a receipt based on the payment information
  const receipt = generateReceipt(paymentInfo);

  // generate a pdf recepit to the client as an attachment
  res.set("Content-Disposition", "attachment; filename=receipt.pdf");
  res.type("application/pdf");
  res.send(receipt);
});

// define a route via whatsapp to send a reminder
app.post("/reminder", (req, res) => {
  const { name, phone, subscriptionEnd } = req.body;

  const daysUntilDue = Math.floor(
    (new Date(subscriptionEnd) - new Date()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilDue <= 7) {
    const message = `Hi ${name}, Your gym subscription is due in ${daysUntilDue}, please make sure you renew your subscription.`;
    client.sendMessage(`whatsapp:${phone}@.us`, message);
  }

  res.send("Reminder sent");
});

app.listen(3000, () => {
  console.log("Server started on the port 3000");
});
