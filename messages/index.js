/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-waterfall
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
// var pdfFiller = require('pdffiller');
var useEmulator = (process.env.NODE_ENV == 'development');
var dashbot = require('dashbot')('W8wcbHLZu8ECDLKqhPBfKRTf5prKYBtI7p3oQAn8').generic;

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);
var userId;
var connectionId;

bot.localePath(path.join(__dirname, './locale'));
// Dialog to ask for number of people in the party

// bot.dialog('/', [
//     function (session) {
//         builder.Prompts.text(session, "Salam... What's your name?");
//     },
//     function (session, results) {
//         builder.Prompts.number(session, "Hi " + results.response + ", How many years have you been coding?"); 
//     },
//     function (session, results) {
//         session.userData.coding = results.response;
//         builder.Prompts.choice(session, "What language do you code Node using?", ["JavaScript", "CoffeeScript", "TypeScript"]);
//     },
//     function (session, results) {
//         session.userData.language = results.response.entity;
//         session.send("Got it... " + session.userData.name + 
//                     " you've been programming for " + session.userData.coding + 
//                     " years and use " + session.userData.language + ".");
//     }
// ]);



bot.dialog('/', [
        function (session) {
            var message = "How many people are in your party?";
            this.logOutgoingMessage(mesaage);
            builder.Prompts.text(session, message);
        },

        function (session, results) {
            console.log("results");
            session.endDialogWithResult(results);
        }
    ])
    .beginDialogAction('partySizeHelpAction', 'partySizeHelp', {
        matches: /^help$/i
    });

// Context Help dialog for party size
bot.dialog('partySizeHelp', function (session, args, next) {
    var msg = "P    arty size help: Our restaurant can support party sizes up to 150 members.";
    session.endDialog(msg);
})

bot.dialog('children', [
        function (session) {
            builder.Prompts.text(session, "How many children do you have?");
        },

        function (session, results) {
            session.send("Thanks!");
        }
    ])
    .triggerAction({
        matches: /^children$/i,
        confirmPrompt: "This will cancel your current request. Are you sure?"
    });


bot.dialog('pdf', [
        function (session) {
            // var sourcePdf = '/data/fw4.pdf';
            // var destPdf = '/data/fw4_filled.pdf';
            // var data = {
            //     "topmostSubform[0].page1[0].f1_01_0_[0]": "34",
            //     "topmostSubform[0].page1[0].f1_02_0_[0]": "66"
            // };

            // pdfFiller.fillForm(sourcePdf, destPdf, data, function (err) {
            //     if (err) session.send('Error saving pdf');
            //     console.log("Error saving pdf");
            // });
            builder.Prompts.text(session, "How many children do you have?");
        },

        function (session, results) {
            session.send("Thanks!");
        }
    ])
    .triggerAction({
        matches: /^pdf$/i,
        confirmPrompt: "This will cancel your current request. Are you sure?"
    });

var menuItems = {
    "Order dinner": {
        item: "orderDinner"
    },
    "Dinner reservation": {
        item: "dinnerReservation"
    },
    "Schedule shuttle": {
        item: "scheduleShuttle"
    },
    "Request wake-up call": {
        item: "wakeupCall"
    },
}


bot.dialog("mainMenu", [
        function (session) {
            builder.Prompts.choice(session, "Main Menu:", menuItems);
        },
        function (session, results) {
            if (results.response) {
                session.beginDialog(menuItems[results.response.entity].item);
            }
        }
    ])
    .triggerAction({
        // The user can request this at any time.
        // Once triggered, it clears the stack and prompts the main menu again.
        matches: /^main menu$/i,
        confirmPrompt: "This will cancel your request. Are you sure?"
    });

function logOutgoingMessage(message) {
    var messageForDashbot = {
        "text": message,
        "userId": "USERIDHERE123123",
        "conversationId": "GROUPCHATID234",
    };
    dashbot.logOutgoing(messageForDashbot);
}

function logIncomingMessage(message) {
    var messageForDashbot = {
        "text": message,
        "userId": "USERIDHERE123123",
        "conversationId": "GROUPCHATID234",
    };
    dashbot.logIncoming(messageForDashbot);
}

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function () {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());
} else {
    module.exports = {
        default: connector.listen()
    }
}