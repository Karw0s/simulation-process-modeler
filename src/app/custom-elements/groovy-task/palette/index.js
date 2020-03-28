import GroovyTaskPaletteProvider from "./GroovyTaskPaletteProvider";
import PaletteModule from "diagram-js/lib/features/palette";
import CreateModule from "diagram-js/lib/features/create";

export default {
  __depends__: [
    PaletteModule,
    CreateModule,
  ],
  __init__: ['groovyTaskPaletteProvider'],
  groovyTaskPaletteProvider: [ 'type', GroovyTaskPaletteProvider]
};
