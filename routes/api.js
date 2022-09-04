const express = require('express');
const router = express.Router();
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
var lowerCase = require("lower-case");
var capitalize = require("capitalize")




const Filter = require('bad-words');
     
// const dataset = require('../datasets');

// const firebaseConfig = {
//     apiKey: "AIzaSyD-QU0k9BXLs3njM2Dy-CD_7yvCh0uHZxs",
//     authDomain: "beezhive-messages.firebaseapp.com",
//     projectId: "beezhive-messages",
//     storageBucket: "beezhive-messages.appspot.com",
//     messagingSenderId: "84356307266",
//     appId: "1:84356307266:web:00b0e094aada442a9510db",
//     measurementId: "G-2SDQH5XM3K"
//   };
  
// const firebaseapp = initializeApp(firebaseConfig);
// const analytics = getAnalytics(firebaseapp);

var admin = require("firebase-admin");

var serviceAccount = require("E:/Beezhive Project/Beezhive-Sentence-filtering-and-moderation/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// initializeApp();
const db = getFirestore();
  
var filter = new Filter();
var list = require('badwords-list').array;
filter.addWords(...list);



router.post("/",(req,res)=>{
    (async ()=>{ 
        try {
            const docRef = db.collection('messages').doc();
            await docRef.set({
            text:req.body.text
            });
            res.sendStatus(200);
        }
        catch(error){
            console.log(error);
        }
    })();
});

router.get("/check",(req,res)=>{
    var text = lowerCase.lowerCase("tHis is NOT woRKing!!");
    text = capitalize(text);
    res.json(text);
})

router.get("/",(req,res)=>{
    (async()=>{
        try{
            // console.log("before");
            const messagesRef = db.collection('messages');
            const snapshot = await messagesRef.get();
            // console.log(snapshot);
            let data=[];
            snapshot.forEach(doc => {
            data.push(doc.data());
            console.log(doc.id, '=>', doc.data());
            });
            res.json(data);
            
        }
        catch(error){
            console.log(error);
        }
    })();
});

const observer = db.collection('messages')
  .onSnapshot(querySnapshot => {
    querySnapshot.docChanges().forEach(change => {
        (async()=>{
            if (change.type === 'added') {
                
                console.log('New Message: ', change.doc.data());
                var id = change.doc.id;
                var docRef = db.collection('messages').doc(id);
                var text = lowerCase.lowerCase(change.doc.data().text);
                text = capitalize(text);
                text = text.replace(/[^a-zA-Z0-9* ]/g,' ');
                var filtered_text = filter.clean(text);
                var moderated=false;
                if(text !== filtered_text){
                    moderated = true;
                }
                await docRef.set({
                    text:filtered_text,
                    sanitized:true,
                    moderated:moderated
                    });
            }
            if (change.type === 'modified') {
                console.log('Message modified: ', change.doc.data());
                var id = change.doc.id;
                var docRef = db.collection('messages').doc(id);
                var text = lowerCase.lowerCase(change.doc.data().text);
                text = capitalize(text);
                text.replace(/`~@%&()_=:'",.<>/g, ' ');
                text.replace(/[!@#%&;'",.<>]/g,'');
                var filtered_text = filter.clean(text);
                var moderated=change.doc.data().moderated;
                if(text !== filtered_text){
                    moderated = true;
                }
                await docRef.set({
                    text:filtered_text,
                    sanitized:true,
                    moderated:moderated
                });
            }
        })();
    });
});


module.exports = router;