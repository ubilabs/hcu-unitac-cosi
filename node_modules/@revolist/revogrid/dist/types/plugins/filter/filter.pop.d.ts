import { EventEmitter, VNode } from '../../stencil-public-runtime';
import { FilterType } from './filter.service';
import { RevoGrid } from '../../interfaces';
import '../../utils/closestPolifill';
import { LogicFunction } from './filter.types';
/**
 * @typedef FilterItem
 * @type {object}
 * @property {ColumnProp} prop - column id
 * @property {FilterType} type - filter type definition
 * @property {any} value - value for additional filtering, text value or some id
 */
export declare type FilterItem = {
  prop?: RevoGrid.ColumnProp;
  type?: FilterType;
  value?: any;
};
export declare type ShowData = {
  x: number;
  y: number;
} & FilterItem;
export declare class FilterPanel {
  private extraElement;
  changes: ShowData | undefined;
  uuid: string;
  filterTypes: Record<string, string[]>;
  filterNames: Record<string, string>;
  filterEntities: Record<string, LogicFunction>;
  filterChange: EventEmitter<FilterItem>;
  onMouseDown(e: MouseEvent): void;
  show(newEntity?: ShowData): Promise<void>;
  getChanges(): Promise<ShowData>;
  renderConditions(type: FilterType): VNode[];
  renderExtra(extra?: string, value?: any): any;
  render(): any;
  private onFilterChange;
  private onKeyDown;
  private onCancel;
  private onSave;
  private isOutside;
}
