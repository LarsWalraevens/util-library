// zustand is a great state manager

// when you created store, import the store in other file:
//      import useMyStore from '../my-location/useMyStore.js'
//      const myStore = useMyStore();

// example store:
import produce from "immer"; // package to easily change complex object-states, ...
import { create } from 'zustand';
export const useUserStore = create((set) => ({
    userData: false,
    ip: null,
    checkedRememberMe: false,
    replaceUserData(newData) {
        set((state) => produce(state, draft => {
            draft.userData = newData;
        }))
    },
    setData(key, val) {
        set((state) => produce(state, draft => {
            draft[key] = val;
        }))
    },
    replaceIp(newIp) {
        set((state) => produce(state, draft => {
            draft.ip = newIp;
        }))
    },
    changeUserLanguage(props) {
        set((state) => produce(state, draft => {
            draft.userData.language.isoCode = props.isoCode;
            draft.userData.language.id = props.id;
            draft.userData.language.name = props.name;
        }))
    }
}));