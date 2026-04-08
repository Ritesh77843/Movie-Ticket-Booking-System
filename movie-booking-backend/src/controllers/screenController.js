import Screen from "../models/Screen.js";

// ✅ Get all screens
export const getAllScreens = async (req, res) => {
  try {
    const screens = await Screen.find().sort({ createdAt: -1 });
    res.json(screens);
  } catch (err) {
    console.error("getAllScreens error:", err);
    res.status(500).json({ message: "Failed to fetch screens" });
  }
};

// ✅ Create screen
export const createScreen = async (req, res) => {
  try {
    const { name, rows, seatsPerRow } = req.body;
    
    if (!name || !rows || !seatsPerRow) {
      return res.status(400).json({ message: "name, rows, and seatsPerRow are required" });
    }

    const screen = await Screen.create({
      name,
      rows,
      seatsPerRow,
    });

    res.status(201).json(screen);
  } catch (err) {
    console.error("createScreen error:", err);
    res.status(500).json({ message: "Failed to create screen" });
  }
};

// ✅ Delete screen
export const deleteScreen = async (req, res) => {
  try {
    const screen = await Screen.findByIdAndDelete(req.params.id);
    if (!screen) return res.status(404).json({ message: "Screen not found" });
    res.json({ message: "Screen deleted successfully" });
  } catch (err) {
    console.error("deleteScreen error:", err);
    res.status(500).json({ message: "Failed to delete screen" });
  }
};
