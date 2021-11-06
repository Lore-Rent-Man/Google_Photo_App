const http = require('http');
const path = require('path');
const express = require('express');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const bodyParser = require('body-parser');
const extName = require('ext-name');
const fetch = require('node-fetch');
const FileReader = require('filereader');

const { TextractClient, AnalyzeDocumentCommand } = require("@aws-sdk/client-textract");
const client = new TextractClient({region: 'us-east-1'});

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', async(req, res) => {
    const { body } = req;
    const { NumMedia, From: SenderNumber, MessageSid } = body;
    let reader = new FileReader();
    for (let i = 0; i < NumMedia; i++) {  // eslint-disable-line
        let data = [];
        const mediaUrl = body[`MediaUrl${i}`];
        const contentType = body[`MediaContentType${i}`];
        const extension = extName.mime(contentType)[0].ext;
    
        if(extension === 'jpeg' || extension === 'png'){
            let response = await fetch(mediaUrl).then(response => response.blob()).then(imageBlob => URL.createObjectURL(imageBlob));
            console.log(response);
            reader.readAsDataURL(response); 
            reader.onloadend = function() {
                var base64data = reader.result;                
                console.log(base64data);
            }
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

