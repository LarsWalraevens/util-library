// https://jotai.org/

// Create an atom and export it! This basically keeps track of the current state.
export const checkedRememberMeAtom = atom<boolean>(false);

// Use the atom like a regular useState from React in your components like this.
const [checkedRememberMe, setCheckedRememberMe] = useAtom(checkedRememberMeAtom);

// change state from atom
setCheckedRememberMe(true);