import React, { useState, useEffect } from "react";

const resources = [
  { name: "Lemn", color: "#8B4513" },
  { name: "Piatră", color: "#A9A9A9" },
  { name: "Fier", color: "#C0C0C0" },
  { name: "Frunză", color: "#228B22" },
  { name: "Pânză", color: "#F5F5DC" },
  { name: "Aur", color: "#FFD700" },
  { name: "Oțel", color: "#B0C4DE" },
];

const recipes = [
  { ingredients: ["Lemn", "Piatră"], result: { name: "Topor", color: "#654321", description: "Un topor robust." } },
  { ingredients: ["Fier", "Oțel"], result: { name: "Sabie", color: "#708090", description: "O sabie puternică." } },
  { ingredients: ["Frunză", "Pânză", "Aur"], result: { name: "Coroană", color: "#DAA520", description: "Coroană regală." } },
  { ingredients: ["Lemn", "Pânză"], result: { name: "Pătură", color: "#F4A460", description: "O pătură confortabilă." } },
];

function Item({ item, onDragStart, highlight }) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, item)}
      style={{
        backgroundColor: item.color,
        color: "#fff",
        padding: "10px",
        margin: "5px",
        width: "60px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "12px",
        boxShadow: highlight
          ? "0 0 10px 3px rgba(255,215,0,0.8)" 
          : "2px 2px 5px rgba(0,0,0,0.3)",
        cursor: "grab",
        fontWeight: "bold",
        textAlign: "center",
        transition: "all 0.3s",
      }}
    >
      {item.name}
    </div>
  );
}

function CraftingSlot({ slotItems, onDrop }) {
  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => onDrop(e)}
      style={{
        width: "220px",
        height: "220px",
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gridGap: "5px",
        border: "3px dashed #888",
        borderRadius: "15px",
        padding: "10px",
        backgroundColor: "#f0f8ff",
        margin: "0 auto",
        boxShadow: "0 0 10px rgba(0,0,0,0.2)",
      }}
    >
      {slotItems.map((item, index) => (
        <div
          key={index}
          style={{
            backgroundColor: item.color,
            borderRadius: "10px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontWeight: "bold",
            color: "#fff",
            boxShadow: "2px 2px 5px rgba(0,0,0,0.3)",
          }}
        >
          {item.name}
        </div>
      ))}
    </div>
  );
}

