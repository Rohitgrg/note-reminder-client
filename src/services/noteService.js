import axios from "axios";
// const API_URL = 'https://note-reminder-app.onrender.com/';
const API_URL = 'http://127.0.0.1:5000/';

export const fetchNotes = async () => {
    try {
        const response = await fetch(API_URL + 'notes');
        return await response.json();
    } catch (error) {
        console.error("Error fetching notes:", error);
        throw error;
    }
};

export const createNote = async (note) => {
    try {
        const response = await axios.post(API_URL + 'notes', note);
        return response.data;
    } catch (error) {
        console.error("Error creating note:", error);
        if (error.response) {
            throw new Error(`Error: ${error.response.data.message || error.message}`);
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
};

export const updateNote = async (id, note) => {
    try {
        const response = await axios.put(`${API_URL}note/${id}`, note, {
            headers: {
                'Content-Type': 'application/json'
            }
        });        return response.data;
    } catch (error) {
        console.error("Error updating note:", error);
        if (error.response) {
            throw new Error(`Error: ${error.response.data.message || error.message}`);
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
};

export const deleteNote = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}note/${id}`);
        return response.data; // Assuming the server returns the deleted note or a success message
    } catch (error) {
        console.error("Error deleting note:", error);
        if (error.response) {
            throw new Error(`Error: ${error.response.data.message || error.message}`);
        } else {
            throw new Error(`Error: ${error.message}`);
        }
    }
};