import React, { useState, useEffect } from "react";
import { PlusIcon, BellIcon, PencilSquareIcon, TrashIcon} from '@heroicons/react/24/solid';
import useDebounce from "../hooks/useDebounce";
import {useNotesQuery, useCreateNote, useUpdateNote, useDeleteNote} from "../queries/useNotes";
import {useCreateReminder, useRemindersQuery} from "../queries/useReminders";

const Note = () => {
    //notes
    const { data: notes, error, isLoading: loadingNotes } = useNotesQuery();
    const { mutate: createNote, isLoading: isCreating, error: createError } = useCreateNote();
    const { mutate: updateNote, isLoading: isUpdating, error: updateError } = useUpdateNote();
    const { mutate: deleteNote, isLoading: isDeleting, error: deleteError } = useDeleteNote();

    //reminders
    const { data: reminders, isLoading: loadingReminders, error: remindersError } = useRemindersQuery();
    const { mutate: createReminder, isLoading: isCreatingReminder, error: createReminderErr } = useCreateReminder();


    const [heading, setHeading] = useState('');
    const [body, setBody] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [dateTime, setDateTime] = useState('');
    const [emailError, setEmailError] = useState('');
    const [dateError, setDateError] = useState('');
    const [headingError, setHeadingError] = useState('');
    const [currentNote, setCurrentNote] = useState(null);
    const [lastUpdated, setLastUpdated] = useState(new Date());


    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleEmailChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            setEmailError("Please enter a valid email address.");
        } else {
            setEmailError("");
        }
    };

    const debouncedBody = useDebounce(body, 1000);

    useEffect(() => {
        if(currentNote === null) {
            const saveNote = async () => {
                if (debouncedBody !== '' && heading !== '') {
                    createNote({heading: heading, body: debouncedBody}, {
                        onSuccess: (newNote) => {
                            setLastUpdated(new Date());
                            setCurrentNote(newNote);
                        },
                        onError: (error) => {
                            console.error("Error creating note:", error);
                        }
                    });
                }
            };
            saveNote();
        } else {
            const updateCurrentNote = async () => {
                if (debouncedBody !== '' && heading !== '') {
                    updateNote( { id: currentNote.id, note: {heading: heading, body: body} }, {
                        onSuccess: (newNote) => {
                            setLastUpdated(new Date());
                            console.log("Note updated")
                        },
                        onError: (error) => {
                            console.error("Error updating note:", error);
                        }
                    });
                }
            };
            updateCurrentNote();
        }
    }, [debouncedBody, createNote]);

    const handleSubmit = () => {
        let isValid = true;

        if (!emailError && !email) {
            setEmailError("Email is required.");
            isValid = false;
        }

        if (!dateTime) {
            setDateError("Date and time are required.");
            isValid = false;
        } else {
            setDateError("");
        }

        if (isValid) {
            createReminder({
                note_id: currentNote.id,
                reminder_date: dateTime,
                email: email
            }, {
                onSuccess: () => {
                    console.log("Reminder created successfully");
                },
                onError: (error) => {
                    console.error("Error creating note:", error);
                }
            });
            toggleModal();
        }
    };

    const handleCreateNew = () => {
        setHeading('');
        setBody('');
        setCurrentNote(null)
    }

    const handleEdit = (id) => {
        if(isUpdating || isDeleting || isCreating) return;
        const toBeEditedNote = notes?.find((note) => note.id === id);
        if(toBeEditedNote){
            setCurrentNote(toBeEditedNote);
            setHeading(toBeEditedNote.heading);
            setBody(toBeEditedNote.body);
        }
    }

    const handleDelete = (id) => {
        if(isUpdating || isDeleting || isCreating) return;
        const toBeDeletedNote = notes?.find((note) => note.id === id);
        if(toBeDeletedNote){
            deleteNote( toBeDeletedNote.id, {
                onSuccess: (newNote) => {
                    if(currentNote.id === toBeDeletedNote.id) handleCreateNew();
                    console.log("Note deleted");
                },
                onError: (error) => {
                    console.error("Error deleting note:", error);
                }
            });
        }
    }

    const getNoteWithId = (id) => {
        return notes?.find(note => note.id === id);
    }

    return (
        <div className="flex flex-col-reverse md:flex-row">
            <div className="w-full md:w-1/3 h-screen bg-[#E2F1FC]">
                <div className="h-[50vh] p-8 overflow-auto">
                    <h1 className="text-xl font-bold italic mb-8">Levo Notes</h1>
                    <p className="text-gray-400 italic mb-4">Recent notes</p>
                    {error && <p>Error fetching notes: {error.message}</p>}
                    <ul className="text-left text-gray-600">
                        {notes && notes.map(note => (
                            <li key={note.id} className="mb-4 p-4 bg-gray-200 rounded">
                                <div className="flex justify-between items-center">
                                    <h2 className="font-bold">{note?.heading}</h2>
                                    <div className="flex gap-2">
                                        <div
                                            onClick={() => handleEdit(note.id)}
                                            className="w-4 h-4 cursor-pointer hover:text-[#259BE9]">
                                            <PencilSquareIcon className="size-4"/>
                                        </div>
                                        <div
                                            onClick={() => handleDelete(note.id)}
                                            className="w-4 h-4 cursor-pointer hover:text-[#259BE9]">
                                            <TrashIcon className="size-4"/>
                                        </div>
                                    </div>
                                </div>
                                <p>{note.body}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="h-[50vh] p-8 overflow-auto">
                    <p className="text-gray-400 italic mb-4">Reminders</p>
                    {remindersError && <p>Error fetching notes: {remindersError.message}</p>}
                    <ul className="text-left text-gray-600">
                        {reminders && reminders.map(reminder => (
                            <>
                                {getNoteWithId(reminder.note_id) && <li key={reminder.id} className="mb-4 p-4 bg-gray-200 rounded">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm italic">Reminder set
                                            at {reminder.reminder_date.toLocaleString()} for {" "}
                                            {getNoteWithId(reminder.note_id)?.heading}</p>
                                    </div>
                                </li>}
                            </>
                        ))}
                    </ul>
                </div>

            </div>
            <div className="w-full md;w-2/3">
                <h1 className="text-xl font-bold p-8">New Note</h1>
                <span className="italic">Please note that heading is required for your note to be saved</span>
                <div className="p-8">
                    <div className="flex justify-between">
                        {currentNote === null || heading === '' ?
                            <p className="text-gray-500 italic text-xs">Not Saved yet</p>
                            : <p className="text-gray-500 italic text-xs">Last updated
                                at: {lastUpdated.toLocaleString()}</p>}
                        <p></p>
                    </div>
                    <div className="flex justify-between gap-2">
                        <input
                            type="text"
                            className="bg-gray-100 rounded w-full h-16 mb-8 pl-8"
                            placeholder={"Your note heading"}
                            value={heading}
                            onChange={(e) => setHeading(e.target.value)}
                        />
                        <div title={"Set reminder"}
                             onClick={toggleModal}
                             className={`mb-8 text-[#259BE9] bg-gray-100 rounded flex justify-center items-center px-4 cursor-pointer
                                ${currentNote === null ? 'bg-gray-500 text-gray-300 cursor-not-allowed' : 'hover:bg-[#259BE9] hover:text-white'}
                            `}>
                            <BellIcon className="size-8"/>
                        </div>
                    </div>
                    <div>
                        <textarea
                            className="bg-gray-100 rounded w-full p-8"
                            rows={15}
                            placeholder={"Your note"}
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                        ></textarea>
                    </div>
                </div>
            </div>
            <div
                onClick={handleCreateNew}
                className="h-20 w-20 bg-[#259BE9] rounded-full flex justify-center items-center fixed bottom-8 right-8 cursor-pointer text-white hover:text-[#259BE9] hover:bg-[#E2F1FC]">
                <PlusIcon className="size-12 "/>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-8 rounded shadow-lg w-1/3">
                        <h2 className="text-lg font-bold mb-4">Enter Details</h2>
                        <div>
                            <input
                                type="email"
                                className={`border border-gray-300 bg-gray-100 rounded w-full h-12 pl-2 ${emailError ? 'border-red-300' : ''}`}
                                placeholder="Your email"
                                value={email}
                                onChange={handleEmailChange}
                            />
                            {emailError && <p className="text-red-500">{emailError}</p>}
                        </div>
                        <div>
                            <input
                                type="datetime-local"
                                className={`border border-gray-300 bg-gray-100 rounded w-full h-12 pl-2 mt-4 ${dateError ? 'border-red-300' : ''}`}
                                value={dateTime}
                                onChange={(e) => {
                                    setDateTime(e.target.value);
                                    setDateError('');
                                }}
                            />
                            {dateError && <p className="text-red-500">{dateError}</p>}
                        </div>
                        <div className="flex justify-end mt-4">
                            <button
                                className="bg-blue-500 text-white rounded px-4 py-2 mr-2"
                                onClick={handleSubmit}
                            >
                                Confirm
                            </button>
                            <button
                                className="bg-gray-300 text-black rounded px-4 py-2"
                                onClick={toggleModal}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {createError && <p className="text-red-500">Error fetching notes: {createError.message}</p>}
            {updateError && <p className="text-red-500">Error fetching notes: {updateError.message}</p>}
            {deleteError && <p className="text-red-500">Error fetching notes: {deleteError.message}</p>}
        </div>
    );
};

export default Note;
