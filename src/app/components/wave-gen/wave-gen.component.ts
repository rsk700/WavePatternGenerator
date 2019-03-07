import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';

function randSign() {
  return Math.random() < 0.5 ? -1 : 1;
}

class Point {
  constructor(public x: number, public y: number) {}
}

class Line {
  constructor(
      public pos: number,
      public points: Point[]
  ) {}
}

class Segment {
  constructor(
      public a: Point,
      public b: Point
  ) {}
}

class Params {

  public amplitude: number;
  public period: number;
  public shift: number;

  constructor(
      public resolution: number = 300,
      public lineCount: number = 30,
      public lineStep: number = 20,
      public lineLength: number = 500,
      public linePositionRand: number = 1.5,

      // wave params
      public amplitudeDefault: number = 6,
      public amplitudeRand: number = 2,
      public periodDefault: number = 200,
      public periodRand: number = 5,
      public shiftDefault: number = 0,
      public shiftRand: number = 30,

      // sub waves
      public waves: WaveParams[] = [],
  ) {};

  randValues() {
    this.amplitude = this.amplitudeDefault + randSign() * Math.random() * this.amplitudeRand;
    this.period = this.periodDefault + randSign() * Math.random() * this.periodRand;
    this.shift = this.shiftDefault + Math.random() * this.shiftRand;
  }

}

class WaveParams {

  public amplitude: number;
  public period: number;
  public shift: number;

  constructor(
      public amplitudeDefault: number = 1,
      public amplitudeRand: number = 0.5,
      public periodDefault: number = 150,
      public periodRand: number = 100,
      public shiftDefault: number = 20,
      public shiftRand: number = 5,
  ) {}

  randValues() {
    this.amplitude = this.amplitudeDefault + randSign() * Math.random() * this.amplitudeRand;
    this.period = this.periodDefault + randSign() * Math.random() * this.periodRand;
    this.shift = this.shiftDefault + Math.random() * this.shiftRand;
  }

}

@Component({
  selector: 'app-wave-gen',
  templateUrl: './wave-gen.component.html',
  styleUrls: ['./wave-gen.component.css']
})
export class WaveGenComponent implements OnInit {

  lines: Line[] = [];

  // todo: if svg have polygon to draw all line
  
  params: Params = new Params();

  constructor() { }

  ngOnInit() {
    let url = new URL(window.location.href);
    if (url.searchParams.get('d') !== null) {
      let params = JSON.parse(url.searchParams.get('d'));
      Object.assign(this.params, params);
      this.params.waves = [];
      params.waves.forEach(w => {
        let newWave = new WaveParams();
        Object.assign(newWave, w);
        this.params.waves.push(newWave);
      });
    }
    else {
      this.params.waves.push(new WaveParams());
      this.params.waves.push(new WaveParams());
      this.params.waves.push(new WaveParams());
      this.params.waves.push(new WaveParams());
      this.params.waves.push(new WaveParams());
    }
    this.update();
  }

  generatePattern() {
    this.lines = [];
    for (let i: number = 0; i < this.params.lineCount; i++) {
      this.lines.push(this.generateLine(i * this.params.lineStep));
    }
  }

  generateLine(pos: number) {
    let points: Point[] = [];
    let step: number = this.params.lineLength/this.params.resolution;
    let pointPos = pos + randSign() * Math.random() * this.params.linePositionRand;
    this.params.randValues();
    this.params.waves.forEach(w => w.randValues());
    for (let i: number = 0; i <= this.params.resolution; i++) {
      let x = i * step;
      let y = this.sinY(x, this.params.amplitude, this.params.period, pointPos, this.params.shift);
      this.params.waves.forEach(w => {
        y += this.sinY(x, w.amplitude, w.period, 0, w.shift);
      });
      points.push(new Point(x, y));
    }
    return new Line(pos, points);
  }

  sinY(x: number, amplitude: number, period: number, position: number, shift: number) {
    let rad = (x+shift)/period * Math.PI*2;
    return Math.sin(rad) * amplitude + position;
  }

  draw() {
    d3.select('svg').select('g').remove();
    d3.select('svg').append('g');
    this.lines.forEach(this.drawLine.bind(this));
  }

  drawLine(line: Line) {
    let segments: Segment[] = [];
    if (line.points.length < 2) {
      return;
    }
    for (let i: number = 1; i < line.points.length; i++) {
      segments.push(new Segment(line.points[i-1], line.points[i]));
    }
    d3.select('svg g').append('g').attr('data-line-pos', line.pos)
      .selectAll('line')
      .data(segments)
      .enter()
        .append('line')
        .attr('x1', d => d.a.x)
        .attr('y1', d => d.a.y)
        .attr('x2', d => d.b.x)
        .attr('y2', d => d.b.y)
        .attr('stroke', 'black')
        ;
  }

  getUrl() {
    let params = JSON.stringify(this.params);
    let url = new URL(window.location.href);
    return `${url.origin}${url.pathname}?d=${params}`;
  }

  update() {
    this.generatePattern();
    this.draw();
  }

  deleteWave(index: number) {
    this.params.waves.splice(index, 1);
    this.update();
  }

  addWave() {
    this.params.waves.push(new WaveParams());
    this.update();
  }

}
