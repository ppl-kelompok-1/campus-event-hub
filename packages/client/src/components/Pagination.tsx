import React from 'react'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (itemsPerPage: number) => void
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange
}) => {
  const itemsPerPageOptions = [10, 20, 50, 100]

  // Calculate the range of items being displayed
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, totalItems)

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxPagesToShow = 7

    if (totalPages <= maxPagesToShow) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 2; i <= 4; i++) {
          pages.push(i)
        }
        pages.push('...')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pages.push('...')
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle
        pages.push('...')
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push('...')
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '16px',
      backgroundColor: '#f8f9fa',
      borderTop: '1px solid #dee2e6',
      borderRadius: '0 0 8px 8px',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      {/* Items per page selector */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        color: '#495057'
      }}>
        <span>Show</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          style={{
            padding: '4px 8px',
            border: '1px solid #ced4da',
            borderRadius: '4px',
            fontSize: '14px',
            cursor: 'pointer',
            backgroundColor: 'white'
          }}
        >
          {itemsPerPageOptions.map(option => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <span>per page</span>
      </div>

      {/* Page info */}
      <div style={{
        fontSize: '14px',
        color: '#6c757d'
      }}>
        Showing {startItem}-{endItem} of {totalItems} results
      </div>

      {/* Pagination controls */}
      <div style={{
        display: 'flex',
        gap: '4px',
        alignItems: 'center'
      }}>
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          style={{
            padding: '6px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            backgroundColor: currentPage === 1 ? '#e9ecef' : 'white',
            color: currentPage === 1 ? '#6c757d' : '#495057',
            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Previous
        </button>

        {/* Page numbers */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                style={{
                  padding: '6px 12px',
                  color: '#6c757d',
                  fontSize: '14px'
                }}
              >
                ...
              </span>
            )
          }

          const pageNum = page as number
          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              style={{
                padding: '6px 12px',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                backgroundColor: currentPage === pageNum ? '#007bff' : 'white',
                color: currentPage === pageNum ? 'white' : '#495057',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: currentPage === pageNum ? '600' : '500',
                minWidth: '40px'
              }}
            >
              {pageNum}
            </button>
          )
        })}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          style={{
            padding: '6px 12px',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            backgroundColor: currentPage === totalPages ? '#e9ecef' : 'white',
            color: currentPage === totalPages ? '#6c757d' : '#495057',
            cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination
