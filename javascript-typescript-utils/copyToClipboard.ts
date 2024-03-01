
/**
 * 
 * Copies given text to clipboard
 * @param text Text to be copied
 * 
 */
export function textToClipboard(text: string): void {
    const dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}
