// standard modal/overlay layout component created with tailwind

export default function ModalLayout(props) {
    return <>
        <div aria-hidden="true" className="fixed top-0 left-0 bg-black-400 bg-opacity-70 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto md:inset-0 h-modal md:h-full">
            <div className="relative bg-white-100 mx-auto w-full h-full max-w-2xl md:h-auto">
                <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
                    <button
                        onClick={() => props.closeWindow()}
                        type="button"
                        className="text-gray-400 hover:opacity-60 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    >
                        Close
                    </button>
                    <main>
                        {props.children}
                    </main>
                </div>
            </div>
        </div>
    </>
}
