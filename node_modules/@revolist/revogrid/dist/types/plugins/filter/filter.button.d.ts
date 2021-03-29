import { RevoGrid } from '../../interfaces';
export declare const FILTER_BUTTON_CLASS = "rv-filter";
export declare const FILTER_BUTTON_ACTIVE = "active";
export declare const FILTER_PROP = "hasFilter";
declare type Props = {
  column: RevoGrid.ColumnRegular;
};
export declare const FilterButton: ({ column }: Props) => any;
export declare function isFilterBtn(e: HTMLElement): true | Element;
export {};
