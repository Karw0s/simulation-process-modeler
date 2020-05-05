export class Diagram {
  public id: number;
  public name: string;
  public diagramXML: string | ArrayBuffer;
  public image: any;

  constructor(id: number, name: string, diagramXML: string | ArrayBuffer) {
    this.id = id;
    this.name = name;
    this.diagramXML = diagramXML;
  }

}
