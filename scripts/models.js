export class Line {
  constructor(name, altName, color, operator) {
    this.name = name;
    this.altName = altName;
    this.color = color;
    this.operator = operator;
  }
}

export class Station {
  constructor(id, thName, enName, line) {
    this.id = id;
    this.thName = thName;
    this.enName = enName;
    this.line = line;
    this.connections = [];
  }

  cnt() {
    let justName = [];
    for (let i of this.connections) {
      justName.push(i.station.enName);
    }
    return justName;
  }

  connects(target, time, isTransfer = false, isCrossOp = false) {
    this.connections.push({
      station: target,
      time: time,
      costWeight: isCrossOp ? 100 : isTransfer ? 0 : 1,
      isTransfer: isTransfer,
      isCrossOp: isCrossOp,
    });
  }
}
