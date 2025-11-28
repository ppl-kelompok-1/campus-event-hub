import type { UserCategory } from '../auth/api'

interface CategoryDropdownProps {
  value: UserCategory
  onChange: (category: UserCategory) => void
  required?: boolean
  disabled?: boolean
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({
  value,
  onChange,
  required = false,
  disabled = false
}) => {
  const categories: { value: UserCategory; label: string }[] = [
    { value: 'mahasiswa', label: 'Mahasiswa' },
    { value: 'dosen', label: 'Dosen' },
    { value: 'staff', label: 'Staff' }
  ]

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value as UserCategory)
  }

  return (
    <div>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        fontSize: '14px',
        fontWeight: '500',
        color: '#2c3e50'
      }}>
        Category {required && <span style={{ color: '#dc3545' }}>*</span>}
      </label>
      <select
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        style={{
          width: '100%',
          padding: '10px 12px',
          fontSize: '14px',
          border: '1px solid #ced4da',
          borderRadius: '6px',
          backgroundColor: disabled ? '#e9ecef' : 'white',
          cursor: disabled ? 'not-allowed' : 'pointer'
        }}
      >
        <option value="">Select category...</option>
        {categories.map(cat => (
          <option key={cat.value} value={cat.value}>
            {cat.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default CategoryDropdown
