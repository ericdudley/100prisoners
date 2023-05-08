import React from "react";

export interface SimulationResult {
  success: number;
  failure: number;
  total: number;
}

export interface Strategy {
  label: string;
  value: "random" | "optimal";
  description: React.ReactElement;
}

export class Box {
  id: number;
  number: number;
  isSeen: boolean;

  constructor(id: number, number: number) {
    this.id = id;
    this.number = number;
    this.isSeen = false;
  }
}

export class Prisoner {
  id: number;
  seenBoxes: Box[];
  status: "prison" | "looking" | "free" | "failed";

  constructor(id: number) {
    this.id = id;
    this.seenBoxes = [];
    this.status = "prison";
  }
}
