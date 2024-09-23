import {useMutation, useQuery, useQueryClient} from 'react-query';
import {createNote, deleteNote, fetchNotes, updateNote} from '../services/noteService';

export const useNotesQuery = () => {
    return useQuery('notes', fetchNotes);
};

export const useCreateNote = () => {
    const queryClient = useQueryClient();

    return useMutation(createNote, {
        onSuccess: () => {
            queryClient.invalidateQueries('notes');
        },
        onError: (error) => {
            console.error("Error creating note:", error);
        }
    });
};

export const useUpdateNote = () => {
    return useMutation(
        ({ id, note }) => updateNote(id, note),
        {
            onError: (error) => {
                console.error('Error updating note:', error);
            },
        }
    );
};

export const useDeleteNote = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (id) => deleteNote(id),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries('notes');
                console.log('Note deleted:', data);
            },
            onError: (error) => {
                console.error('Error deleting note:', error);
            },
        }
    );
};