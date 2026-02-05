import type { ReactNode } from 'react';

interface Column<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (item: T) => ReactNode;
    className?: string;
}


interface DataTableProps<T> {
    data: T[];
    columns: Column<T>[];
    emptyMessage?: string;
    onRowClick?: (item: T) => void;
    density?: 'comfortable' | 'compact';
}

export function DataTable<T extends { id?: string | number }>({
    data,
    columns,
    emptyMessage = 'No hay datos disponibles',
    onRowClick,
    density = 'comfortable'
}: DataTableProps<T>) {
    const paddingClass = density === 'compact' ? 'px-3 py-2' : 'px-6 py-4';
    const textSizeClass = density === 'compact' ? 'text-xs' : 'text-sm';
    const headerSizeClass = density === 'compact' ? 'text-[10px]' : 'text-xs';

    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className={`w-full text-left ${textSizeClass} min-w-[1100px]`}>
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                            {columns.map((col, index) => (
                                <th
                                    key={index}
                                    className={`${paddingClass} font-semibold text-slate-700 uppercase tracking-wider ${headerSizeClass} whitespace-nowrap ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.length > 0 ? (
                            data.map((item, rowIndex) => (
                                <tr
                                    key={item.id ?? rowIndex}
                                    onClick={() => onRowClick && onRowClick(item)}
                                    className={`hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                                >
                                    {columns.map((col, colIndex) => (
                                        <td
                                            key={colIndex}
                                            className={`${paddingClass} text-slate-600 whitespace-nowrap ${col.className || ''}`}
                                        >
                                            {col.cell ? col.cell(item) : (item[col.accessorKey as keyof T] as ReactNode)}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length}
                                    className="px-6 py-12 text-center text-slate-400 italic"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
