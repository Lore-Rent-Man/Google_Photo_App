const accountSid = 'AC943628050b3ca15020f9da7079b4b24e';
const authToken = 'a55f8dc0ab55fdea3ba731bf5d7b5197';
const client = require('twilio')(accountSid, authToken);

client.messages
  .create({
     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
     //From twilio generated number
     from: '+19284371746',
     //To user phone number
     to: '+16467758492'
   })
  .then(message => console.log(message.sid));