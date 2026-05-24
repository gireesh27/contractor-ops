import { EmptyState } from "@/components/EmptyState";

export interface DataTableColumn<T> {
  header: string;
  cell: (row: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  emptyTitle?: string;
  getKey: (row: T) => string;
}

export function DataTable<T>({ columns, data, emptyTitle = "No records found", getKey }: DataTableProps<T>) {
  if (!data.length) return <EmptyState title={emptyTitle} />;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-field">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className={`whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-600 ${column.className || ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row) => (
              <tr key={getKey(row)} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.header} className={`px-4 py-3 align-top text-slate-700 ${column.className || ""}`}>
                    {column.cell(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
