export interface tableItemType {
    lable?: string,
    prop?: string,
    width?: string,
    minWidth?: string,
    fixed?: true | 'left' | 'right',
    showOverflowTooltip?: boolean,
    type?: "selection" | "index" | "expand",
    formatter?(row?: any, column?: any, cellValue?: any, index?: number): string,
    slot?: string,
    [propName: string]: any
}