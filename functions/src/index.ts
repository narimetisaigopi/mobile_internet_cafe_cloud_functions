import { firestore, messaging } from 'firebase-admin';
import admin = require('firebase-admin');
import * as functions from 'firebase-functions';


admin.initializeApp(functions.config().firebase);


// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
// export const helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


export const chatPushNotifications = functions.firestore.document('chats/{roomid}/conversations/{messageid}').onCreate((snap, context) => {
    const message = snap.data();
    const receiverID = message['receiverID'];

    console.log(snap.id+' ==>  receiverID: '+receiverID);

    return firestore().doc("users/" + receiverID).get().then((userSnap) => {
        const token = userSnap.get('firebaseToken');

        console.log('notification sending to >> '+userSnap.get('uid'));

        if (token != null) {
            functions.logger.info("New message arrived " + snap.data.toString);
            const payload = {
                notification: {
                    title: "New Message",
                    body: ""+message['message'],
                    icon: "default",
                },
                data: {
                    p_tab: "2"
                }
            };
            messaging().sendToDevice(token, payload).then((response) => {
                console.log('chatPushNotifications sent', response);
            }).catch((error) => {
                console.log('chatPushNotifications failed: ', error);
            });
        }else{
            console.log("firebaseToken is null ");
        }


    }).catch((error) => {
        console.log('get user failed: ', error);
    });

});

