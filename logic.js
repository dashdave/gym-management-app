//create a function to generate the receipt in pdf
function generateReceipt(paymentInfo) {
  const doc = new pdf();

  // Content of the pdf
  doc.fontSize(16).text("Gym Receipt");
  doc.moveDown();
  doc.fontSize(12).text(`Payment ID: ${paymentInfo.paymentId}`);
  doc.fontSize(12).text(`Amount: ${paymentInfo.amount}`);
  doc.fontSize(12).text(`Date: ${paymentInfo.date}`);

  return doc;
}

async function getContacts(client) {
  await client.initialize();
  let contacts = await client.getContacts();
  console.log(contacts);
  let gymContacts = contacts.filter((contact) => {
    if (contact.name.split(" ")[1].toLowerCase() == "gym") {
      return contact;
    }
  });
  console.log(gymContacts);
}
module.exports = { generateReceipt, getContacts };
