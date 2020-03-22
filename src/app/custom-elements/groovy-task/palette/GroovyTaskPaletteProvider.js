

/**
 * A provider for quick service task production
 */
export default function GroovyTaskPaletteProvider(palette, create, elementFactory) {

  this._create = create;
  this._elementFactory = elementFactory;

  palette.registerProvider(this);
}

GroovyTaskPaletteProvider.$inject = [
  'palette',
  'create',
  'elementFactory'
];

GroovyTaskPaletteProvider.prototype.getPaletteEntries = function() {

  var elementFactory = this._elementFactory,
    create = this._create;

  function startCreate(event) {
    var serviceTaskShape = elementFactory.create(
      'shape', { type: 'bpmn:ScriptTask' }
    );
    serviceTaskShape.businessObject.script = "console.log();";
    create.start(event, serviceTaskShape);
  }

  return {
    'create-service-task': {
      group: 'activity',
      title: 'Create a new GroovyTask',
      className: 'bpmn-icon-script-task',
      action: {
        dragstart: startCreate,
        click: startCreate
      }
    }
  };
};
