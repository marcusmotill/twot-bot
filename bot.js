var HTTPS = require('https');
var _ = require('lodash');
var Twitter = require('twitter');
var async = require('async');

var botID = process.env.BOT_ID;

var client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.TWITTER_ACCESS_TOKEN_KEY,
    access_token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
});

function respond() {
    var request = JSON.parse(this.req.chunks[0]),
        botRegex = /^\/twot*/;

    if (request.text && botRegex.test(request.text)) {
        this.res.writeHead(200);
        postMessage(request.text);
        this.res.end();
    } else {
        console.log("don't care");
        this.res.writeHead(200);
        this.res.end();
    }
}

function postMessage(message) {
    var botResponse, options, body, botReq;

    options = {
        hostname: 'api.groupme.com',
        path: '/v3/bots/post',
        method: 'POST'
    };

    body = {
        "bot_id": botID
    };

    async.series([
            function(cb) {
                if (!message) {
                    botResponse = "Error message not must be defined";
                    cb(botResponse);
                    return;
                } else {
                    message = test.split('/twot');
                    message = _.get(message, '1', undefined);

                    if (message) {
                        message = message.trim();
                    } else {
                        botResponse = "Error message not must be defined";
                        cb(botResponse);
                        return;
                    }
                }
                cb();
            },
            function(cb) {
                client.post('statuses/update', {
                    status: message
                }, function(error, tweet, response) {
                    if (error) {
                        cb(error);
                        return;
                    }
                    botResponse = "Successfully Tweeted";
                    console.log(tweet); // Tweet body. 
                    console.log(response); // Raw response object. 
                    cb();
                });
            },
            function(cb) {
                _.set(body, 'text', botResponse);
                
                cb();
            }
        ],

        function(err, results) {
            if (err) {
                console.error(err);
                return;
            }
            console.log('sending ' + botResponse + ' to ' + botID);

            botReq = HTTPS.request(options, function(res) {
                if (res.statusCode == 202) {
                    //neat
                } else {
                    console.log('rejecting bad status code ' + res.statusCode);
                }
            });

            botReq.on('error', function(err) {
                console.log('error posting message ' + JSON.stringify(err));
            });
            botReq.on('timeout', function(err) {
                console.log('timeout posting message ' + JSON.stringify(err));
            });
            botReq.end(JSON.stringify(body));
        });
}


exports.respond = respond;
