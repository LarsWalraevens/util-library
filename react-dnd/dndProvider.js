
import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useCallback } from 'react';
import produce from 'immer';


// A component where you have a list and want to sort it by dragging them in the right order
export default function MyDnDComponent() {
    const [dragItems, setDragItems] = useState([])

    const moveCard = useCallback((dragIndex, hoverIndex) => {
        setDragItems(prevdragItems =>
            produce(prevdragItems, draft => {
                const [removed] = draft.splice(dragIndex, 1);
                draft.splice(hoverIndex, 0, removed);
            })
        );
    }, []);

    return <div>
        <DndProvider backend={HTML5Backend}>
            {dragItems.map((item, i) => {
                return (
                    <MyDraggableComponent
                        moveCard={moveCard}
                    />
                )
            })}
        </DndProvider>
    </div>
}