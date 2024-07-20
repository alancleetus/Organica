import React, { useState, useEffect, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DragHandleIcon from "@mui/icons-material/DragHandle";
import Grid from "@mui/material/Grid";
import { v4 as uuidv4 } from "uuid";
import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";

import Checkbox from "@mui/material/Checkbox";
const CheckboxList = ({ itemsArray, updateItemsArray, editable = false }) => {
  const [items, setItems] = useState([]);

  const [focused, setFocused] = useState(null);
  const [prevSize, setPrevSize] = useState(0);
  // Initialize items from itemsArray prop
  useEffect(() => {
    setPrevSize(items.length);
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

  const removeItem = (id) => {
    const updatedItems = items.filter((item) => item.id != id);
    updateItemsArray(updatedItems);
  };

  // handle text change
  const handleTextChange = (id, newText) => {
    // if (!newText) {
    //   const updatedItems = items.filter((item) => item.id != id);

    //   setItems(updatedItems);
    //   updateItemsArray(updatedItems);
    //   console.log("removing empty item");
    // } else {
    //   const updatedItems = items.map((item) =>
    //     item.id === id ? { ...item, text: newText } : item
    //   );
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, text: newText } : item
    );
    setItems(updatedItems);
    updateItemsArray(updatedItems);
    // }
  };

  const addNewLI = (e, content) => {
    console.log("addNewItem()");

    if (content === "") return;
    const newItem = {
      id: uuidv4(),
      text: content,
      checked: false,
    };

    console.log(newItem);
    const updatedItems = [...items, newItem];
    updateItemsArray(updatedItems);
    e.target.value = "";
  };
  const addBlank = () => {
    console.log("addBlankItem()");

    const newItem = {
      id: uuidv4(),
      text: "",
      checked: false,
    };

    console.log(newItem);
    const updatedItems = [...items, newItem];
    updateItemsArray(updatedItems);
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

  const refToLast = useRef();
  useEffect(() => {
    if (prevSize < items.length && refToLast.current) {
      refToLast.current.focus();
    }
  }, [items.length]);

  return (
    <>
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
                      className="checkbox-list-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={getItemStyle(
                        snapshot.isDragging,
                        provided.draggableProps.style
                      )}
                    >
                      <Grid
                        container
                        direction="row"
                        justifyContent="flex-start"
                        alignItems="center"
                      >
                        <Grid item xs={1}>
                          <div
                            {...provided.dragHandleProps}
                            className="hover-icons"
                            style={{
                              cursor: "grab",
                              flexGrow: 0,
                              opacity:
                                (snapshot.isDragging || focused === item.id) &&
                                1,
                            }}
                          >
                            <DragIndicatorIcon
                              sx={{ color: "var(--light-gray)" }}
                            />
                          </div>
                        </Grid>

                        <Grid item xs={2} style={{ flexGrow: 0 }}>
                          <Checkbox
                            checked={item.checked}
                            onChange={() => handleCheckboxChange(item.id)}
                            className="check-style"
                            sx={{
                              color: "var(--light-gray)",
                              "&.Mui-checked": {
                                color: "var(--primary-color)",
                              },
                            }}
                          />
                        </Grid>
                        <Grid item xs={8}>
                          <p
                            ref={
                              item.id === items[items.length - 1].id
                                ? refToLast
                                : null
                            }
                            contentEditable={editable}
                            style={{
                              outline: "none",
                              marginBottom: "0",
                              textDecoration: item.checked && "line-through",
                              minHeight: "20px",
                            }}
                            onBlur={(e) => {
                              handleTextChange(item.id, e.target.textContent);
                              setFocused(null);
                            }}
                            onFocus={() => {
                              setFocused(item.id);
                            }}
                            autofocus={items[items.length - 1].id === item.id}
                          >
                            {item.text}
                          </p>
                        </Grid>
                        {editable && (
                          <Grid item xs={1}>
                            <div
                              className="hover-icons"
                              style={{
                                cursor: "cursor",
                                flexGrow: 0,
                                opacity:
                                  (snapshot.isDragging ||
                                    focused === item.id) &&
                                  1,
                              }}
                              onClick={() => {
                                removeItem(item.id);
                              }}
                            >
                              <ClearIcon sx={{ color: "var(--light-gray)" }} />
                            </div>
                          </Grid>
                        )}
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
      {editable && (
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          style={{
            color: "var(--primary-muted-color)",
            paddingLeft: "2px",
          }}
        >
          <Grid item xs={1}></Grid>
          <Grid item xs={2}>
            <Checkbox
              className="check-style"
              sx={{
                color: "var(--light-gray)",
                "&[aria-disabled='true']": {
                  color: "var(--light-gray)",
                },
              }}
              disabled
            />
          </Grid>
          <Grid item xs={9}>
            <input
              style={{
                flexGrow: 2,
                fontSize: "1.1em",
                background: "none",
                color: "var(--text-color)",
                border: "none",
              }}
              type="text"
              placeholder="add new item"
              onBlur={(e) => addNewLI(e, e.target.value)}
              onFocus={addBlank}
            ></input>
          </Grid>
        </Grid>
      )}
    </>
  );
};

export default CheckboxList;
