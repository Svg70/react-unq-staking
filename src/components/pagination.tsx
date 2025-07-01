import React, { useState, useMemo, useEffect } from 'react';

export function usePagination<T>(data: T[], initialPageSize: number = 10) {
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(initialPageSize);

    const totalPages = Math.ceil(data.length / pageSize);

    const currentPageData = useMemo(() => {
        const start = (page - 1) * pageSize;
        return data.slice(start, start + pageSize);
    }, [data, page, pageSize]);

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    return {
        page,
        setPage,
        pageSize,
        setPageSize,
        totalPages,
        currentPageData,
    };
}

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
};

export const Pagination: React.FC<PaginationProps> = (pros) => {
    const {
        currentPage,
        totalPages,
        onPageChange,
        pageSize,
        onPageSizeChange,
    } = pros;

    const goToPage = (page: number) => {
        if (page < 1 || page > totalPages) return;
        onPageChange(page);
    };

    const renderPages = () => {
        const pages: (number | 'dots')[] = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            pages.push(1);
            if (currentPage > 4) pages.push('dots');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) pages.push(i);

            if (currentPage < totalPages - 3) pages.push('dots');
            pages.push(totalPages);
        }

        return pages.map((page, idx) =>
                page === 'dots' ? (
                    <span key={`dots-${idx}`} className="px-2 text-gray-400">
          ...
        </span>
                ) : (
                    <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-3 py-1 text-sm rounded ${
                            page === currentPage
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                    >
                        {page}
                    </button>
                )
        );
    };

    return (
        <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">Rows per page:</span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="text-sm border rounded px-2 py-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                    {[10, 25, 50].map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-2">
                <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-2 py-1 text-sm rounded text-blue-600 disabled:opacity-50"
                >
                    ← Prev
                </button>

                {renderPages()}

                <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-2 py-1 text-sm rounded text-blue-600 disabled:opacity-50"
                >
                    Next →
                </button>
            </div>
        </div>
    );
};