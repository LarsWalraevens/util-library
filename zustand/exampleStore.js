// Zustand is a great state manager

// When you create a store, import the store in other files:
// import useMyStore from '../my-location/useMyStore.js'
// const myStore = useMyStore();

// Example store:
import produce from "immer"; // Package to easily change complex object states
import { create } from 'zustand';

export const useUserStore = create((set) => ({
    userData: false, // Initial state for userData
    ip: null, // Initial state for ip
    checkedRememberMe: false, // Initial state for checkedRememberMe

    replaceUserData(newData) {
        // Action to replace userData with new data
        set((state) =>
            produce(state, (draft) => {
                draft.userData = newData;
            })
        );
    },

    setData(key, val) {
        // Action to set specific data in the store
        set((state) =>
            produce(state, (draft) => {
                draft[key] = val;
            })
        );
    },

    replaceIp(newIp) {
        // Action to replace the ip with a new value
        set((state) =>
            produce(state, (draft) => {
                draft.ip = newIp;
            })
        );
    },

    changeUserLanguage(props) {
        // Action to change the user's language
        set((state) =>
            produce(state, (draft) => {
                draft.userData.language.isoCode = props.isoCode;
                draft.userData.language.id = props.id;
                draft.userData.language.name = props.name;
            })
        );
    },
}));
