import fs from "fs";
import { Line, Station } from "./models.js";

// JSON -> JavaScript array
const rawData = fs.readFileSync(
  new URL("../data/stations.json", import.meta.url),
);
const stationsData = JSON.parse(rawData);

export const transitGraph = {};

// Create the Lines
const lines = {
  btsSukhumvit: new Line("Sukhumvit", "Light Green", "#009E60", "BTS"),
  mrtBlue: new Line("Blue", "Blue", "#0000FF", "BEM"),
};

// --- PASS 1: Build the dots (Stations) ---
for (let data of stationsData) {
  let stationLine = lines[data.line];
  transitGraph[data.id] = new Station(
    data.id,
    data.thName,
    data.enName,
    stationLine,
  );
}

// --- PASS 2: Draw the lines (Connections) ---
for (let data of stationsData) {
  let currentStation = transitGraph[data.id];

  for (let conn of data.connections) {
    let targetStation = transitGraph[conn.target];

    currentStation.connects(
      targetStation,
      conn.time,
      conn.isTransfer || false,
      conn.isCrossOp || false,
    );
  }
}
