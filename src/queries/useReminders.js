import {useMutation, useQuery, useQueryClient} from 'react-query';
import {createReminder, fetchReminders} from '../services/reminderService';

export const useRemindersQuery = () => {
    return useQuery('reminders', fetchReminders);
};


export const useCreateReminder = () => {
    const queryClient = useQueryClient();
    return useMutation(
        (reminder) => createReminder(reminder),
        {
            onSuccess: () => {
                queryClient.invalidateQueries('reminders');
            },
            onError: (error) => {
                console.error('Error creating reminder:', error);
            },
        }
    );
};