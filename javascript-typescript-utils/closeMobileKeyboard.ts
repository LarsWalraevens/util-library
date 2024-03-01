
/**
 * 
 * Makes sure the mobile keyboard is closed when this function is called
 * @param e 
 * 
 */
export function closeMobileKeyboard(e: { target: { blur: () => void } }): void {
    return e.target.blur();
}
