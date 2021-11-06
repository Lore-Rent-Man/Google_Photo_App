
const http = require('http');
const path = require('path');
const express = require('express');
const urlUtil = require('url');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const extName = require('ext-name');
const { TextractClient, AnalyzeDocumentCommand } = require("@aws-sdk/client-textract");
const client = new TextractClient({region: 'us-east-1'});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
    const { body } = req;
    const { NumMedia, From: SenderNumber, MessageSid } = body;
    const mediaItems = [];

    for (var i = 0; i < NumMedia; i++) {  // eslint-disable-line
        const mediaUrl = body[`MediaUrl${i}`];

        const contentType = body[`MediaContentType${i}`];
        const extension = extName.mime(contentType)[0].ext;
    
        if(extension === 'jpeg' || extension === 'png'){
            const mediaSid = path.basename(urlUtil.parse(mediaUrl).pathname);
            const filename = `${mediaSid}.${extension}`;

            mediaItems.push({ mediaSid, MessageSid, mediaUrl, filename });
        }
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

http.createServer(app).listen(1337, () => {
    console.log('Express server listening on port 1337');
});

