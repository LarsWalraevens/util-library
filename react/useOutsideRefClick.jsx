// HANDLE OUTSIDE OF REFERENCE CLICK CLICK 
// ref = reference
// onChange = fn what to do if outside clicked
export function useOutsideRefClick(ref, onChange) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                onChange();
            } else {
                return;
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, onChange]);
}