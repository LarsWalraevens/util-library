
import { DndProvider } from "react-dnd";
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useCallback } from 'react';
import update from 'immutability-helper';

// A component where you have a list and want to sort it by dragging them in the right order
export default function MyDnDComponent() {
    const [dragItems, setDragItems] = useState([])

    const moveCard = useCallback((dragIndex, hoverIndex) => {
        setDragItems((prevdragItems) =>
            update(prevdragItems, {
                $splice: [
                    [dragIndex, 1],
                    [hoverIndex, 0, prevdragItems[dragIndex]],
                ],
            }),
        )
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