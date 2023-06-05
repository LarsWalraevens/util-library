// Closes mobile keyboard
// onPressEnter={(e) => closeMobileKeyboard(e)}

export function closeMobileKeyboard(e) {
    return e.target.blur();
}