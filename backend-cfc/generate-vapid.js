const webpush = require('web-push');

const vapidKeys = webpush.generateVAPIDKeys();

console.log("\n--- GENERATED VAPID KEYS ---\n");
console.log("Public Key: ", vapidKeys.publicKey);
console.log("Private Key:", vapidKeys.privateKey);
console.log("\n----------------------------\n");
