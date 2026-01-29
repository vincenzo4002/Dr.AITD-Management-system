import React from 'react';

export const Table = ({ children, className = '' }) => (
  <div className={`w-full overflow-x-auto rounded-2xl border border-gray-100 shadow-lg shadow-gray-200/20 ${className}`}>
    <table className="w-full text-left text-sm">
      {children}
    </table>
  </div>
);

export const TableHeader = ({ children, className = '' }) => (
  <thead className={`bg-gray-50/50 border-b border-gray-100 text-text-secondary font-semibold uppercase tracking-wider text-xs ${className}`}>
    {children}
  </thead>
);

export const TableBody = ({ children, className = '' }) => (
  <tbody className={`divide-y divide-gray-50 bg-white ${className}`}>
    {children}
  </tbody>
);

export const TableRow = ({ children, className = '', onClick }) => (
  <tr
    className={`hover:bg-primary/5 transition-colors duration-150 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </tr>
);

export const TableHead = ({ children, className = '' }) => (
  <th className={`px-6 py-4 font-semibold text-secondary/80 ${className}`}>
    {children}
  </th>
);

export const TableCell = ({ children, className = '' }) => (
  <td className={`px-6 py-4 whitespace-nowrap text-text-secondary font-medium ${className}`}>
    {children}
  </td>
);

export default Table;