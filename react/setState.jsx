// easily update a property in all objects from the state array (from specific id)
setState(prevState =>
    prevState.map(item => {
        if (item.id === id) {
            return {
                ...item,
                // overwrite "data" property with a loop of data and update "y" property
                data: item.data.map(dataItem => ({
                    ...dataItem,
                    y: null
                }))
            };
        }
        return item;
    })
);