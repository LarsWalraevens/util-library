//  Create the next immutable state tree by simply modifying the current tree
produce(state, draft => {
    // state = currently state - immutable
    // draft = current state - mutable
    draft[key] = value;
})