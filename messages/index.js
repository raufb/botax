/*-----------------------------------------------------------------------------
This template demonstrates how to use Waterfalls to collect input from a user using a sequence of steps.
For a complete walkthrough of creating this type of bot see the article at
https://aka.ms/abs-node-waterfall
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");
var path = require('path');
var axios = require('axios');
// var pdfFiller = require('pdffiller');
var useEmulator = (process.env.NODE_ENV == 'development');
var dashbot = require('dashbot')('2qKw1BFKRDK4xPXlEPMpehP0muQI2gMayCZKTShU').generic;
var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});
var calculate = require('./calculate');

var bot = new builder.UniversalBot(connector);
var userId;
var conversationId;

var promptChoices = {
    "yes": true,
    "no": false
};

var paymentFrequencyChoice = {
    "weekly": 1,
    "bi-weekly": 2,
    "month": 4
};

var userInfo = {
    name: 'Sam',
    lastname: 'Ahmadov',
    isLastnameDiff: false,
    address: '3200 Zanker',
    city: 'San jose',
    state: 'CA',
    zip: '95134',
    paymentFrequency: 1,
    hasMultipleJobs: false,
    isMarried: true,
    isFillingJointly: true,
    hasWorkingSpouse: false,
    spending: false,
    numberOfKids: 0,
    income_first: 0,
    income_second: 0,
    numberOfOtherDependents: 0,
    dependentCare: false,
    isDependent: false
}
bot.localePath(path.join(__dirname, './locale'));
bot.set(`persistUserData`, true);

bot.dialog("/", [
    function (session) {
        session.beginDialog("mainMenu")
    }
]);

bot.dialog('w4', [
    function (session) {
        var message = "What is your name?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message, {
            speak: message,
            retrySpeak: message
        });
    },
    function (session, results) {
        userInfo.name = results.response;
        logIncomingMessage(results.response);
        var message = "Hi " + userInfo.name + ". I'm here to help you with filling W-4 form! You just need to answer couple of quesitons!";
        logOutgoingMessage(message);
        session.send(message);
        var message = 'What is your lastname?';
        logOutgoingMessage(message);
        builder.Prompts.text(session, message, {
            speak: message
        });
    },
    function (session, results) {
        userInfo.lastname = results.response;
        logIncomingMessage(results.response);
        var message = "Is your name is different than on SSN?";
        var options = "yes |no";
        logOutgoingMessage(message);
        builder.Prompts.choice(session, message, promptChoices, {
            speak: message,
            listStyle: builder.ListStyle.button
        });
        userInfo.isLastnameDiff = results.response;
    },
    function (session, results) {
        userInfo.isLastnameDiff = promptChoices[results.response.entity];
        logIncomingMessage(results.response.entity);
        var message = "What is your street addres?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message, {
            speak: message
        });
    },
    function (session, results) {
        userInfo.address = results.response;
        logIncomingMessage(results.response);
        var message = "What is your city?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message, {
            speak: message
        });
    },
    function (session, results) {
        userInfo.city = results.response;
        logIncomingMessage(results.response);
        var message = "What is your state?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message, {
            speak: message
        });
    },
    function (session, results) {
        userInfo.state = results.response;
        logIncomingMessage(results.response);
        var message = "What is your zipcode?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message, {
            speak: message
        });
    },
    function (session, results) {
        userInfo.zip = results.response;
        logIncomingMessage(results.response);
        var message = "How frequently are you paid?";
        builder.Prompts.choice(session, message, paymentFrequencyChoice, {
            speak: message,
            listStyle: builder.ListStyle.button
        });
        logOutgoingMessage(message);
    },
    function (session, results) {
        userInfo.paymentFrequency = paymentFrequencyChoice[results.response.entity];
        logIncomingMessage(results.response.entity);
        var message = "Do you have more than 1 jobs?";
        logOutgoingMessage(message);
        builder.Prompts.choice(session, message, promptChoices, {
            speak: message,
            listStyle: builder.ListStyle.button
        });
    },
    function (session, results) {
        userInfo.hasMultipleJobs = promptChoices[results.response.entity];
        logIncomingMessage(results.response.entity);
        var message = "Are you married?";
        logOutgoingMessage(message);
        builder.Prompts.choice(session, message, promptChoices, {
            speak: message,
            listStyle: builder.ListStyle.button
        });
    },
    function (session, results) {
        userInfo.isMarried = promptChoices[results.response.entity];
        logIncomingMessage(results.response.entity);
        if (userInfo.isMarried) {
            logIncomingMessage(results.response.entity);
            var message = "Are you filling jointly?";
            logOutgoingMessage(message);
            builder.Prompts.choice(session, message, promptChoices, {
                speak: message,
                listStyle: builder.ListStyle.button
            });
        } else {
            next();
        }
    },
    function (session, results) {
        if (userInfo.isMarried) {
            userInfo.isFillingJointly = promptChoices[results.response.entity];
            logIncomingMessage(results.response.entity);
            var message = "Is your spouse working?";
            logOutgoingMessage(message);
            builder.Prompts.choice(session, message, promptChoices, {
                listStyle: builder.ListStyle.button
            });
        } else {
            next();
        }

    },
    // function (session, results) {
    //     session.send(results);
    //     if (results && results.response) {
    //         session.send("There is result");
    //         session.send(results.response.entity);
    //         userInfo.hasWorkingSpouse = promptChoices[results.response.entity];
    //     }
    //     if (userInfo.isMarried) {
    //         next();
    //     } else {
    //         session.send("test");
    //         var message = "Are you spending more than 50% of you income to support home for yourself and your and dependents?";
    //         logOutgoingMessage(message);
    //         builder.Prompts.choice(session, message, promptChoices, {
    //             listStyle: builder.ListStyle.button
    //         });
    //     }
    // },
    function (session, results) {
        if (!userInfo.isMarried || !results) {
            userInfo.spending = promptChoices[results.response.entity];
            logIncomingMessage(results.response.entity);
        }
        var message = "How many kids do you have?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message);
    },
    function (session, results) {
        userInfo.numberOfKids = results.response;
        logIncomingMessage(results.response);
        var message = "What is your first job income?";
        logOutgoingMessage(message);
        builder.Prompts.text(session, message);
    },
    function (session, results) {
        userInfo.income_first = results.response;
        logIncomingMessage(results.response);
        // if (userInfo.isMarried) {
        //     var message = "What is your spouse income?";
        //     logOutgoingMessage(message);
        //     builder.Prompts.number(session, message);
        // } else {
        //     next();
        // }
        if (userInfo.hasMultipleJobs) {
            var message = "What is your second job income?";
            logOutgoingMessage(message);
            builder.Prompts.number(session, message);
        } else {
            userInfo.income_second = 0;
            next();
        }
        // }
    },
    // function (session, results) {
    //     if (!userInfo.income_second && results.response) {
    //         userInfo.income_second = results.response;
    //     }
    //     var message = "How many dependents do you have other than kid dependents?";
    //     logOutgoingMessage(message);
    //     builder.Prompts.number(session, message);
    // },
    // function (session, results) {
    //     userInfo.numberOfOtherDependents = results.response;
    //     if (userInfo.numberOfKids > 0) {
    //         var message = "Do you plan to spend more than 2000 on child care?";
    //         logOutgoingMessage(message);
    //         builder.Prompts.text(session, message);
    //     } else {
    //         userInfo.dependentCare = 0;
    //         next();
    //     }
    // },
    // function (session, results) {
    //     if (results.response) {
    //         userInfo.dependentCare = results.response;
    //     }
    //     var message = "Can someone claim you as dependent?";
    //     logOutgoingMessage(message);
    //     builder.Prompts.choice(session, message, promptChoices, {
    //         listStyle: builder.ListStyle.button
    //     });
    // },
    function (session, results) {
        userInfo.isDependent = promptChoices[results.response.entity];
        logIncomingMessage(results.response.entity);
        var result = calculate(userInfo);
        var pdfFileName = "";
        result.total_allowances = 3;
        fillPdf(result)
            .then(function (response) {
                pdfFileName = response.data;
                session.send("Created file " + 'http://13.88.28.1:8443' + pdfFileName);
                session.send("Please enter your SSN, sign and send it to your employeer!");
            })
            .catch(function (error) {
                session.send('error');
            });
        var message = "Do you have any quesitons?";
        builder.Prompts.choice(session, message, promptChoices, {
            listStyle: builder.ListStyle.button
        });
    },
    function (session, results) {
        var ok = promptChoices[results.response.entity];
        var message = '';
        if (ok) {
            // TODO go to qa
        } else {
            message = `Thank you ${userInfo.name}! Let me know if you need help!`;
            session.send(message);
        }
        session.endDialog();
    }
])

bot.dialog("questions", [
    function (session) {
        session.send("Sorry. We don't have this option right now. Please choose another option!");
        session.beginDialog("mainMenu");
    }
]);


function fillPdf(userInfo) {
    return axios.post('http://13.88.28.1:8443/fillform', userInfo);
}


bot.dialog('people', [
        function (session, results) {
            var message = "How many people are in your party?";
            logOutgoingMessage(message);
            builder.Prompts.text(session, message);
        },

        function (session, results) {
            logIncomingMessage(results.response);
            session.endDialogWithResult(results);
        }
    ])
    .beginDialogAction('partySizeHelpAction', 'partySizeHelp', {
        matches: /^help$/i
    });

// Context Help dialog for party size
bot.dialog('partySizeHelp', function (session, args, next) {
    var msg = "Party size help: Our restaurant can support party sizes up to 150 members.";
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


bot.dialog('help', [
        function (session) {
            session.send("Please ask question");
        }
    ])
    .triggerAction({
        matches: /^help$/i,
        confirmPrompt: "This will cancel your current request. Are you sure?"
    });

// bot.dialog('help', [
//         function (session) {
//             session.send("Please ask question");
//         }
//     ])
//     .customAction({
//         matches: /^help$/i,
//         confirmPrompt: "This will cancel your current request. Are you sure?"
//     });


var menuItems = {
    "Fill W4 form": {
        item: "w4"
    },
    "Fill W1040 form": {
        item: "w1040"
    },
    "Ask quesiton": {
        item: "help"
    },
}


bot.dialog("cancel", [
        function (session) {
            session.beginDialog("mainMenu");
        }
    ])
    .triggerAction({
        // The user can request this at any time.
        // Once triggered, it clears the stack and prompts the main menu again.
        matches: /^exit$/i,
        confirmPrompt: "This will cancel your request. Are you sure?"
    });

bot.dialog("mainMenu", [
        function (session) {
            builder.Prompts.choice(session, "Main Menu:", menuItems, {
                speak: "Main Menu",
                listStyle: builder.ListStyle.button
            });
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
        "userId": "12345",
        "conversationId": "123456789",
    };
    dashbot.logOutgoing(messageForDashbot);
}

function logIncomingMessage(message) {
    var messageForDashbot = {
        "text": message,
        "userId": "12345",
        "conversationId": "123456789",
    };
    dashbot.logIncoming(messageForDashbot);
}

const logUserConversation = (event) => {
    // logIncomingMessage(event.address.user.id);

};

// Middleware for logging
bot.use({
    receive: function (event, next) {
        logUserConversation(event);
        userId = event.address.user.id;
        conversationId = event.address.conversation.id;
        next();
    },
    send: function (event, next) {
        logUserConversation(event);
        next();
    }
});

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