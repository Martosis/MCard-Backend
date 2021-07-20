var admin = require("firebase-admin");

var serviceAccount = require("./mcard-80e95-firebase-adminsdk-okrfs-ad40e0da9f.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://mcard-80e95-default-rtdb.firebaseio.com",
});

const message = {
	notification: {
		title: "Test",
		body: "Does it work in the background?",
	},
	token:
		"fovtA2pbYWBdWpS8pM7wTf:APA91bFNR9nRevwzQGkjHJq6sVrWqIPAL7nc-XmrLm9YnfX9wwliDj_on43PiccguiH1w8IEgKhE37hW2x1rNdGe_nS4I00iKFUPHSBRo2WwKZDdDFS4IsGXwpRNti8CKw3WT_2Hw99b",
};

admin
	.messaging()
	.send(message)
	.then((_) => {
		console.log("Success");
	})
	.catch((err) => {
		console.error(err);
	});
