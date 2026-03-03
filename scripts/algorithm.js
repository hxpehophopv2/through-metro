export function findPath(graph, startId, endId, optimizeFor = "time") {
  const distances = {};
  const previous = {};
  const unvisited = new Set();

  // 1. INIT: Set all distances to Infinity, set the start node
  for (let id in graph) {
    distances[id] = Infinity;
    previous[id] = null;
    unvisited.add(id);
  }
  distances[startId] = 0;

  // 2. Main Loop: Keep going if are unvisited stations
  while (unvisited.size > 0) {
    // Find the unvisited station with the smallest known distance/cost
    let currNodeId = null;
    for (let id of unvisited) {
      if (currNodeId === null || distances[id] < distances[currNodeId]) {
        currNodeId = id;
      }
    }

    // If it reached the destination or all remaining nodes are unreachable, stop looking
    if (currNodeId === endId || distances[currNodeId] === Infinity) {
      break;
    }

    // MARKS: Removing visited stations it from the set
    unvisited.delete(currNodeId);
    let currStation = graph[currNodeId];

    // 3. Check the neighbors of the current station
    for (let conn of currStation.connections) {
      let neighborId = conn.station.id;

      // If visited already, SKIP
      if (!unvisited.has(neighborId)) continue;

      // WEIGHT CHOICE: time or cost hops?
      let weight = optimizeFor === "time" ? conn.time : conn.costWeight;

      // Calculate the total distance/cost to this neighbor through the current station
      let newDistance = distances[currNodeId] + weight;

      // If we found a shorter/cheaper path to this neighbor, update our records
      if (newDistance < distances[neighborId]) {
        distances[neighborId] = newDistance;
        previous[neighborId] = currNodeId; // SAVEPOINT
      }
    }
  }

  // 4. CONFIRM: Reconstruct the path by working backward from the destination -> origin
  const path = [];
  let current = endId;
  while (current !== null) {
    path.unshift(current); // Add to the beginning of the array
    current = previous[current];
  }

  // ERROR: If the path only contains the start (and start !== end), no path
  if (path.length === 1 && startId !== endId) {
    return { error: "No path found between these stations." };
  }

  return {
    path: path, // Returns an array of Station IDs
    totalMetric: distances[endId], // Total time / cost hops
    optimizedFor: optimizeFor,
  };
}

// A simplified fare table using your array index logic!
// Index 0 = 0 hops (same station), Index 1 = 1 hop, Index 2 = 2 hops, etc.
const fareTables = {
  BTS: [17, 17, 21, 25, 28, 31, 34, 37, 40, 43, 47], // Core line caps at 47
  BEM: [17, 17, 20, 22, 25, 27, 30, 32, 35, 37, 40, 42, 45], // MRT Blue Line
};

export function calculateTotalFare(pathIds, transitGraph) {
  // If the path is empty or broken, cost is 0
  if (!pathIds || pathIds.length === 0) return 0;

  let netCost = 0; // The tracker you suggested!

  // Start the first segment with the first station in the path
  let currentSegment = [pathIds[0]];
  let currentOperator = transitGraph[pathIds[0]].line.operator;

  // Loop through the rest of the path starting at the second station (index 1)
  for (let i = 1; i < pathIds.length; i++) {
    let stationId = pathIds[i];
    let operator = transitGraph[stationId].line.operator;

    // RULE 1: If the operator is the same, keep adding to the current segment
    if (operator === currentOperator) {
      currentSegment.push(stationId);
    }
    // RULE 2: If the operator changes, break the segment and calculate!
    else {
      let hops = currentSegment.length - 1; // Your length logic!

      // Look up the price in the table and add it to netCost
      netCost +=
        fareTables[currentOperator][hops] ||
        fareTables[currentOperator][fareTables[currentOperator].length - 1];
      // (The || part just ensures if the hops exceed the array length, it charges the max fare)

      // Start a brand new segment for the new operator
      currentSegment = [stationId];
      currentOperator = operator;
    }
  }

  // RULE 3: Don't forget to calculate the final segment after the loop finishes!
  let finalHops = currentSegment.length - 1;
  netCost +=
    fareTables[currentOperator][finalHops] ||
    fareTables[currentOperator][fareTables[currentOperator].length - 1];

  return netCost;
}
