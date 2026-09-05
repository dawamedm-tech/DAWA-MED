import React from 'react';

export interface DawaTableProps extends React.TableHTMLAttributes<HTMLTableElement> {
  containerClassName?: string;
}

export const DawaTable: React.FC<DawaTableProps> = ({
  children,
  className = '',
  containerClassName = '',
  ...props
}) => {
  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-[#E8F5EE] bg-white shadow-[0_2px_8px_rgba(14,122,75,0.02)] ${containerClassName}`}>
      <table className={`w-full text-start text-xs sm:text-sm border-collapse ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

export const DawaThead: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => (
  <thead className={`bg-[#F1FAF4] text-[#0E7A4B] font-bold border-b border-[#E8F5EE] uppercase text-[11px] tracking-wider ${className}`} {...props}>
    {children}
  </thead>
);

export const DawaTbody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, className = '', ...props }) => (
  <tbody className={`divide-y divide-[#E8F5EE] text-neutral-800 ${className}`} {...props}>
    {children}
  </tbody>
);

export const DawaTr: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, className = '', ...props }) => (
  <tr className={`hover:bg-[#F1FAF4]/50 transition-colors ${className}`} {...props}>
    {children}
  </tr>
);

export const DawaTh: React.FC<React.ThHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <th className={`px-3.5 sm:px-4 py-3 text-start font-bold whitespace-nowrap ${className}`} {...props}>
    {children}
  </th>
);

export const DawaTd: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className = '', ...props }) => (
  <td className={`px-3.5 sm:px-4 py-3 whitespace-nowrap ${className}`} {...props}>
    {children}
  </td>
);
