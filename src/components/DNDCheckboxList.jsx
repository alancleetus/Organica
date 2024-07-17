import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import Grid from "@mui/material/Grid";
const CheckboxList = ({ itemsArray, updateItemsArray, editable = false }) => {
  const [items, setItems] = useState([]);

  // Initialize items from itemsArray prop
  useEffect(() => {
    setItems(itemsArray);
  }, [itemsArray]);

  // on drag change order of array items,
  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const updatedItems = Array.from(items);
    const [reorderedItem] = updatedItems.splice(result.source.index, 1);
    updatedItems.splice(result.destination.index, 0, reorderedItem);
    setItems(updatedItems);
    updateItemsArray(updatedItems);
  };

  //handle checkbox
  const handleCheckboxChange = (id) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    setItems(updatedItems);
    updateItemsArray(updatedItems);
  };

  // handle text change
  const handleTextChange = (id, newText) => {
    if (!newText) {
      const updatedItems = items.filter((item) => item.id != id);

      setItems(updatedItems);
      updateItemsArray(updatedItems);
      console.log("removing empty item");
    } else {
      const updatedItems = items.map((item) =>
        item.id === id ? { ...item, text: newText } : item
      );
      setItems(updatedItems);
      updateItemsArray(updatedItems);
    }
  };

  //style of item being dragged
  const getItemStyle = (isDragging, draggableStyle) => ({
    userSelect: "none",
    padding: 2,
    background: isDragging ? "rgba(0,0,0,0.5)" : "rgba(0,0,0,0)",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    ...draggableStyle,
  });

  //style of list when dragging
  const getListStyle = (isDraggingOver) => ({});

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="checkboxList">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            style={getListStyle(snapshot.isDraggingOver)}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    style={getItemStyle(
                      snapshot.isDragging,
                      provided.draggableProps.style
                    )}
                  >
                    <Grid
                      container
                      spacing={1}
                      style={{
                        paddingRight: "10px",
                        paddingLeft: "10px",
                      }}
                    >
                      <Grid
                        item
                        xs={1}
                        style={{ flexGrow: 0, paddingTop: "10px" }}
                      >
                        <input
                          type="checkbox"
                          checked={item.checked}
                          onChange={() => handleCheckboxChange(item.id)}
                          style={{ flexGrow: 0 }}
                        />
                      </Grid>
                      <Grid item xs={10}>
                        <p
                          contentEditable={editable}
                          style={{
                            flexGrow: 2,
                            paddingLeft: "10px",
                            marginBottom: "0",
                            textDecoration: item.checked && "line-through",
                          }}
                          onBlur={(e) =>
                            handleTextChange(item.id, e.target.textContent)
                          }
                        >
                          {item.text}
                        </p>
                      </Grid>
                      <Grid item xs={1}>
                        <div
                          {...provided.dragHandleProps}
                          style={{
                            cursor: "grab",
                            flexGrow: 0,
                          }}
                        >
                          <DragHandleIcon />
                        </div>
                      </Grid>
                    </Grid>
                  </div>
                )}
              </Draggable>
            ))}

            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default CheckboxList;
