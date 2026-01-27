import React from 'react';
import { Edit, Trash2, Eye, MoreVertical } from 'lucide-react';

interface Column {
    key: string;
    label: string;
    render?: (value: any, row: any) => React.ReactNode;
    width?: string;
}

interface DataTableProps {
    columns: Column[];
    data: any[];
    onEdit?: (row: any) => void;
    onDelete?: (row: any) => void;
    onView?: (row: any) => void;
    loading?: boolean;
    emptyMessage?: string;
}

const DataTable: React.FC<DataTableProps> = ({
    columns,
    data,
    onEdit,
    onDelete,
    onView,
    loading = false,
    emptyMessage = 'No data available'
}) => {
    if (loading) {
        return (
            <div className="card">
                <div className="card-body" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="spinner"></div>
                </div>
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="card">
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <MoreVertical size={32} />
                    </div>
                    <div className="empty-state-title">No Records Found</div>
                    <div className="empty-state-description">{emptyMessage}</div>
                </div>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="overflow-x-auto">
                <table className="data-table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} style={{ width: col.width }}>
                                    {col.label}
                                </th>
                            ))}
                            {(onEdit || onDelete || onView) && <th style={{ width: '120px' }}>Actions</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row, idx) => (
                            <tr key={idx}>
                                {columns.map((col) => (
                                    <td key={col.key}>
                                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                                    </td>
                                ))}
                                {(onEdit || onDelete || onView) && (
                                    <td>
                                        <div className="flex gap-2">
                                            {onView && (
                                                <button
                                                    onClick={() => onView(row)}
                                                    className="btn btn-icon btn-sm btn-secondary"
                                                    title="View"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                            )}
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(row)}
                                                    className="btn btn-icon btn-sm btn-secondary"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(row)}
                                                    className="btn btn-icon btn-sm btn-danger"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default DataTable;
