const functions = require("firebase-functions");
const admin = require("firebase-admin");

// admin SDKでfireStoreを使う
admin.initializeApp(functions.config().firebase);

// データベースの参照を取得する
const fireStore = admin.firestore();

// firestoreに格納されているデータを取得しにいく関数
exports.getFirestore = functions.https.onRequest((req, res) => {
  const params = req.body;
  const documentId = params.documentId;

  if (documentId) {
    // 'test'というcollectionの中の任意のdocumentに格納されているデータを取得する
    const testRef = fireStore.collection('test');
    testRef.doc(documentId).get().then((doc) => {
      if (doc.exists) {
        res.status(200).send(doc.data());
      } else {
        res.status(200).send("document not found");
      }
    });
  } else {
    res.status(400).send({errorMessaage: 'document id not found'});
  }
});

// 渡されたパラメータのスキーマをチェックする
const validateParamsSchema = (params) => {
  const hasId = 'id' in params;
  const hasName = 'name' in params;
  const hasDocumentId = 'documentId' in params;

  return hasId && hasName && hasDocumentId;
};

// firestoreに任意のデータを保存する
exports.saveFirestore = functions.https.onRequest((req, res) => {
  const params = req.body;
  // パラメータのスキーマのチェック
  if (!validateParamsSchema(params)) {
    res.status(400).send({errorMessaage: 'パラメータが不正です'});
  } else {
    const db = fireStore;
    // 'test'というcollectionがある前提で任意のドキュメントIDのdocumentを生成する
    db.doc(`test/${params.documentId}`).set({
      id: params.id,
      name: params.name,
    });

    // 非同期的に保存したデータを参照する
    db.collection('test')
        .doc(params.documentId)
        .onSnapshot((doc) => {
          res.status(200).send(doc.data());
        });
  }
});
