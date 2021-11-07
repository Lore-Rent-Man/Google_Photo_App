const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const extName = require('ext-name');
const fetch = require('node-fetch');
const urlUtil = require('url');
const path = require('path');
const fs = require('fs');

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

    if (!fs.existsSync(fullPath)) {
        const response = await fetch(mediaUrl);
        const fileStream = fs.createWriteStream(fullPath);

        response.body.pipe(fileStream);

        deleteMediaItem(mediaItem);
    }

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
        let params = {Document: {Bytes: fs.readFileSync(`${PUBLIC_DIR}/${images[i]}`)}};
        const request = textract.detectDocumentText(params);
        const data = await request.promise();
        console.log(getTable(data));
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

function getTable(response){
    let blocks = response["Blocks"];
    let tables = Array(9);
    for(let i = 0; i < 9; i++){
        tables.push(Array(9));
    }
    for(let i = 0; i < blocks.length; i++){
        if(blocks[i].BlockType === "TABLE"){
            let relationships = blocks[i].relationships.Ids;
            if(relationships.length !== 81){
                return undefined;
            }
            else
            {  
                for(let j = 0; j < relationships.length; j++){
                    let e = blocks.find(e.Id === relationships[j]);
                    if(e.RowIndex < 9 && e.ColumnIndex < 9){
                        if(e.Text){
                            tables[e.RowIndex][e.ColumnIndex] = e.Text;
                        }
                    }
                    else
                    {
                        return undefined;
                    }
                }
            }
        }
    }
    return tables;
}

http.createServer(app).listen(1338, () => {
    console.log('Express server listening on port 1338');
});

