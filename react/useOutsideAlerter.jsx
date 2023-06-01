
// HOOK THAT HANDLEs OUTSIDE CLICK  
// example; useOutsideAlerter(wrapperRef, () => setShowOptions(false));
export function useOutsideAlerter(ref, onChange) {
    useEffect(() => {
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                onChange();
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref, onChange]);
}