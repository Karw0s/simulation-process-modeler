import { EntryFactory, IPropertiesProvider } from './bpmn-js';

export class CustomPropsProvider implements IPropertiesProvider {

  static $inject = ['translate', 'bpmnPropertiesProvider'];

// Note that names of arguments must match injected modules, see InjectionNames.
  constructor(private translate, private bpmnPropertiesProvider) {
  }

  getTabs(element) {
    console.log(this.constructor.name, 'Creating property tabs');
    if (element.type === 'bpmn:ScriptTask') {
      return this.bpmnPropertiesProvider.getTabs(element)
        .concat({
          id: 'custom',
          label: this.translate('Custom'),
          groups: [
            {
              id: 'customText',
              label: this.translate('customText'),
              entries: [
                EntryFactory.textBox({
                  id: 'custom',
                  label: this.translate('customText'),
                  modelProperty: element.businessObject
                }),
              ]
            }
          ]
        });
    } else {
      return this.bpmnPropertiesProvider.getTabs(element);
    }

    function getGroovyScript(businessObject) {
      const GroovyElement = getExtensionElement(businessObject, 'gs:GroovyNode');
      const script = GroovyElement ? GroovyElement.script : '';
      if (GroovyElement) {
        return GroovyElement.script;
      } else {
        return '';
      }
    }

    function getExtensionElement(el, type) {
      if (!el.extensionElements) {
        return;
      }

      if (el.extensionElements.values) {
        return el.extensionElements.values.filter((extensionElement) => {
          return extensionElement.$instanceOf(type);
        })[0];
      }
    }
  }
}
