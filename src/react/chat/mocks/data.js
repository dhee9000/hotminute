const SENT = 'SENT';
const DELIVERED = 'DELIVERED';
const READ = 'READ';

const HOST = 0;
const OTHER = 1;

export const data = [
    {id: 0, name: 'THOT#1', lastSeen: 'online', messages: [
        {from: 0, message: 'How are u my dear?', date: '2:00', info: READ},
        {from: 1, message: 'Hi im good, WOW u go to private school', date: '2:20'},
        {from: 1, message: 'You must be very rich then', date: '2:21'},
        {from: 0, message: 'Why yes, Im indeed a very wealthy man', date: '2:00', info: READ},
]},
{id: 1, name: 'THOT#2', lastSeen: 'last seen today at 1:20 pm', messages: [
    {from: 0, message: 'Hey Im Bartholomew. How are you fine lady?', date: '1:45', info: READ},
    {from: 1, message: 'Im good, ur soo cute btw', date: '1:47'}
]},
{id: 2, name: 'THOT#3', lastSeen: 'last seen 1 May 2020', messages: [
    {from: 0, message: 'Hey Im Bartholomew. How are you fine lady?', date: '1:45', info: SENT},
]},
{id: 3, name: 'THOT#4', lastSeen: 'last seen Monday at 5:43 pm', messages: [
    {from: 0, message: 'Look at my wrists, Corona', date: '2:37', info: DELIVERED},
]},

]