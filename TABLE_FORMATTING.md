# Table formatting

Column/row size, hidden rows/columns, grouping.
Frozen rows/columns.
Alternating rows / colors (conditional formatting) -- custom render functions is the best for this.


type ColumnWidthFunctionSpecifier = (j: number) => number;




type TableFormat {
    frozenRows: number?;
    frozenColumns: number?;
    columnWidths: ColumnWidthSpecifier;
}

TableViewModel {
    TableFormatting: 
    TableData: any
}