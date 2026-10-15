const BASE_URL = process.env.TAD_CHAT_URL || 'http://localhost:3000';
const BOT_NAME = process.env.BOT_NAME || 'my-bot';
const FORUM = process.env.FORUM || 'general-discussion';

const readline = require('readline');
const { json } = require('stream/consumers');
const qotd = require('./data/qotd');
const rl = readline.createInterface({input: process.stdin, output: process.stdout});

console.log(JSON.stringify(BOT_NAME) + " is active in forum " + JSON.stringify(FORUM));
console.log('send a message and hit enter')

async function sendMessage(text) {
    const res = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: BOT_NAME, text, forum: FORUM}),
    });

    const data = await res.json().catch(() =>({}));
    if (!res.ok) {
        throw new Error(data.Error || `Server answered ${res.status}`);
    }
    return data;
}

sendMessage('BOT ' + JSON.stringify(BOT_NAME) + ' has joined the chat')
    .catch((error) => console.error('error: ', error.message));

rl.on('line', async (line) =>{
    sendMessage(line)
        .then(() => console.log('message sent successfully in forum ' + JSON.stringify(FORUM)))
        .catch((error) => console.error('error: ', error.message)); 
})

function sendQotd() {
    const selectedQuestion = qotd[Math.floor(Math.random() * qotd.length)];
    return sendMessage('Todays question of the day: ' + selectedQuestion);
}

const QOTD_HOUR = 8;

function nextQotdTime(after) {
    const next = new Date(after);
    next.setHours(QOTD_HOUR, 0, 0, 0);
    if (next <= after) {
        next.setDate(next.getDate() + 1);
    }
    return next;
}

function scheduleQotd(after = new Date()) {
    const next = nextQotdTime(after);
    console.log('next qotd at ' + next.toLocaleString());

    setTimeout(() => {
        sendQotd()
            .then(() => console.log('qotd sent successfully in forum ' + JSON.stringify(FORUM)))
            .catch((error) => console.error('qotd error: ', error.message));
        scheduleQotd(new Date(Math.max(next, Date.now())));
    }, next - Date.now());
}

scheduleQotd();
sendQotd();
