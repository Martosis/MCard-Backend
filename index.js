const admin = require("firebase-admin");
const cron = require("node-cron");

const serviceAccount = require("./mcard-80e95-firebase-adminsdk-okrfs-ad40e0da9f.json");

admin.initializeApp({
	credential: admin.credential.cert(serviceAccount),
	databaseURL: "https://mcard-80e95-default-rtdb.firebaseio.com",
});

cron.schedule("* * * * *", async () => {
	const time = admin.firestore.Timestamp.now();

	const tasks = await admin
		.firestore()
		.collection("tasks")
		.where("performAt", "<=", time)
		.get();

	const jobs = [];

	tasks.forEach((snap) => {
		const { worker, options } = snap.data();
		const job = workers[worker](options)
			.then(() => {
				snap.ref.delete();
			})
			.catch(() => {
				snap.ref.delete();
			});

		jobs.push(job);
	});

	return await Promise.all(jobs);
});

const workers = {
	notification: async (options) => {
		admin
			.database()
			.ref(`tasks/${options.userId}/${options.taskId}`)
			.get()
			.then(async (snap) => {
				if (snap.exists()) {
					const query = admin
						.firestore()
						.collection("devices")
						.where("id", "==", options.userId);
					const deviceIds = await query.get();

					const devices = [];

					deviceIds.forEach((snap) => {
						devices.push(snap.id);
					});

					if (devices.length == 0) return;

					const message = {
						notification: {
							title: snap.val().course,
							body: snap.val().name,
						},
						tokens: devices,
					};

					admin
						.messaging()
						.sendMulticast(message)
						.catch((err) => console.error(err));
				}
			})
			.catch((err) => console.error(err));
	},
};

/*
const message = {
	notification: {
		title: "Test",
		body: "Does it work in the background?",
	},
	token:
		"cVMMrOTLULKQLK_tBK_pkB:APA91bEzR4eCUH386uW6YzR2_34XN5kUGmIMJy7fxCS2iq_OkWKrcEMxbwTQbiKEYEYK_frc7YzgTlmTA0-G88klQ31I4sjocQd3r-1vsUiMAmWKQ3BY4gpV6U5uKvExwkwWrg0nHZRp",
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
*/
