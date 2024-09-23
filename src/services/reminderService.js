import axios from "axios";

//const API_URL = 'https://note-reminder-app.onrender.com/reminders';
const API_URL = 'http://127.0.0.1:5000/reminders';

export const fetchReminders = async () => {
    const response = await axios.get(API_URL);
    return response.data; // Return the list of reminders
};

export const createReminder = async (reminder) => {
    const response = await axios.post(API_URL, reminder, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    return response.data; // Return the created reminder object
};
