export interface TableColumn{
    label:string;
    prop:string;
    width?:number | string;
}

export interface PageQuery {
    page: number;
    size: number;
    keyword?: string;
    status?: string;
}

export interface PageResult<T> {
    list: T[];
    total: number;
    page: number;
    size: number;
}
