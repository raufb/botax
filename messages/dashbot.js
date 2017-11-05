// // const dashbot = require('dashbot')(process.env.DASHBOT_API_KEY).generic;
// // W8wcbHLZu8ECDLKqhPBfKRTf5prKYBtI7p3oQAn8
// const dashbot = require('dashbot')('W8wcbHLZu8ECDLKqhPBfKRTf5prKYBtI7p3oQAn8').generic;
// const messageForDashbot = {
//     "text": "Hi, bot",
//     "userId": "USERIDHERE123123",
//     "conversationId": "GROUPCHATID234",
//     "platformJson": {
//         "whateverJson": "any JSON specific to your platform can be stored here"
//     }
// };
// dashbot.logIncoming(messageForDashbot);
// dashbot.logOutgoing(messageForDashbot);


var axios = require('axios');

function fillPdf(userInfo) {
    return axios.post('http://13.88.28.1:8443/fillform', userInfo);
}

var userInfo = {
    "name": "Rauf",
    "lastname": "Babayev",
    "address": "Some street",
    "city": "Campbell",
    "filingStatus": "2",
    "isLastnameDiff": "1",
    "total_allowances": "123",
    "additional_amount": "345"
};
fillPdf(userInfo).then(function (response) {
        pdfFileName = response.data;
        console.log(typeof pdfFileName);
        // next();
    })
    .catch(function (error) {
        console.log(error);
        // next();
    });