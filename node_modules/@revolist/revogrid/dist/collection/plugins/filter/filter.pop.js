import { Component, h, Host, Listen, Prop, State, Event, Method } from '@stencil/core';
import { isFilterBtn } from './filter.button';
import { RevoButton } from '../../components/button/button';
import '../../utils/closestPolifill';
const defaultType = 'none';
export class FilterPanel {
  constructor() {
    this.filterTypes = {};
    this.filterNames = {};
    this.filterEntities = {};
  }
  onMouseDown(e) {
    if (this.changes && !e.defaultPrevented) {
      const el = e.target;
      if (this.isOutside(el) && !isFilterBtn(el)) {
        this.changes = undefined;
      }
    }
  }
  async show(newEntity) {
    this.changes = newEntity;
    if (this.changes) {
      this.changes.type = this.changes.type || defaultType;
    }
  }
  async getChanges() {
    return this.changes;
  }
  renderConditions(type) {
    const options = [];
    for (let gIndex in this.filterTypes) {
      options.push(h("option", { value: defaultType }, this.filterNames[defaultType]));
      options.push(...this.filterTypes[gIndex].map(k => (h("option", { value: k, selected: type === k }, this.filterNames[k]))));
      options.push(h("option", { disabled: true }));
    }
    return options;
  }
  renderExtra(extra, value) {
    this.extraElement = undefined;
    switch (extra) {
      case 'input':
        return (h("input", { type: "text", value: value, onInput: e => (this.changes.value = e.target.value), onKeyDown: e => this.onKeyDown(e), ref: e => (this.extraElement = e) }));
      default:
        return '';
    }
  }
  render() {
    if (!this.changes || !this.changes) {
      return h(Host, { style: { display: 'none' } });
    }
    const style = {
      display: 'block',
      left: `${this.changes.x}px`,
      top: `${this.changes.y}px`,
    };
    return (h(Host, { style: style },
      h("label", null, "Filter by condition"),
      h("select", { class: "select-css", onChange: e => this.onFilterChange(e) }, this.renderConditions(this.changes.type)),
      h("div", null, this.renderExtra(this.filterEntities[this.changes.type].extra, this.changes.value)),
      h(RevoButton, { class: { green: true }, onClick: () => this.onSave() }, "Save"),
      h(RevoButton, { class: { light: true }, onClick: () => this.onCancel() }, "Cancel")));
  }
  onFilterChange(e) {
    if (!this.changes) {
      throw new Error('Changes required per edit');
    }
    const el = e.target;
    const type = el.value;
    this.changes = Object.assign(Object.assign({}, this.changes), { type });
  }
  onKeyDown(e) {
    if (e.key.toLowerCase() === 'enter') {
      this.onSave();
    }
  }
  onCancel() {
    this.changes = undefined;
  }
  onSave() {
    var _a, _b;
    if (!this.changes) {
      throw new Error('Changes required per edit');
    }
    this.filterChange.emit({
      prop: this.changes.prop,
      type: this.changes.type,
      value: (_b = (_a = this.extraElement) === null || _a === void 0 ? void 0 : _a.value) === null || _b === void 0 ? void 0 : _b.trim(),
    });
    this.changes = undefined;
  }
  isOutside(e) {
    if (e.classList.contains(`[uuid="${this.uuid}"]`)) {
      return false;
    }
    return !(e === null || e === void 0 ? void 0 : e.closest(`[uuid="${this.uuid}"]`));
  }
  static get is() { return "revogr-filter-panel"; }
  static get originalStyleUrls() { return {
    "$": ["filter.style.scss"]
  }; }
  static get styleUrls() { return {
    "$": ["filter.style.css"]
  }; }
  static get properties() { return {
    "uuid": {
      "type": "string",
      "mutable": true,
      "complexType": {
        "original": "string",
        "resolved": "string",
        "references": {}
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "attribute": "uuid",
      "reflect": true
    },
    "filterTypes": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "Record<string, string[]>",
        "resolved": "{ [x: string]: string[]; }",
        "references": {
          "Record": {
            "location": "global"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "defaultValue": "{}"
    },
    "filterNames": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "Record<string, string>",
        "resolved": "{ [x: string]: string; }",
        "references": {
          "Record": {
            "location": "global"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "defaultValue": "{}"
    },
    "filterEntities": {
      "type": "unknown",
      "mutable": false,
      "complexType": {
        "original": "Record<string, LogicFunction>",
        "resolved": "{ [x: string]: LogicFunction; }",
        "references": {
          "Record": {
            "location": "global"
          },
          "LogicFunction": {
            "location": "import",
            "path": "./filter.types"
          }
        }
      },
      "required": false,
      "optional": false,
      "docs": {
        "tags": [],
        "text": ""
      },
      "defaultValue": "{}"
    }
  }; }
  static get states() { return {
    "changes": {}
  }; }
  static get events() { return [{
      "method": "filterChange",
      "name": "filterChange",
      "bubbles": true,
      "cancelable": true,
      "composed": true,
      "docs": {
        "tags": [],
        "text": ""
      },
      "complexType": {
        "original": "FilterItem",
        "resolved": "{ prop?: ColumnProp; type?: \"none\" | \"empty\" | \"notEmpty\" | \"eq\" | \"notEq\" | \"begins\" | \"contains\" | \"notContains\" | \"eqN\" | \"neqN\" | \"gt\" | \"gte\" | \"lt\" | \"lte\"; value?: any; }",
        "references": {
          "FilterItem": {
            "location": "local"
          }
        }
      }
    }]; }
  static get methods() { return {
    "show": {
      "complexType": {
        "signature": "(newEntity?: ShowData) => Promise<void>",
        "parameters": [{
            "tags": [],
            "text": ""
          }],
        "references": {
          "Promise": {
            "location": "global"
          },
          "ShowData": {
            "location": "local"
          }
        },
        "return": "Promise<void>"
      },
      "docs": {
        "text": "",
        "tags": []
      }
    },
    "getChanges": {
      "complexType": {
        "signature": "() => Promise<ShowData>",
        "parameters": [],
        "references": {
          "Promise": {
            "location": "global"
          },
          "ShowData": {
            "location": "local"
          }
        },
        "return": "Promise<ShowData>"
      },
      "docs": {
        "text": "",
        "tags": []
      }
    }
  }; }
  static get listeners() { return [{
      "name": "mousedown",
      "method": "onMouseDown",
      "target": "document",
      "capture": false,
      "passive": true
    }]; }
}