export default function CraftingGame() {
  const [inventory, setInventory] = useState(() => {
    const saved = localStorage.getItem("inventory");
    return saved ? JSON.parse(saved) : [];
  });
  const [slotItems, setSlotItems] = useState([]);
  const [crafted, setCrafted] = useState(() => {
    const saved = localStorage.getItem("crafted");
    return saved ? JSON.parse(saved) : [];
  });
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    localStorage.setItem("inventory", JSON.stringify(inventory));
    localStorage.setItem("crafted", JSON.stringify(crafted));
  }, [inventory, crafted]);

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData("item", JSON.stringify(item));
  };

  const addToInventory = (item) => {
    setInventory([...inventory, item]);
  };

  const handleDrop = (e) => {
    const item = JSON.parse(e.dataTransfer.getData("item"));
    if (!slotItems.includes(item)) {
      const newSlotItems = [...slotItems, item];
      setSlotItems(newSlotItems);
      setInventory(inventory.filter((i, idx) => i !== item));

      const possibleRecipe = recipes.find((recipe) =>
        recipe.ingredients.every((ing) => newSlotItems.map((i) => i.name).includes(ing))
      );
      if (possibleRecipe) {
        setPreview(possibleRecipe.result);
        setTimeout(() => {
          setCrafted([...crafted, possibleRecipe.result]);
          setSlotItems([]);
          setPreview(null);
        }, 500);
      } else {
        setPreview(null);
      }
    }
  };

  const returnToInventory = () => {
    setInventory([...inventory, ...slotItems]);
    setSlotItems([]);
    setPreview(null);
  };

  const clearInventory = () => setInventory([]);
  const resetGame = () => {
    setInventory([]);
    setSlotItems([]);
    setCrafted([]);
    localStorage.clear();
  };

  const discoverable = recipes.filter((recipe) =>
    recipe.ingredients.every((ing) => inventory.map((i) => i.name).includes(ing))
  );

  const allDiscovered = recipes.every(recipe =>
    crafted.some(c => c.name === recipe.result.name)
  );

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        justifyContent: "space-between",
        position: "relative",
        background: "linear-gradient(to bottom, #e0f7fa, #ffffff)",
      }}
    >
      {/* Overlay de victorie */}
      {allDiscovered && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            flexDirection: "column",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "30px 50px",
              borderRadius: "20px",
              boxShadow: "0 0 20px rgba(0,0,0,0.5)",
              textAlign: "center",
            }}
          >
            <h1 style={{ color: "#4CAF50", marginBottom: "20px" }}>🎉 Ai câștigat! 🎉</h1>
            <p style={{ marginBottom: "20px", fontSize: "18px" }}>
              Ai descoperit toate obiectele disponibile!
            </p>
            <button
              onClick={resetGame}
              style={{
                padding: "10px 20px",
                borderRadius: "10px",
                border: "none",
                background: "#6a5acd",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Reset Game
            </button>
          </div>
        </div>
      )}

      {/* Obiectele create în colțul stânga sus */}
      <div style={{ position: "absolute", top: "20px", left: "20px" }}>
        <h3 style={{ textShadow: "1px 1px 3px #aaa" }}>Obiecte create</h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {crafted.map((item, index) => (
            <div
              key={index}
              style={{
                backgroundColor: item.color,
                width: "60px",
                height: "60px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "12px",
                boxShadow: "0 0 10px rgba(0,0,0,0.3)",
                color: "#fff",
                fontWeight: "bold",
                transition: "all 0.3s",
              }}
            >
              {item.name}
            </div>
          ))}
        </div>
      </div>

      <h2 style={{ textAlign: "center", textShadow: "1px 1px 2px #aaa" }}>Crafting</h2>
      <div>
        <CraftingSlot slotItems={slotItems} onDrop={handleDrop} />
        {preview ? (
          <div
            style={{
              textAlign: "center",
              margin: "10px",
              fontSize: "18px",
              color: "#ff8c00",
              fontWeight: "bold",
              textShadow: "1px 1px 2px #555",
            }}
          >
            🔮 {preview.name} - {preview.description}
          </div>
        ) : slotItems.length > 0 ? (
          <div style={{ textAlign: "center", margin: "10px" }}>
            <button
              onClick={returnToInventory}
              style={{
                padding: "8px 12px",
                borderRadius: "8px",
                border: "none",
                background: "#ff6961",
                color: "#fff",
                fontWeight: "bold",
                cursor: "pointer",
                boxShadow: "1px 1px 5px rgba(0,0,0,0.3)",
                transition: "0.3s",
              }}
            >
              Return to Inventory
            </button>
          </div>
        ) : null}
      </div>

      {/* Zona de jos */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}
      >
        {/* Resources */}
        <div>
          <h3 style={{ textShadow: "1px 1px 2px #aaa" }}>Resources</h3>
          {resources.map((item) => (
            <div
              key={item.name}
              onClick={() => addToInventory(item)}
              style={{ cursor: "pointer" }}
            >
              <Item item={item} onDragStart={handleDragStart} />
            </div>
          ))}
        </div>

        {/* Inventar */}
        <div>
          <h3 style={{ textAlign: "center", textShadow: "1px 1px 2px #aaa" }}>Inventar</h3>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "5px" }}>
            {inventory.map((item, index) => (
              <Item key={index} item={item} onDragStart={handleDragStart} />
            ))}
          </div>

          {/* Panou descoperire */}
          <div style={{ marginTop: "10px" }}>
            <h4 style={{ textAlign: "center", textShadow: "1px 1px 2px #aaa" }}>Descoperire:</h4>
            {discoverable.length === 0 ? (
              <p style={{ textAlign: "center", color: "#666" }}>Nicio rețetă disponibilă</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {discoverable.map((r, idx) => (
                  <li
                    key={idx}
                    style={{
                      background: crafted.some(c => c.name === r.result.name)
                        ? "linear-gradient(90deg, #fff59d, #ffeb3b)"
                        : "#f0f0f0",
                      margin: "5px 0",
                      padding: "5px 10px",
                      borderRadius: "8px",
                      boxShadow: "1px 1px 5px rgba(0,0,0,0.2)",
                      fontWeight: crafted.some(c => c.name === r.result.name) ? "bold" : "normal",
                      transition: "0.3s",
                    }}
                  >
                    {r.result.name} → {r.ingredients.join(" + ")}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Garbage + butoane */}
        <div>
          <h3 style={{ textAlign: "center", textShadow: "1px 1px 2px #aaa" }}>Garbage</h3>
          <div
            style={{
              width: "100px",
              height: "100px",
              border: "2px dashed red",
              borderRadius: "12px",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#ff6961",
              fontWeight: "bold",
            }}
          >
            🗑️
          </div>
          <button
            onClick={clearInventory}
            style={{
              display: "block",
              marginBottom: "5px",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              background: "#ff6961",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "1px 1px 5px rgba(0,0,0,0.3)",
              transition: "0.3s",
            }}
          >
            Clear Inventory
          </button>
          <button
            onClick={resetGame}
            style={{
              padding: "8px 12px",
              borderRadius: "8px",
              border: "none",
              background: "#6a5acd",
              color: "#fff",
              fontWeight: "bold",
              cursor: "pointer",
              boxShadow: "1px 1px 5px rgba(0,0,0,0.3)",
              transition: "0.3s",
            }}
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
}
