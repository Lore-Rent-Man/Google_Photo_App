const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const extName = require('ext-name');
const fetch = require('node-fetch');
const urlUtil = require('url');
const path = require('path');
const fs = require('fs');
const _ = require("lodash");

const Twilio = require('twilio');
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const config = require('./config');
const PUBLIC_DIR = './image_buffer';

let aws = require('aws-sdk');
aws.config.update({
    accessKeyId: config.awsAccesskeyID,
    secretAccessKey: config.awsSecretAccessKey,
    region: config.awsRegion
});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

let twilioClient;
let images = [];
let image_index = 0;

const textract = new aws.Textract();


function getTwilioClient() {
    return twilioClient || new Twilio(config.twilioKey, 
        config.twilioSecretKey);
}

async function SaveMedia(mediaItem) {
    const { mediaUrl, extension } = mediaItem;
    const fullPath = path.resolve(`${PUBLIC_DIR}/image${++image_index}.${extension}`);

    const response = await fetch(mediaUrl);
    const fileStream = fs.createWriteStream(fullPath);

    response.body.pipe(fileStream);

    deleteMediaItem(mediaItem);
    

    images.push(`image${image_index}.${extension}`);
  }

  function deleteMediaItem(mediaItem) {
    const client = getTwilioClient();

    return client
      .api.accounts(config.twilioKey)
      .messages(mediaItem.MessageSid)
      .media(mediaItem.mediaSid).remove();
  }

app.post('/sms', async(req, res) => {
    let mediaItems = [];
    const { body } = req;
    const { NumMedia, From: SenderNumber, MessageSid } = body;
    let saveOperations = [];
    
    for (let i = 0; i < NumMedia; i++) {  // eslint-disable-line
        const mediaUrl = body[`MediaUrl${i}`];
        const contentType = body[`MediaContentType${i}`];
        const extension = extName.mime(contentType)[0].ext;
        if(extension === 'jpeg' || extension === 'png'){
            const mediaSid = path.basename(urlUtil.parse(mediaUrl).pathname);
            const filename = `${mediaSid}.${extension}`;
            mediaItems.push({ mediaSid, MessageSid, mediaUrl, filename, extension });
            saveOperations = mediaItems.map(mediaItem => SaveMedia(mediaItem));
        }
    }

    await Promise.all(saveOperations);

    for(let i = 0; i < images.length; i++){
        let params = {Document: {Bytes: fs.readFileSync(`${PUBLIC_DIR}/${images[i]}`)}, FeatureTypes: ['TABLES']};
        const request = textract.analyzeDocument(params);
        const data = await request.promise();

    }

    const messageBody = NumMedia === 0 ?
    'Send us a sudoku puzzle!' :
    `Thanks for sending us ${NumMedia} file(s)`;

    const response = new MessagingResponse();
    response.message({
      from: '+13186071322',
      to: SenderNumber,
    }, messageBody);
    
    return res.send(response.toString()).status(200);
});

http.createServer(app).listen(1338, () => {
    console.log('Express server listening on port 1338');
});

