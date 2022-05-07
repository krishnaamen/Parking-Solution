import Router from "express";
const router = Router();

import ParkingArea from "../Model/parkingArea.js";

//Get all parking Areas
router.get("/api/parkingarea", async (req, res) => {
  try {
    const parkings = await ParkingArea.find();
    if (!parkings) {
      throw new Error("No parkings");
    }
    res
      .status(200)
      .json({ total_parkingAreas: parkings.length, ParkingAreas: parkings });
  } catch (error) {
    res.status(400).json({ message: "something wrong" });
  }
});

// Find a Parking Area by location
router.get("/api/parkingarea/:key", async (req, res) => {
  const { key } = req.params;
  const regex = new RegExp(key, "i");
  try {
    const parkings = await ParkingArea.find({ location: { $regex: regex } });
    if (!parkings) {
      throw new Error("No parkings");
    }
    res
      .status(200)
      .json({ total_parkingAreas: parkings.length, ParkingAreas: parkings });
  } catch (error) {
    res.status(400).json({ message: "something wrong" });
  }
});

//
router.patch(
  "/api/parkingarea/reservation/:slotNumber/:name/:hour",
  async (req, res) => {
    try {
      const slotNumber = Number(req.params.slotNumber);
      const name = req.params.name;
      const hour = Number(req.params.hour);

      Date.prototype.addHours = function (h, gmt) {
        this.setHours(this.getHours() + gmt + h);
        return this;
      };

      const startDate = new Date().addHours(0, 2);
      console.log(startDate.toString());

      const endDate = new Date().addHours(hour, 2);

      console.log(endDate.toString());

      const parking = await ParkingArea.findOne({ name });

      const slot = parking.slot;

      for (let i = 0; i < slot.length; i++) {
        if (slot[i].number === slotNumber) {
          slot[i].startTime = startDate;
          slot[i].endTime = endDate;

          slot[slotNumber - 1] = slot[i];
          break;
        }
      }

      Object.assign(parking, slot);
      parking.save();

      return res.status(200).json(parking);
    } catch (error) {
      console.log(error);
      return res.status(404).json({ message: "Not found " });
    }
  }
);

// Admin // Create a Parking Area
router.post("/api/parkingarea", async (req, res) => {
  try {
    const { name, location, slot } = req.body;

    // Create parking in our database
    const parking = await ParkingArea.create({
      name: name,
      location: location,
      slot: slot,
    });

    return res.status(201).json(parking);
  } catch (err) {
    console.log(err);
  }
});

// Admin // Create slots for a specific Parking Area
router.patch("/api/parkingarea/:name/:slots", async (req, res) => {
  try {
    const name = req.params.name;
    const slots = Number(req.params.slots);
    const slotsArray = [];

    for (let i = 1; i <= slots; i++) {
      const newSlot = { number: i, startTime: null, endTime: null };
      slotsArray.push(newSlot);
    }

    const slotsObject = { slot: slotsArray };
    const parking = await ParkingArea.findOne({ name });

    Object.assign(parking, slotsObject);
    parking.save();

    return res.status(200).json(parking);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ message: "Not found " });
  }
});

export default router;



